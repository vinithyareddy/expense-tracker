import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth) {
    this.user$ = this.afAuth.authState;
  }

  login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  register(name: string, phone: string, email: string, password: string): Promise<void> {
    return this.afAuth.createUserWithEmailAndPassword(email, password).then(userCredential => {
      return userCredential.user?.updateProfile({
        displayName: name,
        photoURL: phone
      }) as Promise<void>;
    });
  }

  logout(): Promise<void> {
    return this.afAuth.signOut();
  }

  getCurrentUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  sendPasswordResetEmail(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  setPersistence(persistence: 'local' | 'session' | 'none'): Promise<void> {
    return this.afAuth.setPersistence(persistence);
  }
  getCurrentUID(): Promise<string | null> {
    return this.afAuth.currentUser.then(user => user?.uid || null);
  }

}
