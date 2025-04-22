import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  showPassword = false;
  isLoading = false;
  rememberMe = true;

  email = '';
  password = '';
  name = '';
  phone = '';
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onToggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm): void {
    if (!this.isLoginMode && this.password !== this.confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (form.invalid) return;

    this.isLoading = true;
    const { name, phone, email, password } = form.value;
    const persistence = this.rememberMe ? 'local' : 'session';

    let authPromise: Promise<any>;

    this.authService.setPersistence(persistence)
      .then(() => {
        authPromise = this.isLoginMode
          ? this.authService.login(email, password)
          : this.authService.register(name, phone, email, password);
        return authPromise;
      })
      .then(() => {
        const message = this.isLoginMode ? 'Login successful!' : 'Registration successful!';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/home']);
      })
      .catch(err => {
        console.error('Firebase Auth Error:', err);
        let message = 'Something went wrong.';
        if (
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-login-credentials'
        ) {
          message = 'Incorrect email or password.';
        } else if (err.code === 'auth/email-already-in-use') {
          message = 'Email already in use. Try logging in.';
        } else if (err.code === 'auth/invalid-email') {
          message = 'Invalid email address.';
        } else if (err.code === 'auth/weak-password') {
          message = 'Password must be at least 6 characters.';
        }

        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      })
      .finally(() => {
        this.isLoading = false;
      });


  }

  onForgotPassword(): void {
    if (!this.email) {
      this.snackBar.open('Please enter your email first.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.authService.sendPasswordResetEmail(this.email)
      .then(() => {
        this.snackBar.open('Password reset email sent!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      })
      .catch(err => {
        let message = 'Failed to send reset email.';
        if (err.code === 'auth/user-not-found') message = 'No account found with this email.';
        else if (err.code === 'auth/invalid-email') message = 'Invalid email address.';

        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      });
  }
}
