import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../core/services/toast.service';

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
          [class.toast-leaving]="toast.leaving"
          role="alert"
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
      gap: 10px;
      max-width: 420px;
      width: calc(100vw - 48px);

      @media (max-width: 480px) {
        bottom: 16px;
        right: 12px;
        left: 12px;
        width: auto;
      }
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      font-size: 0.875rem;
      font-family: var(--font-body);
      will-change: opacity, transform;
      animation: toastIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;

      &.toast-leaving {
        animation: toastOut 0.28s cubic-bezier(0.4, 0, 0.2, 1) both;
      }
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(110%) scale(0.92); }
      to   { opacity: 1; transform: translateX(0)   scale(1); }
    }

    @keyframes toastOut {
      from { opacity: 1; transform: translateX(0)   scale(1); }
      to   { opacity: 0; transform: translateX(110%) scale(0.92); }
    }

    .toast-success { background: #2F7D59; color: white; }
    .toast-error   { background: #B23A48; color: white; }
    .toast-warning { background: #8B6A19; color: white; }
    .toast-info    { background: #1E5AA8; color: white; }

    .toast-icon    { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
    .toast-message { flex: 1; line-height: 1.5; }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.7);
      padding: 0;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      border-radius: 4px;
      transition: color 0.15s;

      mat-icon { font-size: 18px; }
      &:hover { color: white; }
    }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);

  icon(type: string): string {
    const map: Record<string, string> = {
      success: 'check_circle',
      error:   'error',
      warning: 'warning',
      info:    'info',
    };
    return map[type] ?? 'notifications';
  }
}
