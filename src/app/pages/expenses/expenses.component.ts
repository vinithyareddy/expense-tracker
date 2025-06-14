import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';


export interface Expense extends firebase.firestore.DocumentData {
  id?: string;
  date: any;
  amount: number;
  category: string;
  description: string;
  method: string;
}

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {
  displayedColumns: string[] = ['date', 'amount', 'category', 'description', 'method', 'actions'];
  expenseList: Expense[] = [];
  dataSource = new MatTableDataSource<Expense>([]);

  newExpense: Expense = {
    date: '',
    amount: 0,
    category: '',
    description: '',
    method: ''
  };

  editMode = false;
  editingExpenseId: string | null = null;
  showForm = false;

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) { this.loadExpenses(); }


  async loadExpenses() {
    const user = await this.auth.currentUser;
    if (!user) {
      this.expenseList = [];
      this.dataSource.data = [];
      return;
    }

    this.firestore.collection<Expense>('expenses', ref =>
      ref.where('userId', '==', user.uid).orderBy('date', 'desc')
    ).valueChanges({ idField: 'id' }).subscribe((data: Expense[]) => {
      console.log('📥 Fetched expenses:', data); // optional debug
      this.expenseList = data;
      this.dataSource.data = this.expenseList;
    });
  }


  // 🔍 Search/filter table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // ➕ Open form for new expense
  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  // 🧹 Reset form fields
  resetForm() {
    this.newExpense = {
      date: '',
      amount: 0,
      category: '',
      description: '',
      method: '',
    };
    this.editMode = false;
    this.editingExpenseId = null;
  }

  // ✏️ Load selected row into form for editing
  startEdit(expense: Expense) {
    this.newExpense = {
      ...expense,
      date: this.formatDate(expense.date)
    };
    this.editingExpenseId = expense.id ?? null;
    this.editMode = true;
    this.showForm = true;
  }

  // ✅ Add or Update expense
  async submitExpense() {
    const { date, amount, category, description, method } = this.newExpense;

    if (date && amount && category && description && method) {
      const user = firebase.auth().currentUser;
      if (!user) {
        alert('You must be logged in to add expenses.');
        return;
      }

      const payload = {
        date: firebase.firestore.Timestamp.fromDate(new Date(date + 'T12:00:00')),
        amount,
        category,
        description,
        method,
        userId: user.uid
      };

      if (this.editMode && this.editingExpenseId) {
        await this.firestore.collection('expenses').doc(this.editingExpenseId).update(payload);
      } else {
        await this.firestore.collection('expenses').add(payload);
        console.log("✅ Expense added. Reloading...");

      }

      this.resetForm();
      this.showForm = false;

      // ✅ Load latest expenses again
      await this.loadExpenses();
    } else {
      alert('Please fill in all fields.');
    }
  }



  // ❌ Cancel edit or form
  cancelEdit() {
    this.resetForm();
    this.showForm = false;
  }


  // 🗑️ Delete a record
  deleteExpense(id: string) {
    this.firestore.doc(`expenses/${id}`).delete();
  }

  // 📅 Format date for input compatibility
  formatDate(date: any): string {
    if (date?.toDate) {
      return new Date(date.toDate()).toISOString().substring(0, 10);
    } else if (typeof date === 'string' || date instanceof Date) {
      return new Date(date).toISOString().substring(0, 10);
    }
    return '';
  }
}
