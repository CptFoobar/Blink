import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];
  private readonly MAX_TOASTS = 5;

  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
    if (this.toasts.length > this.MAX_TOASTS) {
      this.toasts.splice(0, 1);
    }
  }

  showSuccess(message: string) {
    this.show(message, { classname: 'bg-success text-light noselect bl-toast', delay: 2500 });
  }

  showWarning(message: string) {
    this.show(message, { classname: 'bg-warning text-light noselect bl-toast', delay: 2500 });
  }

  showError(message: string) {
    this.show(message, { classname: 'bg-danger text-light noselect bl-toast', delay: 2500 });
  }

  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  clear() {
    this.toasts = [];
  }
}
