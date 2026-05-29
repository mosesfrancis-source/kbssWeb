import { Component, inject, signal } from '@angular/core';
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
    <div class="portal-shell" [class.sidebar-open]="sidebarOpen()">
      <app-portal-navbar
        (menuToggle)="toggleSidebar()"
        [sidebarOpen]="sidebarOpen()"
      />
      <app-sidebar
        [open]="sidebarOpen()"
        [role]="auth.role()!"
        (close)="sidebarOpen.set(false)"
      />
      <main class="portal-main" [class.shifted]="sidebarOpen()">
        <div class="route-wrapper">
          <router-outlet />
        </div>
      </main>
    </div>

    <!-- Mobile overlay -->
    @if (sidebarOpen()) {
      <div class="sidebar-overlay" (click)="sidebarOpen.set(false)"></div>
    }
  `,
  styles: [`
    .portal-shell {
      min-height: 100vh;
      background: var(--color-surface-alt);
    }

    .portal-main {
      padding-top: var(--navbar-height);
      padding-left: var(--sidebar-width);
      min-height: 100vh;
      transition: padding-left var(--transition-normal);

      @media (max-width: 1024px) {
        padding-left: 0;
      }
    }

    .route-wrapper {
      padding: var(--space-8);
      max-width: 1400px;

      @media (max-width: 768px) {
        padding: var(--space-4);
      }
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: calc(var(--z-fixed) - 1);

      @media (max-width: 1024px) { display: block; }
    }
  `],
})
export class PortalShellComponent {
  auth = inject(AuthService);
  sidebarOpen = signal(true);

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
