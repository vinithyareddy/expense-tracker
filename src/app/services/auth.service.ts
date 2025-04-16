import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  // 🔐 Login with email & password
  login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // 📝 Register and update displayName & phone (stored in photoURL for simplicity)
  register(name: string, phone: string, email: string, password: string): Promise<void> {
    return this.afAuth.createUserWithEmailAndPassword(email, password).then(userCredential => {
      return userCredential.user?.updateProfile({
        displayName: name,
        photoURL: phone
      }) as Promise<void>; // 👈 explicitly cast to match return type
    });
  }

  // 🔓 Logout
  logout(): Promise<void> {
    return this.afAuth.signOut();
  }

  // 👤 Observe current user
  getCurrentUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }
  sendPasswordResetEmail(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }
  setPersistence(persistence: 'local' | 'session' | 'none') {
    return this.afAuth.setPersistence(persistence);
  }
  
}
