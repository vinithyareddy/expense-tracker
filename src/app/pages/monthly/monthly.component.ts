import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { getAuth } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirestoreBillService } from 'src/app/services/firestore-bill.service';



export interface Expense extends firebase.firestore.DocumentData {
  id?: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  method: string;
  location: string;
  uid?: string; // 🔑 Optional if not already in schema
}

interface MonthlySummary {
  monthYear: string;
  received: number;
  spent: number;
  saved: number;
}

@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.component.html',
  styleUrls: ['./monthly.component.scss']
})
export class MonthlyComponent implements OnInit {
  monthlySummaries: MonthlySummary[] = [];
  filterText: string = '';

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth, private firestoreBillService: FirestoreBillService) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        console.warn('User not authenticated!');
        return;
      }
  
      this.firestore.collection<Expense>('expenses', ref =>
        ref.where('userId', '==', user.uid)
      ).valueChanges().subscribe((data: Expense[]) => {
        const grouped: { [monthYear: string]: { received: number; spent: number } } = {};
  
        data.forEach(expense => {
          const date = (expense.date as any)?.toDate?.() ?? new Date(expense.date);
          if (isNaN(date.getTime())) return;
  
          const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
          const isIncome = expense.category.toLowerCase() === 'income';
  
          if (!grouped[key]) {
            grouped[key] = { received: 0, spent: 0 };
          }
  
          if (isIncome) {
            grouped[key].received += expense.amount;
          } else {
            grouped[key].spent += expense.amount;
          }
        });
  
        this.monthlySummaries = Object.entries(grouped).map(([monthYear, { received, spent }]) => ({
          monthYear,
          received,
          spent,
          saved: received - spent
        }));
      });
    });
    this.firestoreBillService.billChanged$.subscribe(() => {
      // ⏬ Call your logic again to refresh data
      this.ngOnInit();
    });
  }

  filteredSummaries(): MonthlySummary[] {
    if (!this.filterText) return this.monthlySummaries;

    const lower = this.filterText.toLowerCase();
    return this.monthlySummaries.filter(summary =>
      summary.monthYear.toLowerCase().includes(lower) ||
      summary.received.toString().includes(lower) ||
      summary.spent.toString().includes(lower) ||
      summary.saved.toString().includes(lower)
    );
  }
}
