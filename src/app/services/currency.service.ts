import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private conversionRate = 0.012;  // 1 INR = 0.012 USD (you can update this value)

  // Convert INR to USD
  convertToUSD(amount: number): number {
    return amount * this.conversionRate;
  }

  // If you want to change the conversion rate dynamically, you can add a method here
  updateConversionRate(newRate: number): void {
    this.conversionRate = newRate;
  }
}
