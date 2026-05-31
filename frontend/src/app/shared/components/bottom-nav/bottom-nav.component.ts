import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <nav class="bottom-nav" role="navigation" aria-label="Page navigation">
      <button mat-icon-button (click)="goBack()" matTooltip="Back" aria-label="Go back" class="nav-btn">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <button mat-icon-button (click)="goHome()" matTooltip="Home" aria-label="Home" class="nav-btn home-btn">
        <mat-icon>home</mat-icon>
      </button>
      <button mat-icon-button (click)="goForward()" matTooltip="Forward" aria-label="Go forward" class="nav-btn">
        <mat-icon>arrow_forward</mat-icon>
      </button>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-8);
      z-index: 200;
    }

    .nav-btn {
      color: var(--color-text-body) !important;
      transition: color var(--transition-fast), transform var(--transition-fast);

      &:hover { color: var(--color-primary) !important; transform: scale(1.15); }
      &:active { transform: scale(0.95); }
    }

    .home-btn { color: var(--color-primary) !important; }
  `],
})
export class BottomNavComponent {
  private location = inject(Location);
  private router   = inject(Router);
  private auth     = inject(AuthService);

  goBack(): void    { this.location.back(); }
  goForward(): void { this.location.forward(); }

  goHome(): void {
    const role = this.auth.role();
    this.router.navigate([role ? `/${role}/dashboard` : '/home']);
  }
}
