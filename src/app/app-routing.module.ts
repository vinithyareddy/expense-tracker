import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { MonthlyComponent } from './pages/monthly/monthly.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { AuthComponent } from './pages/auth/auth.component';

import { AuthGuard } from '../app/pages/auth/auth.guard';
import { BillsComponent } from './pages/bills/bills.component';
import { OverviewComponent } from './pages/overview/overview.component';


const routes: Routes = [
//   { path: '', component: AboutComponent },
//   { path: 'auth', component: AuthComponent },
//   { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard] },
//   { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
//   { path: 'monthly', component: MonthlyComponent, canActivate: [AuthGuard] },
//   { path: 'expenses', component: ExpensesComponent, canActivate: [AuthGuard] },
//   {
//     path: 'bills',
//     component: BillsComponent
//   },
  
//   // fallback
//   { path: '**', redirectTo: '' }
// ];
{ path: '', redirectTo: 'about', pathMatch: 'full' },
{ path: 'about', component: AboutComponent },
{ path: 'auth', component: AuthComponent },

// Protected Routes (only after login)
{
  path: '',
  canActivate: [AuthGuard],
  children: [
    { path: 'overview', component: OverviewComponent },
    { path: 'home', component: HomeComponent },
    { path: 'monthly', component: MonthlyComponent },
    { path: 'add-remove', component: ExpensesComponent },
    { path: 'bills', component: BillsComponent }
  ]
},

{ path: '**', redirectTo: 'about' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
