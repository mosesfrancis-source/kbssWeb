import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class]="'toast-' + toast.type"
          role="alert"
          [@slideIn]
        >
          <mat-icon class="toast-icon">{{ icon(toast.type) }}</mat-icon>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Dismiss">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-width: 420px;
      width: calc(100vw - 48px);
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      font-size: 0.875rem;
      font-family: var(--font-body);
    }

    .toast-success { background: var(--color-success); color: white; }
    .toast-error   { background: var(--color-error);   color: white; }
    .toast-warning { background: var(--color-warning);  color: white; }
    .toast-info    { background: var(--color-primary);  color: white; }

    .toast-icon { font-size: 20px; flex-shrink: 0; }
    .toast-message { flex: 1; line-height: 1.4; padding-top: 2px; }
    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.75);
      padding: 0;
      flex-shrink: 0;
      display: flex;
      align-items: center;

      mat-icon { font-size: 18px; }
      &:hover { color: white; }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%) scale(0.9)' }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateX(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, transform: 'translateX(100%) scale(0.9)' })),
      ]),
    ]),
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);

  icon(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle', error: 'error', warning: 'warning', info: 'info',
    };
    return icons[type] ?? 'notifications';
  }
}
