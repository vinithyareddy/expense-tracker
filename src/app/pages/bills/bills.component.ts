import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddBillDialogComponent } from '../add-bill-dialog/add-bill-dialog.component';
import { Bill } from '../../models/bill.model';
import { DataSyncService } from 'src/app/services/data-sync.service'; // adjust path if needed
import { FirestoreBillService } from 'src/app/services/firestore-bill.service';


@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss']
})
export class BillsComponent implements OnInit {
  selectedBillType = 'credit';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: { date: Date, dueBills: any[] }[] = [];

  allBills: any[] = [];
  personalLoanAmount: number = 0;
  hoveredDay: any = null;
  tooltipX = 0;
  tooltipY = 0;
  totalDue: number = 0;
  totalPaid: number = 0;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  years: number[] = [];

  constructor(private dialog: MatDialog,   private dataSyncService: DataSyncService, private firestoreBillService: FirestoreBillService // ✅ inject here
  ) { }

  ngOnInit(): void {
    this.firestoreBillService.getBills().subscribe((bills: Bill[]) => {
      this.allBills = bills.map(bill => ({
        ...bill,
        paidCount: bill.paidCount ?? 0,
        installments: bill.installments ?? (
          bill.monthlyPayment && bill.amount
            ? Math.ceil(bill.amount / bill.monthlyPayment)
            : 1
        ),
        monthlyPayment: bill.monthlyPayment ?? 0,
        paymentHistory: Array.isArray(bill.paymentHistory) ? bill.paymentHistory : [],
        loanDirection: bill.type === 'loan' ? (bill.loanDirection ?? 'give') : undefined
      }));
  
      this.updatePersonalLoanAmount();
      this.calculateTotals();
      this.refreshCalendar();
      this.updateCardBalanceHistory();
    });
  }
  


  refreshCalendar(): void {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    const days: { date: Date, dueBills: any[] }[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push({ date: new Date(0), dueBills: [] });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(this.currentYear, this.currentMonth, i);
      const dueBills = this.allBills.filter((bill) => {
        const originalDue = bill.dueDate ? new Date(bill.dueDate) : null;
        if (!originalDue || bill.paidCount >= bill.installments) return false;

        const monthsSinceDue =
          (this.currentYear - originalDue.getFullYear()) * 12 +
          (this.currentMonth - originalDue.getMonth());

        return (
          monthsSinceDue >= 0 &&
          monthsSinceDue < bill.installments &&
          currentDate.getDate() === originalDue.getDate()
        );
      });

      days.push({ date: currentDate, dueBills });
    }

    this.calendarDays = days;
  }

  openAddBillDialog(): void {
    const dialogRef = this.dialog.open(AddBillDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.installments = result.monthlyPayment && result.monthlyPayment > 0
          ? Math.ceil(result.amount / result.monthlyPayment)
          : 1;
        result.paidCount = 0;
        this.allBills.push(result);
        this.saveToStorage();
        this.updatePersonalLoanAmount();
        this.calculateTotals();
        this.refreshCalendar();
        this.updateTotalCreditCardAmount();

      }
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cardBalanceHistory',
        newValue: localStorage.getItem('cardBalanceHistory') || ''
      }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'totalCreditCardAmount',
        newValue: localStorage.getItem('totalCreditCardAmount') || ''
      }));
      
    });
  }

  saveToStorage(): void {
    localStorage.setItem('bills', JSON.stringify(this.allBills));
  }

  get creditBills() {
    return this.allBills.filter(bill => {
      const paidCount = bill.paidCount || 0;
      const installments = bill.installments || 1;
      const monthly = bill.monthlyPayment || 0;

      const isNotFullyPaid = paidCount < installments;
      const isCreditCard = bill.type === 'credit';

      return isCreditCard && isNotFullyPaid;
    });
  }

  get regularBills() {
    return this.allBills.filter(bill => {
      const paidCount = bill.paidCount || 0;
      const installments = bill.installments || 1;
      return bill.type === 'regular' && paidCount < installments;
    });
  }

  get loanBills() {
    return this.allBills.filter(bill => {
      const paidCount = bill.paidCount || 0;
      const installments = bill.installments || 1;
      return bill.type === 'loan' && paidCount < installments;
    });
  }

  getMonthName(index: number): string {
    return this.months[index];
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.calculateTotals();
    this.refreshCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.calculateTotals();
    this.refreshCalendar();
  }

  markInstallmentPaid(bill: any): void {
    bill.paidCount = (bill.paidCount || 0) + 1;

    if (!bill.paymentHistory) {
      bill.paymentHistory = [];
    }
    bill.paymentHistory.push(Date.now());

    this.saveToStorage();
    this.updateCardBalanceHistory();
    this.calculateTotals();
    this.refreshCalendar();
    this.updateTotalCreditCardAmount();

  }

  updateCardBalanceHistory(): void {
    const stored = localStorage.getItem('bills');
    const bills: Bill[] = stored ? JSON.parse(stored) : [];
    const creditBills = bills.filter(b => b.type === 'credit');

    let totalRemaining = 0;
    creditBills.forEach(bill => {
      const paid = (bill.paidCount || 0) * (bill.monthlyPayment || 0);
      const remaining = Math.max(bill.amount - paid, 0);
      totalRemaining += remaining;
    });

    const now = new Date();
    const currentMonthKey = `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

    const history = JSON.parse(localStorage.getItem('cardBalanceHistory') || '{}');
    history[currentMonthKey] = totalRemaining;

    localStorage.setItem('cardBalanceHistory', JSON.stringify(history));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cardBalanceHistory',
      newValue: JSON.stringify(history)
    }));
  }

  deleteBill(bill: any): void {
    const index = this.allBills.indexOf(bill);
    if (index > -1) {
      this.allBills.splice(index, 1);
      this.saveToStorage();
      this.updatePersonalLoanAmount();
      this.calculateTotals();
      this.refreshCalendar();
      this.updateTotalCreditCardAmount();
      this.updateCardBalanceHistory(); // ✅ make sure balance history updates

      // ✅ Clear total credit if no credit bills left
      const creditBills = this.allBills.filter(b => b.type === 'credit');
      if (creditBills.length === 0) {
        localStorage.setItem('totalCreditCardAmount', '0');
        

        const now = new Date();
        const currentMonthKey = `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
        const history = JSON.parse(localStorage.getItem('cardBalanceHistory') || '{}');
        history[currentMonthKey] = 0;
        localStorage.setItem('cardBalanceHistory', JSON.stringify(history));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'totalCreditCardAmount',
          newValue: '0'
        }));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'cardBalanceHistory',
          newValue: JSON.stringify(history)
        }));
      }
    }
  }


  updateTooltipPosition(event: MouseEvent): void {
    this.tooltipX = event.clientX + 10;
    this.tooltipY = event.clientY + 20;
  }

  updatePersonalLoanAmount(): void {
    let total = 0;
    for (let loan of this.loanBills) {
      total += loan.loanDirection === 'give' ? loan.amount : -loan.amount;
    }
    this.personalLoanAmount = total;
  }
  calculateTotals(): void {
    let due = 0;
    let paid = 0;

    const selectedMonth = this.currentMonth;
    const selectedYear = this.currentYear;

    for (let bill of this.allBills) {
      const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
      const monthly = bill.monthlyPayment || 0;
      const paidCount = bill.paidCount || 0;
      const installments = bill.installments || 1;
      const isFullyPaid = paidCount >= installments;

      // 🚫 Skip loan 'give'
      if (bill.type === 'loan' && bill.loanDirection === 'give') continue;

      // ✅ Count paid this month
      let paidThisMonth = 0;
      if (Array.isArray(bill.paymentHistory)) {
        for (let ts of bill.paymentHistory) {
          const dt = new Date(ts);
          if (dt.getMonth() === selectedMonth && dt.getFullYear() === selectedYear) {
            paid += monthly > 0 ? monthly : bill.amount;
            paidThisMonth += 1;
          }
        }
      }

      // ✅ TOTAL DUE
      if (!isFullyPaid && dueDate) {
        const monthsSinceStart =
          (selectedYear - dueDate.getFullYear()) * 12 +
          (selectedMonth - dueDate.getMonth());

        const monthsDue = Math.min(installments - paidCount, monthsSinceStart + 1);
        if (monthsDue > 0) {
          // Subtract the count of this month's payments from the due
          const effectiveDueCount = Math.max(monthsDue - paidThisMonth, 0);
          if (monthsDue > 0 && effectiveDueCount > 0) {
            due += (monthly > 0 ? monthly : bill.amount) * effectiveDueCount;
          }
        }
      }
    }

    this.totalDue = due;
    this.totalPaid = paid;

    console.log({
      selectedMonth,
      selectedYear,
      totalDue: this.totalDue,
      totalPaid: this.totalPaid,
      allBills: this.allBills
    });
  }

  updateTotalCreditCardAmount(): void {
    const creditBills = this.allBills.filter(b => b.type === 'credit');
    let total = 0;
    const now = new Date();
    const currentMonthKey = `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

    const history = JSON.parse(localStorage.getItem('cardBalanceHistory') || '{}');
    history[currentMonthKey] = total;

    localStorage.setItem('cardBalanceHistory', JSON.stringify(history));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'totalCreditCardAmount',
      newValue: JSON.stringify(total)
    }));


    for (let bill of creditBills) {
      const paidAmount = (bill.paidCount || 0) * (bill.monthlyPayment || 0);
      const remaining = Math.max(bill.amount - paidAmount, 0);
      total += remaining;
    }

    localStorage.setItem('totalCreditCardAmount', JSON.stringify(total));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'totalCreditCardAmount',
      newValue: JSON.stringify(total)
    }));
  }


}
