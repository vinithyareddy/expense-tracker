export interface Bill {
  id?: string;
  type: 'credit' | 'regular' | 'loan';
  amount: number;
  dueDate?: string | Date;
  monthlyPayment?: number;
  paidCount?: number;
  installments?: number;
  paymentHistory?: number[];
  loanDirection?: 'give' | 'take';
  [key: string]: any;
}
