import { Component, inject, signal, OnInit } from '@angular/core';
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

      /* Sidebar always pushes content — no overlay, no hiding */
      &.sidebar-open {
        padding-left: var(--sidebar-width);
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
  `],
})
export class PortalShellComponent implements OnInit {
  auth = inject(AuthService);

  sidebarOpen = signal(false);

  private readonly PREF_KEY = 'kbss-sidebar';

  ngOnInit(): void {
    const saved = localStorage.getItem(this.PREF_KEY);
    // On mobile always start closed; on desktop respect saved pref (default open)
    if (window.innerWidth < 1025) {
      this.sidebarOpen.set(false);
    } else {
      this.sidebarOpen.set(saved !== 'closed');
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => {
      const next = !v;
      // Only persist the desktop preference
      if (window.innerWidth >= 1025) {
        localStorage.setItem(this.PREF_KEY, next ? 'open' : 'closed');
      }
      return next;
    });
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    if (window.innerWidth >= 1025) {
      localStorage.setItem(this.PREF_KEY, 'closed');
    }
  }
}
