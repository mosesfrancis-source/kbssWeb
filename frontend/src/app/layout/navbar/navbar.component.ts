import {
  Component,
  inject,
  signal,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { Subscription } from 'rxjs';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  template: `
    <header class="navbar" [class.scrolled]="isScrolled()">
      <div class="navbar-inner container">

        <!-- Logo / Brand -->
        <a routerLink="/home" class="brand" (click)="closeMobile()">
          <div class="brand-badge-wrap">
            <img src="assets/images/kbss-badge.svg" alt="K.B.S.S" class="brand-badge"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
            <div class="brand-badge-fallback" style="display:none">K</div>
          </div>
          <div class="brand-text">
            <span class="brand-abbr">K.B.S.S</span>
            <span class="brand-full">Kissi Bendu Secondary School</span>
          </div>
        </a>

        <!-- Desktop nav links (hidden on mobile) -->
        <nav class="nav-links-desktop">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active" class="nav-link">
              {{ link.label }}
            </a>
          }
        </nav>

        <!-- Desktop action buttons -->
        <div class="nav-actions">
          <button mat-icon-button (click)="theme.toggle()"
                  [matTooltip]="theme.currentTheme() === 'dark' ? 'Light mode' : 'Dark mode'"
                  aria-label="Toggle theme" class="icon-btn">
            <mat-icon>{{ theme.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>

          @if (auth.isLoggedIn()) {
            <button mat-icon-button
                    [routerLink]="[auth.getRedirectPath().split('/')[1] + '/notifications']"
                    [matBadge]="unreadCount() || null" matBadgeColor="warn" matBadgeSize="small"
                    class="icon-btn" aria-label="Notifications">
              <mat-icon>notifications_outlined</mat-icon>
            </button>

            <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
              @if (auth.currentUser()?.photoURL) {
                <img [src]="auth.currentUser()!.photoURL" alt="Avatar" class="user-avatar" />
              } @else {
                <div class="user-avatar-fallback">{{ auth.currentUser()?.displayName?.charAt(0) || 'U' }}</div>
              }
              <span class="user-name">{{ getUserFirstName() }}</span>
              <mat-icon>expand_more</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu">
              <div class="user-menu-header">
                <div class="um-name">{{ auth.currentUser()?.displayName }}</div>
                <div class="um-role">{{ auth.role() | titlecase }}</div>
              </div>
              <a mat-menu-item [routerLink]="auth.getRedirectPath()">
                <mat-icon>dashboard</mat-icon> My Dashboard
              </a>
              <a mat-menu-item [routerLink]="[auth.role() + '/profile']">
                <mat-icon>person</mat-icon> My Profile
              </a>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon> Sign Out
              </button>
            </mat-menu>
          } @else {
            <a routerLink="/auth/register" mat-raised-button class="register-btn">Create Account</a>
            <a routerLink="/auth/login"    mat-raised-button class="login-btn">Sign In</a>
          }

          <!-- Hamburger — mobile only -->
          <button mat-icon-button class="hamburger"
                  (click)="toggleMobile()"
                  [attr.aria-expanded]="mobileOpen()"
                  aria-label="Toggle navigation menu">
            <span class="ham-bar" [class.open]="mobileOpen()">
              <span></span><span></span><span></span>
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- ── Mobile drawer (outside header so it's full-height) ── -->
    <div class="mobile-drawer" [class.open]="mobileOpen()" role="dialog" aria-label="Navigation menu">
      <div class="drawer-header">
        <div class="drawer-brand">
          <img src="assets/images/kbss-badge.svg" alt="" class="drawer-badge"
               onerror="this.style.display='none'">
          <span class="drawer-school">K.B.S.S</span>
        </div>
        <button mat-icon-button (click)="closeMobile()" class="drawer-close" aria-label="Close menu">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <nav class="drawer-nav">
        @for (link of navLinks; track link.path) {
          <a [routerLink]="link.path" routerLinkActive="drawer-active"
             class="drawer-link" (click)="closeMobile()">
            {{ link.label }}
          </a>
        }
        @if (auth.isLoggedIn()) {
          <a [routerLink]="auth.getRedirectPath()" class="drawer-link drawer-portal" (click)="closeMobile()">
            <mat-icon>dashboard</mat-icon> My Portal
          </a>
        }
      </nav>

      @if (!auth.isLoggedIn()) {
        <div class="drawer-auth">
          <a routerLink="/auth/register" mat-raised-button class="drawer-register" (click)="closeMobile()">
            <mat-icon>person_add</mat-icon> Create Account
          </a>
          <a routerLink="/auth/login" mat-stroked-button class="drawer-login" (click)="closeMobile()">
            <mat-icon>login</mat-icon> Sign In
          </a>
        </div>
      }

      <div class="drawer-footer">
        <button mat-icon-button (click)="theme.toggle()" class="drawer-theme" aria-label="Toggle theme">
          <mat-icon>{{ theme.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
        <span class="drawer-motto">Prodeo Et Propatria</span>
      </div>
    </div>

    <!-- Backdrop -->
    @if (mobileOpen()) {
      <div class="mobile-backdrop" (click)="closeMobile()" aria-hidden="true"></div>
    }
  `,
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private notifService = inject(NotificationService);

  isScrolled = signal(false);
  mobileOpen = signal(false);
  unreadCount = signal(0);

  getUserFirstName(): string {
    return this.auth.currentUser()?.displayName?.split(' ')[0] ?? 'User';
  }

  private sub?: Subscription;

  navLinks: NavLink[] = [
    { label: 'Home', path: '/home' },
    { label: 'About', path: '/about' },
    { label: 'Academics', path: '/academics' },
    { label: 'Admissions', path: '/admissions' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'News', path: '/news' },
    { label: 'Contact', path: '/contact' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  ngOnInit(): void {
    this.sub = this.notifService
      .getUnread()
      .subscribe((notifs) => this.unreadCount.set(notifs.length));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
    document.body.classList.toggle('no-scroll', this.mobileOpen());
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
    document.body.classList.remove('no-scroll');
  }

  logout(): void {
    this.auth.logout().subscribe();
  }
}
