import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-bill-dialog',
  templateUrl: './add-bill-dialog.component.html',
  styleUrls: ['./add-bill-dialog.component.scss']
})
export class AddBillDialogComponent {
  bill = {
    type: 'regular',
    name: '',
    amount: null as number | null,
    dueDate: null as Date | null,
    autoDueDate: false,
    category: '',
    monthlyPayment: null as number | null,
    noMonthlyPayment: false,
    repeatMonthly: false,  // ✅ new
    loanDirection: 'give',
    loaner: '',
    borrower: ''
  };

  constructor(private dialogRef: MatDialogRef<AddBillDialogComponent>) { }

  close(): void {
    this.dialogRef.close();
  }

  addBill(): void {
    if (this.bill.autoDueDate && this.calculatedDueDate) {
      this.bill.dueDate = this.calculatedDueDate;
    }

    const result = {
      ...this.bill,
      noMonthlyPayment: this.bill.noMonthlyPayment,
      repeatMonthly: this.bill.repeatMonthly,
    };

    this.dialogRef.close(result);
  }

  get calculatedInstallments(): number | null {
    if (
      this.bill.amount !== null &&
      this.bill.monthlyPayment !== null &&
      !this.bill.noMonthlyPayment &&
      this.bill.amount > 0 &&
      this.bill.monthlyPayment > 0
    ) {
      return Math.ceil(this.bill.amount / this.bill.monthlyPayment);
    }
    return null;
  }

  get calculatedDueDate(): Date | null {
    if (this.bill.autoDueDate && this.calculatedInstallments) {
      const due = new Date();
      due.setMonth(due.getMonth() + this.calculatedInstallments);
      return due;
    }
    return null;
  }

  get installmentInfo(): string {
    const months = this.calculatedInstallments;
    if (
      ['regular', 'credit'].includes(this.bill.type) &&
      months &&
      !this.bill.noMonthlyPayment
    ) {
      return `0 of ${months} installments`;
    }
    return '';
  }

  get repeatsText(): string {
    const months = this.calculatedInstallments;
    if (months && !this.bill.noMonthlyPayment && this.bill.repeatMonthly) {
      return `🔁 Repeats monthly for ${months} month${months > 1 ? 's' : ''}`;
    }
    return '';
  }
}
