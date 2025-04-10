import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

export interface Expense extends firebase.firestore.DocumentData {
  id?: string;
  date: any;
  amount: number;
  category: string;
  description: string;
  method: string;
  location: string;
}

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {
  displayedColumns: string[] = ['date', 'amount', 'category', 'description', 'method', 'location', 'actions'];
  expenseList: Expense[] = [];
  dataSource = new MatTableDataSource<Expense>([]);

  newExpense: Expense = {
    date: '',
    amount: 0,
    category: '',
    description: '',
    method: '',
    location: ''
  };

  constructor(private firestore: AngularFirestore) {
    this.loadExpenses();
  }

  loadExpenses() {
    this.firestore.collection<Expense>('expenses').valueChanges({ idField: 'id' }).subscribe((data: Expense[]) => {
      this.expenseList = data;
      this.dataSource.data = this.expenseList;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  async addExpense() {
    const { date, amount, category, description, method, location } = this.newExpense;

    if (date && amount && category && description && method && location) {
      await this.firestore.collection('expenses').add({
        date: new Date(date + 'T12:00:00') , // ✅ Forces local timezone midday
        amount,
        category,
        description,
        method,
        location
      });
      

      this.newExpense = {
        date: '',
        amount: 0,
        category: '',
        description: '',
        method: '',
        location: ''
      };
    } else {
      alert('All fields are required.');
    }
  }

  deleteExpense(id: string) {
    this.firestore.doc(`expenses/${id}`).delete();
  }
  formatDate(date: any): string {
    if (date?.toDate) {
      return new Date(date.toDate()).toISOString().substring(0, 10); // Formats as yyyy-MM-dd
    } else if (typeof date === 'string' || date instanceof Date) {
      return new Date(date).toISOString().substring(0, 10);
    }
    return '';
  }
  
}
