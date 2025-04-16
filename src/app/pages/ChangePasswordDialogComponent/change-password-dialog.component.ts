import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  User
} from 'firebase/auth';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  async changePassword(): Promise<void> {
    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('New passwords do not match.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const auth = getAuth();
    const user: User | null = auth.currentUser;

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, this.currentPassword);

      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, this.newPassword);
        this.snackBar.open('Password updated successfully.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.dialogRef.close();
      } catch (error: any) {
        let msg = 'Failed to update password.';
        if (error.code === 'auth/wrong-password') {
          msg = 'Incorrect current password.';
        } else if (error.code === 'auth/weak-password') {
          msg = 'New password must be at least 6 characters.';
        }
        this.snackBar.open(msg, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    } else {
      this.snackBar.open('No authenticated user found.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }
}
