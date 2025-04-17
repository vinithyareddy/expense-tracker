import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddBillDialogComponent } from '../add-bill-dialog/add-bill-dialog.component';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss'],
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

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    for (let y = 2000; y <= 2040; y++) this.years.push(y);

    const stored = localStorage.getItem('bills');
    this.allBills = stored ? JSON.parse(stored) : [];

    this.updatePersonalLoanAmount();
    this.calculateTotals();
    this.refreshCalendar();
  }

  refreshCalendar(): void {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  
    const days: { date: Date, dueBills: any[] }[] = [];
  
    // Add blank cells before the month starts
    for (let i = 0; i < startDay; i++) {
      days.push({ date: new Date(0), dueBills: [] });
    }
  
    // Now generate each actual calendar day
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
      }
    });
  }

  saveToStorage(): void {
    localStorage.setItem('bills', JSON.stringify(this.allBills));
  }

  get creditBills() {
    return this.allBills.filter(bill => bill.type === 'credit');
  }

  get regularBills() {
    return this.allBills.filter(bill => bill.type === 'regular');
  }

  get loanBills() {
    return this.allBills.filter(bill => bill.type === 'loan');
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
    this.saveToStorage();
    this.calculateTotals();
    this.refreshCalendar();
  }

  deleteBill(bill: any): void {
    const index = this.allBills.indexOf(bill);
    if (index > -1) {
      this.allBills.splice(index, 1);
      this.saveToStorage();
      this.updatePersonalLoanAmount();
      this.calculateTotals();
      this.refreshCalendar();
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

    for (let bill of this.allBills) {
      const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
      const paidInstallments = bill.paidCount || 0;
      const monthly = bill.monthlyPayment || 0;

      // DUE for current month only
      if (
        dueDate &&
        dueDate.getFullYear() <= this.currentYear &&
        dueDate.getMonth() <= this.currentMonth &&
        paidInstallments < bill.installments
      ) {
        if (bill.noMonthlyPayment || !monthly) {
          due += bill.amount;
        } else {
          due += monthly;
        }
      }

      // PAID: always consider paid installments
      if (bill.noMonthlyPayment || !monthly) {
        paid += paidInstallments > 0 ? bill.amount : 0;
      } else {
        paid += paidInstallments * monthly;
      }
    }

    this.totalDue = due;
    this.totalPaid = paid;
    console.log('Due:', due, 'Paid:', paid, 'All Bills:', this.allBills);
  }
}
