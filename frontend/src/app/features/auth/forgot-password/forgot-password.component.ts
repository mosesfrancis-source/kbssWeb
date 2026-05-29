import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule,
  ],
  template: `
    <div class="forgot-page">
      <div class="forgot-card">
        <div class="forgot-header">
          <img src="assets/images/kbss-badge.png" alt="K.B.S.S" class="forgot-badge"
               onerror="this.style.display='none'">
          <h2>Reset Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        @if (!sent()) {
          <form [formGroup]="form" (ngSubmit)="submit()" class="forgot-form">
            <mat-form-field appearance="outline">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-icon matPrefix>email</mat-icon>
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Enter a valid email</mat-error>
              }
            </mat-form-field>

            @if (error()) {
              <div class="error-banner">
                <mat-icon>error</mat-icon>{{ error() }}
              </div>
            }

            <button mat-raised-button color="primary" type="submit" class="btn-lg w-full"
                    [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-icon class="spin">refresh</mat-icon> Sending...
              } @else {
                <mat-icon>send</mat-icon> Send Reset Link
              }
            </button>
          </form>
        } @else {
          <div class="success-state">
            <div class="success-icon"><mat-icon>mark_email_read</mat-icon></div>
            <h3>Check Your Email</h3>
            <p>A password reset link has been sent to <strong>{{ form.value.email }}</strong>. Please check your inbox and spam folder.</p>
          </div>
        }

        <a routerLink="/auth/login" mat-button class="back-link">
          <mat-icon>arrow_back</mat-icon> Back to Sign In
        </a>
      </div>
    </div>
  `,
  styles: [`
    .forgot-page { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-8); min-height: calc(100vh - 52px); }
    .forgot-card { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: var(--space-4); }
    .forgot-header { text-align: center; }
    .forgot-badge { width: 64px; height: 64px; border-radius: 50%; background: white; padding: 6px; object-fit: contain; box-shadow: var(--shadow-md); border: 2px solid var(--color-primary-100); margin: 0 auto var(--space-4); display: block; }
    .forgot-header h2 { margin-bottom: var(--space-2); }
    .forgot-header p { color: var(--color-text-caption); font-size: 0.875rem; margin: 0; }
    .forgot-form { display: flex; flex-direction: column; gap: var(--space-3); }
    .error-banner { display: flex; align-items: center; gap: 8px; background: var(--color-error-bg); color: var(--color-error); padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.875rem; }
    .success-state { text-align: center; padding: var(--space-6); }
    .success-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--color-success-bg); color: var(--color-success); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); mat-icon { font-size: 32px; width: 32px; height: 32px; } }
    .back-link { color: var(--color-text-caption) !important; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  sent = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.sendPasswordReset(this.form.value.email!).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: () => { this.loading.set(false); this.error.set('Failed to send reset email. Please check the address.'); },
    });
  }
}
