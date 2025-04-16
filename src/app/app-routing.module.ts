import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { MonthlyComponent } from './pages/monthly/monthly.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { AuthComponent } from './pages/auth/auth.component';

import { AuthGuard } from '../app/pages/auth/auth.guard';
import { BillsComponent } from './pages/bills/bills.component';


const routes: Routes = [
  { path: '', component: AboutComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'monthly', component: MonthlyComponent, canActivate: [AuthGuard] },
  { path: 'expenses', component: ExpensesComponent, canActivate: [AuthGuard] },
  {
    path: 'bills',
    component: BillsComponent
  },
  
  // fallback
  { path: '**', redirectTo: '' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
