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

  updateConversionRate(newRate: number): void {
    this.conversionRate = newRate;
  }
}
