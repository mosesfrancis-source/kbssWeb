import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-student-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with school announcements and updates</p>
        </div>
        <button mat-stroked-button (click)="markAll()">
          <mat-icon>done_all</mat-icon> Mark all as read
        </button>
      </div>

      <div class="notif-list">
        @for (n of notifications(); track n.id) {
          <div class="notif-card card" [class.unread]="!n.isRead" (click)="markRead(n.id!)">
            <div class="notif-icon" [class]="'type-' + n.type">
              <mat-icon>{{ typeIcon(n.type) }}</mat-icon>
            </div>
            <div class="notif-body">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-message">{{ n.message }}</div>
              <div class="notif-time">{{ formatDate(n.createdAt) }}</div>
            </div>
            @if (!n.isRead) {
              <div class="unread-dot"></div>
            }
          </div>
        } @empty {
          <div class="empty-notif card">
            <mat-icon>notifications_none</mat-icon>
            <h3>All caught up!</h3>
            <p>No notifications at the moment.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notif-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .notif-card { display: flex; align-items: flex-start; gap: var(--space-4); padding: var(--space-4) var(--space-5); cursor: pointer; transition: all var(--transition-fast); position: relative; &.unread { border-left: 3px solid var(--color-primary); background: var(--color-primary-50); } &:hover { box-shadow: var(--shadow-md); } }
    .notif-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; &.type-announcement { background: var(--color-primary-50); color: var(--color-primary); } &.type-assignment { background: var(--color-warning-bg); color: var(--color-warning); } &.type-result { background: var(--color-success-bg); color: var(--color-success); } &.type-general { background: var(--color-surface-muted); color: var(--color-text-caption); } mat-icon { font-size: 20px; } }
    .notif-body { flex: 1; }
    .notif-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-heading); margin-bottom: 4px; }
    .notif-message { font-size: 0.875rem; color: var(--color-text-caption); line-height: 1.5; margin-bottom: 6px; }
    .notif-time { font-size: 11px; color: var(--color-text-muted); }
    .unread-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0; margin-top: 4px; }
    .empty-notif { text-align: center; padding: var(--space-12); mat-icon { font-size: 48px; color: var(--color-text-muted); display: block; margin-bottom: var(--space-4); } h3 { margin-bottom: var(--space-2); } p { color: var(--color-text-caption); } }
  `],
})
export class StudentNotificationsComponent {
  private notifService = inject(NotificationService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  notifications = toSignal(this.notifService.getNotifications(), { initialValue: [] });

  markRead(id: string): void {
    this.notifService.markAsRead(id).subscribe();
  }

  markAll(): void {
    const uid = this.auth.currentUser()?.uid;
    if (!uid) return;
    this.notifService.markAllAsRead(uid).subscribe(() =>
      this.toast.success('All notifications marked as read.')
    );
  }

  typeIcon(type: string): string {
    const icons: Record<string, string> = {
      announcement: 'campaign', assignment: 'assignment', result: 'grade', admission: 'person_add', general: 'notifications',
    };
    return icons[type] ?? 'notifications';
  }

  formatDate(ts: Timestamp): string {
    if (!ts) return '';
    const d = ts.toDate();
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
}
