import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  constructor(private router: Router) {}
  ngOnInit() {
    if (localStorage.getItem('user')) {
      this.router.navigate(['/overview']);
    }
  }
  
  goHome() {
    this.router.navigate(['/auth']);
  }
}
