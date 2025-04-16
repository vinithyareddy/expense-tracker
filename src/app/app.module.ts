import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthComponent } from './pages/auth/auth.component';
import { ChangePasswordDialogComponent } from '../app/pages/ChangePasswordDialogComponent/change-password-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';



// Import the CurrencyService from the correct path
import { CurrencyService } from './services/currency.service';  // Ensure this path is correct

import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { MonthlyComponent } from './pages/monthly/monthly.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { NavbarComponent } from './shared/navbar/navbar.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { environment } from '../environments/environment';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';


import { CommonModule } from '@angular/common';
import { BillsComponent } from './pages/bills/bills.component';





@NgModule({
  declarations: [
    AppComponent,
    ChangePasswordDialogComponent,
    AboutComponent,
    HomeComponent,
    MonthlyComponent,
    ExpensesComponent,
    NavbarComponent,
    AuthComponent,
    BillsComponent
  ],
  imports: [
    MatDividerModule,
    MatDialogModule,
    BrowserModule,
    CommonModule,
    MatMenuModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    // Firebase
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,

    // Angular Material
    MatToolbarModule,
    MatSnackBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,

    FormsModule,
    NgChartsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  providers: [CurrencyService],  // Add CurrencyService here
  bootstrap: [AppComponent]
})
export class AppModule { }
