import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSyncService {
  private billUpdateSource = new Subject<void>();
  billUpdates$ = this.billUpdateSource.asObservable();

  notifyBillUpdate() {
    this.billUpdateSource.next();
  }
}
