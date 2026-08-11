import { Injectable, signal } from '@angular/core';

import { Toast, ToastType } from './toast.models';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;

  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const toast: Toast = {
      id: ++this.nextId,
      message,
      type,
      duration,
    };

    this._toasts.update((toasts) => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  remove(id: number): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
