import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { Bill } from '../models/bill.model';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreBillService {
  constructor(private afs: AngularFirestore, private auth: AuthService) {}

  private get userId$() {
    return this.auth.user$.pipe(map(user => user?.uid));
  }

  getBills() {
    return this.userId$.pipe(
      switchMap(uid => {
        if (!uid) return of([]);
        return this.afs.collection<Bill>(`users/${uid}/bills`).valueChanges({ idField: 'id' });
      })
    );
  }

  addBill(bill: Bill) {
    return this.userId$.pipe(
      switchMap(uid => {
        if (!uid) return of(null);
        return this.afs.collection<Bill>(`users/${uid}/bills`).add(bill);
      })
    );
  }

  updateBill(bill: Bill) {
    return this.userId$.pipe(
      switchMap(uid => {
        if (!uid || !bill.id) return of(null);
        return this.afs.doc<Bill>(`users/${uid}/bills/${bill.id}`).update(bill);
      })
    );
  }

  deleteBill(billId: string) {
    return this.userId$.pipe(
      switchMap(uid => {
        if (!uid) return of(null);
        return this.afs.doc<Bill>(`users/${uid}/bills/${billId}`).delete();
      })
    );
  }
}
