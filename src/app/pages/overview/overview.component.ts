import { Component, OnInit, AfterViewInit } from '@angular/core';
import {
  trigger,
  style,
  transition,
  animate
} from '@angular/animations';
import AOS from 'aos';



import gsap from 'gsap';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [
    trigger('titleFadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OverviewComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }
  ngAfterViewInit() {
    setTimeout(() => {
      gsap.from('.app-title', {
        duration: 1.2,
        opacity: 0,
        x: -100,
        rotation: -360,
        ease: 'back.out(1.7)'
      });

      gsap.from('.animate-slide-in', {
        opacity: 0,
        x: -100,
        duration: 0.8,
        stagger: 0.3,
        ease: 'power2.out'
      });
    }, 0);
  }

}
