import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { PortalNavbarComponent } from '../portal-navbar/portal-navbar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, PortalNavbarComponent],
  template: `
    <div class="portal-shell">
      <app-portal-navbar
        (menuToggle)="toggleSidebar()"
        [sidebarOpen]="sidebarOpen()"
      />
      <app-sidebar
        [open]="sidebarOpen()"
        [role]="auth.role()!"
        (close)="closeSidebar()"
      />

      <!-- Overlay — closes sidebar on any tap/click, shown whenever sidebar is open -->
      @if (sidebarOpen()) {
        <div class="sidebar-overlay" (click)="closeSidebar()"></div>
      }

      <main class="portal-main" [class.sidebar-open]="sidebarOpen()">
        <div class="route-wrapper">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .portal-shell {
      min-height: 100vh;
      background: var(--color-surface-alt);
    }

    .portal-main {
      padding-top: var(--navbar-height);
      padding-left: 0;
      min-height: 100vh;
      transition: padding-left var(--transition-normal);

      /* Shift right only on desktop when sidebar is open */
      @media (min-width: 1025px) {
        &.sidebar-open {
          padding-left: var(--sidebar-width);
        }
      }
    }

    .route-wrapper {
      padding: var(--space-8);
      max-width: 1400px;

      @media (max-width: 768px) {
        padding: var(--space-4);
      }

      @media (max-width: 480px) {
        padding: var(--space-3) var(--space-3);
      }
    }

    /* Overlay: drawer backdrop — mobile only; desktop sidebar pushes content */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: calc(var(--z-fixed) - 1);
      cursor: pointer;

      /* On desktop the sidebar just shifts content — no dimming overlay needed */
      @media (min-width: 1025px) {
        display: none;
      }
    }
  `],
})
export class PortalShellComponent implements OnInit {
  auth = inject(AuthService);

  /* Start open only on desktop; closed on mobile so it doesn't cover the screen */
  sidebarOpen = signal(false);

  ngOnInit(): void {
    this.sidebarOpen.set(window.innerWidth >= 1025);
  }

  @HostListener('window:resize')
  onResize(): void {
    /* Auto-close when shrinking to mobile; auto-open when expanding to desktop */
    if (window.innerWidth < 1025) {
      this.sidebarOpen.set(false);
    } else {
      this.sidebarOpen.set(true);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
