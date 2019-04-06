import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-window-scroll-button',
  templateUrl: './window-scroll.component.html',
  styleUrls: ['./window-scroll.component.css']
})
export class WindowScrollComponent implements OnInit {

  showScroller: boolean;

  constructor(public el: ElementRef) { }

  ngOnInit() {
    this.showScroller = false;
  }

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    const scrollPosition = window.pageYOffset;
    if (scrollPosition >= 50) {
      this.showScroller = true;
    } else {
      this.showScroller = false;
    }

  }

  toTheTop(): void {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

}
