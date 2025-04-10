// ✅ monthly.component.ts
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';


export interface Expense extends firebase.firestore.DocumentData {
  id?: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  method: string;
  location: string;
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

  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.firestore.collection<Expense>('expenses').valueChanges().subscribe((data: Expense[]) => {
      const grouped: { [monthYear: string]: { received: number; spent: number } } = {};

      data.forEach(expense => {
        const date =
        (expense.date as any)?.toDate?.() ?? new Date(expense.date);      
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
  }
}
