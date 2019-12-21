import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  private elemOffset(el) {
    let rect = el.getBoundingClientRect();
    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: Math.max(0, rect.top + scrollTop - 100), left: rect.left + scrollLeft };
  }

  scrollToElement(id: string) {
    let div = document.querySelector(id);
    let divOffset = this.elemOffset(div);
    try {
      window.scrollTo({ top: divOffset.top, left: divOffset.left, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(divOffset.top, divOffset.left);
    }
  }

}
