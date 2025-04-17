export interface Bill {
    type: 'credit' | 'regular' | 'loan';
    amount: number;
    monthlyPayment?: number;
    installments: number;
    paidCount: number;
    dueDate: string | Date;
    paymentHistory?: number[];     // stores timestamps when installment paid
    loanDirection?: 'give' | 'take'; // only for personal loans
    noMonthlyPayment?: boolean;

  }
  
  