import { Component, TemplateRef } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css'],
  host: {'[class.ngb-toasts]': 'true'}
})
export class ToastContainerComponent {
  defaultDelay = 2500;
  constructor(public toastService: ToastService) { }
  isTemplate(toast) { return toast.textOrTpl instanceof TemplateRef; }

}
