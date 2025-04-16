import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'expense-tracker';


constructor(private router: Router) {}

shouldShowNavbar(): boolean {
  return !['/about', '/auth'].includes(this.router.url);
}
}
