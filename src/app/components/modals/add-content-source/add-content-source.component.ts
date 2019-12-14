import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-content-source',
  templateUrl: './add-content-source.component.html',
  styleUrls: ['./add-content-source.component.css']
})
export class AddContentSourceComponent {
  showProgressbar: boolean;
  constructor(public activeModal: NgbActiveModal) {
    this.showProgressbar = false;
  }

}
