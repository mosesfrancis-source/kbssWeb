import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found">
      <div class="not-found-content">
        <img src="assets/images/kbss-badge.svg" alt="K.B.S.S" class="nf-badge"
             onerror="this.style.display='none'">
        <h1 class="nf-code">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="nf-actions">
          <a routerLink="/home" mat-raised-button color="primary">
            <mat-icon>home</mat-icon> Go Home
          </a>
          <button mat-stroked-button onclick="history.back()">
            <mat-icon>arrow_back</mat-icon> Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gradient-hero);
      padding: var(--space-8);
    }

    .not-found-content {
      text-align: center;
      color: white;
    }

    .nf-badge {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: white;
      padding: 8px;
      object-fit: contain;
      margin-bottom: var(--space-6);
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    .nf-code {
      font-family: var(--font-mono);
      font-size: 8rem;
      font-weight: 900;
      color: rgba(255,255,255,0.15);
      line-height: 1;
      margin-bottom: 0;
    }

    h2 {
      font-family: var(--font-display);
      font-size: 2rem;
      color: white;
      margin-bottom: var(--space-3);
    }

    p {
      color: rgba(255,255,255,0.7);
      margin-bottom: var(--space-8);
      font-size: 1.1rem;
    }

    .nf-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
      flex-wrap: wrap;
    }

    .nf-actions button {
      border-color: rgba(255,255,255,0.5) !important;
      color: white !important;
    }
  `],
})
export class NotFoundComponent {}
