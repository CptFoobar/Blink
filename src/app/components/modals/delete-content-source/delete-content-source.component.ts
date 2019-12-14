import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-content-source',
  templateUrl: './delete-content-source.component.html',
  styleUrls: ['./delete-content-source.component.css']
})
export class DeleteContentSourceComponent {
  @Input() title;
  @Input() icon;

  constructor(public activeModal: NgbActiveModal) {}

}
