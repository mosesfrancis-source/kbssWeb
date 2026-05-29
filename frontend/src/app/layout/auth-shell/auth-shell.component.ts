import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-auth-shell",
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="auth-shell">
      <div class="auth-brand">
        <div class="brand-bg"></div>
        <div class="brand-content">
          <img
            src="assets/images/kbss-badge.png"
            alt="K.B.S.S Badge"
            class="brand-badge"
            onerror="this.style.display='none'"
          />
          <h1>Kissi Bendu<br />Secondary School</h1>
          <p>Koindu Town, Kailahun District<br />Sierra Leone</p>
          <div class="brand-stats">
            <div class="stat">
              <span class="num">500+</span><span class="lbl">Students</span>
            </div>
            <div class="stat">
              <span class="num">30+</span><span class="lbl">Teachers</span>
            </div>
            <div class="stat">
              <span class="num">95%</span><span class="lbl">Pass Rate</span>
            </div>
          </div>
          <blockquote>
            "Education is the passport to the future,<br />for tomorrow belongs
            to those who prepare for it today."
          </blockquote>
        </div>
      </div>
      <div class="auth-form-area">
        <a routerLink="/home" class="back-link">
          <span class="material-icons-outlined">arrow_back</span>
          Back to Website
        </a>
        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      .auth-shell {
        display: flex;
        min-height: 100vh;
        background:
          radial-gradient(
            ellipse at 80% 10%,
            rgba(30, 90, 168, 0.07),
            transparent 40%
          ),
          linear-gradient(160deg, #f4f7fb 0%, #eef3fa 50%, #e6eef8 100%);
      }

      .auth-brand {
        flex: 0 0 45%;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        @media (max-width: 768px) {
          display: none;
        }
      }

      .brand-bg {
        position: absolute;
        inset: 0;
        background: var(--gradient-hero);

        &::before {
          content: "";
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          top: -120px;
          right: -140px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.18) 0%,
            rgba(255, 255, 255, 0) 72%
          );
        }

        &::after {
          content: "";
          position: absolute;
          inset: 0;
          background: url("/assets/images/school-building.jpg") center/cover
            no-repeat;
          opacity: 0.14;
        }
      }

      .brand-content {
        position: relative;
        z-index: 1;
        color: white;
        padding: 48px;
        text-align: center;
        animation: panelIn 520ms ease-out;
      }

      .brand-badge {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: white;
        padding: 12px;
        object-fit: contain;
        margin-bottom: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .brand-content h1 {
        font-family: var(--font-display);
        font-size: 2.25rem;
        color: white;
        margin-bottom: 12px;
        line-height: 1.2;
      }

      .brand-content p {
        color: rgba(240, 248, 255, 0.82);
        font-size: 0.9rem;
        margin-bottom: 40px;
      }

      .brand-stats {
        display: flex;
        justify-content: center;
        gap: 32px;
        margin-bottom: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 20px;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .num {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          font-family: var(--font-mono);
        }

        .lbl {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.65);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
      }

      blockquote {
        font-style: italic;
        color: rgba(255, 255, 255, 0.65);
        font-size: 0.875rem;
        line-height: 1.6;
        border-left: 3px solid rgba(255, 255, 255, 0.3);
        padding-left: 16px;
        text-align: left;
      }

      .auth-form-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: transparent;
        overflow-y: auto;
        backdrop-filter: blur(1px);
      }

      .back-link {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 18px 34px;
        color: var(--color-text-caption);
        text-decoration: none;
        font-size: 0.875rem;
        transition: color var(--transition-fast);
        width: fit-content;
        margin: 8px 0 0 8px;
        border-radius: var(--radius-full);

        &:hover {
          color: var(--color-primary);
          background: rgba(30, 90, 168, 0.1);
        }

        .material-icons-outlined {
          font-size: 18px;
        }
      }

      @keyframes panelIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class AuthShellComponent {}
