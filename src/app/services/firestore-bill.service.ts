import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { Bill } from '../models/bill.model';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import firebase from 'firebase/compat/app';


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
        if (!uid || !bill.id) {
          console.warn('Missing UID or bill ID!', bill);
          return of(null);
        }
  
        const updatedBill = {
          ...bill,
          paymentHistory: (bill.paymentHistory || []).map((d: any) =>
            d instanceof Date
              ? firebase.firestore.Timestamp.fromDate(d)
              : d
          )
        };
  
        return this.afs.doc<Bill>(`users/${uid}/bills/${bill.id}`).update(updatedBill);
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
