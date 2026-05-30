import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  leaving?: boolean;  // true while CSS exit animation plays
}

const EXIT_MS = 280; // must match CSS animation duration

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const id = crypto.randomUUID();
    this.toasts.update((t) => [...t, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void   { this.show(message, 'error', 6000); }
  warning(message: string): void { this.show(message, 'warning'); }
  info(message: string): void    { this.show(message, 'info'); }

  dismiss(id: string): void {
    // 1. Mark as leaving → CSS exit animation starts
    this.toasts.update((t) =>
      t.map((x) => (x.id === id ? { ...x, leaving: true } : x))
    );
    // 2. Remove from array after the animation finishes
    setTimeout(() => {
      this.toasts.update((t) => t.filter((x) => x.id !== id));
    }, EXIT_MS);
  }
}
