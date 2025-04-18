import { Component, OnInit, HostListener } from '@angular/core';
  import { Router } from '@angular/router';
  import firebase from 'firebase/compat/app';
  import { AngularFireAuth } from '@angular/fire/compat/auth';
  import { AuthService } from 'src/app/services/auth.service';
  import { MatDialog } from '@angular/material/dialog';
  import { ChangePasswordDialogComponent } from 'src/app/pages/ChangePasswordDialogComponent/change-password-dialog.component';

  @Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
  })
  export class NavbarComponent implements OnInit {
    user: firebase.User | null = null;
    isMobile: boolean = false;
    mobileMenuOpen: boolean = false;

    constructor(
      private authService: AuthService,
      private afAuth: AngularFireAuth,
      private router: Router,
      private dialog: MatDialog
    ) {}

    ngOnInit() {
      this.authService.getCurrentUser().subscribe(user => this.user = user);
      this.checkScreenSize();
    }

    @HostListener('window:resize')
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768;
    }

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    logout() {
      this.authService.logout().then(() => this.router.navigate(['/auth']));
    }

    openChangePasswordDialog() {
      this.dialog.open(ChangePasswordDialogComponent, {
        width: '400px'
      });
    }
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    }
    
  }