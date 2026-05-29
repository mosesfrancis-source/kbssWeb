import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-portal-navbar',
  standalone: true,
  imports: [
    RouterLink, CommonModule, MatIconModule, MatButtonModule,
    MatBadgeModule, MatMenuModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, FormsModule,
  ],
  template: `
    <header class="portal-navbar">
      <button mat-icon-button (click)="menuToggle.emit()" class="menu-btn" aria-label="Toggle sidebar">
        <mat-icon>{{ sidebarOpen ? 'menu_open' : 'menu' }}</mat-icon>
      </button>

      <!-- Search -->
      <div class="search-bar">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          type="text"
          placeholder="Search students, classes, results..."
          class="search-input"
          [(ngModel)]="searchQuery"
          (keyup.enter)="onSearch()"
        />
      </div>

      <div class="portal-nav-actions">
        <!-- Theme toggle -->
        <button mat-icon-button (click)="theme.toggle()" matTooltip="Toggle theme" class="action-btn">
          <mat-icon>{{ theme.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <!-- Notifications -->
        <button
          mat-icon-button
          [matMenuTriggerFor]="notifMenu"
          class="action-btn"
          aria-label="Notifications"
          [matBadge]="unreadCount() || null"
          matBadgeColor="warn"
          matBadgeSize="small"
        >
          <mat-icon>notifications_outlined</mat-icon>
        </button>

        <mat-menu #notifMenu="matMenu" class="notif-dropdown">
          <div class="notif-header">
            <span>Notifications</span>
            @if (unreadCount()) {
              <span class="notif-count">{{ unreadCount() }} unread</span>
            }
          </div>
          @for (notif of recentNotifs(); track notif.id) {
            <div class="notif-item" [class.unread]="!notif.isRead" (click)="markRead(notif.id!)">
              <div class="notif-dot" [class.unread]="!notif.isRead"></div>
              <div class="notif-body">
                <div class="notif-title">{{ notif.title }}</div>
                <div class="notif-msg">{{ notif.message }}</div>
              </div>
            </div>
          } @empty {
            <div class="notif-empty">No notifications</div>
          }
          <div class="notif-footer">
            <a [routerLink]="[auth.role() + '/notifications']" mat-button color="primary">
              View all
            </a>
          </div>
        </mat-menu>

        <!-- Profile -->
        <button mat-button [matMenuTriggerFor]="profileMenu" class="profile-btn">
          @if (auth.currentUser()?.photoURL) {
            <img [src]="auth.currentUser()!.photoURL" alt="" class="pnav-avatar" />
          } @else {
            <div class="pnav-initials">
              {{ auth.currentUser()?.displayName?.charAt(0) || 'U' }}
            </div>
          }
          <mat-icon>expand_more</mat-icon>
        </button>

        <mat-menu #profileMenu="matMenu">
          <div class="um-header">
            <div class="um-name">{{ auth.currentUser()?.displayName }}</div>
            <div class="um-role">{{ auth.role() }}</div>
          </div>
          <a mat-menu-item [routerLink]="[auth.role() + '/profile']">
            <mat-icon>person</mat-icon> My Profile
          </a>
          <a mat-menu-item routerLink="/home">
            <mat-icon>public</mat-icon> Public Website
          </a>
          <button mat-menu-item (click)="auth.logout().subscribe()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .portal-navbar {
      position: fixed;
      top: 0;
      left: var(--sidebar-width);
      right: 0;
      height: var(--navbar-height);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: 0 var(--space-6);
      z-index: calc(var(--z-fixed) - 1);
      transition: left var(--transition-normal);

      @media (max-width: 1024px) { left: 0; }
    }

    .menu-btn { color: var(--color-text-body); }

    .search-bar {
      flex: 1;
      max-width: 480px;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: var(--color-surface-muted);
      border-radius: var(--radius-full);
      padding: 8px 16px;
      border: 1px solid var(--color-border);
      transition: all var(--transition-fast);

      &:focus-within {
        border-color: var(--color-primary);
        background: var(--color-surface);
        box-shadow: 0 0 0 3px var(--color-primary-50);
      }

      @media (max-width: 600px) { display: none; }
    }

    .search-icon {
      font-size: 18px;
      color: var(--color-text-caption);
      flex-shrink: 0;
    }

    .search-input {
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--color-text-body);
      width: 100%;

      &::placeholder { color: var(--color-text-muted); }
    }

    .portal-nav-actions {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      margin-left: auto;
    }

    .action-btn { color: var(--color-text-body); }

    .profile-btn {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      padding: 4px 8px !important;
      border-radius: var(--radius-full) !important;
    }

    .pnav-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    .pnav-initials {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--gradient-primary);
      color: white;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--color-text-heading);
    }

    .notif-count {
      background: var(--color-accent);
      color: white;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover { background: var(--color-surface-muted); }
      &.unread { background: var(--color-primary-50); }
    }

    .notif-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-border);
      margin-top: 5px;
      flex-shrink: 0;

      &.unread { background: var(--color-primary); }
    }

    .notif-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-heading);
    }

    .notif-msg {
      font-size: 12px;
      color: var(--color-text-caption);
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notif-empty {
      padding: 24px 16px;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.875rem;
    }

    .notif-footer {
      border-top: 1px solid var(--color-border);
      padding: 8px 8px;
      text-align: center;
    }

    .um-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);

      .um-name {
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--color-text-heading);
      }

      .um-role {
        font-size: 11px;
        color: var(--color-primary);
        font-weight: 600;
        text-transform: capitalize;
      }
    }
  `],
})
export class PortalNavbarComponent {
  @Input() sidebarOpen = true;
  @Output() menuToggle = new EventEmitter<void>();

  auth = inject(AuthService);
  theme = inject(ThemeService);
  private notifService = inject(NotificationService);

  searchQuery = '';

  private notifs$ = this.notifService.getNotifications();
  recentNotifs = toSignal(this.notifs$.pipe(map((n) => n.slice(0, 5))), { initialValue: [] });
  unreadCount = toSignal(
    this.notifService.getUnread().pipe(map((n) => n.length)),
    { initialValue: 0 }
  );

  onSearch(): void {
    // Global search handled per-feature
  }

  markRead(id: string): void {
    this.notifService.markAsRead(id).subscribe();
  }
}
