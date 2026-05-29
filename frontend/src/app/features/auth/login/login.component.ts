import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatTabsModule,
  ],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Badge header -->
        <div class="login-header">
          <img src="assets/images/kbss-badge.svg" alt="K.B.S.S" class="login-badge"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
          <div class="login-badge-fb" style="display:none">K</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your K.B.S.S account</p>
        </div>

        <!-- Role tabs -->
        <mat-tab-group
          [(selectedIndex)]="selectedTab"
          class="role-tabs"
          animationDuration="200ms"
        >
          <mat-tab label="Student">
            <ng-template mat-tab-label>
              <mat-icon>school</mat-icon>
              Student
            </ng-template>
          </mat-tab>
          <mat-tab label="Teacher">
            <ng-template mat-tab-label>
              <mat-icon>supervisor_account</mat-icon>
              Teacher
            </ng-template>
          </mat-tab>
          <mat-tab label="Admin">
            <ng-template mat-tab-label>
              <mat-icon>admin_panel_settings</mat-icon>
              Admin
            </ng-template>
          </mat-tab>
        </mat-tab-group>

        <!-- Login form -->
        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <mat-form-field appearance="outline">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email">
            <mat-icon matPrefix>email</mat-icon>
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email')) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              autocomplete="current-password"
            >
            <mat-icon matPrefix>lock</mat-icon>
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="showPassword.set(!showPassword())"
              [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
            >
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>

          <div class="login-options">
            <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
          </div>

          @if (error()) {
            <div class="error-banner">
              <mat-icon>error</mat-icon>
              {{ error() }}
            </div>
          }

          <button
            mat-raised-button
            color="primary"
            type="submit"
            class="submit-btn btn-lg"
            [disabled]="form.invalid || loading()"
          >
            @if (loading()) {
              <mat-icon class="spin">refresh</mat-icon>
              Signing in...
            } @else {
              <mat-icon>login</mat-icon>
              Sign In as {{ roleLabel() }}
            }
          </button>
        </form>

        <!-- Divider -->
        <div class="login-divider">
          <span>New to K.B.S.S?</span>
        </div>

        <a routerLink="/auth/register" mat-stroked-button class="register-link">
          Create an Account
        </a>

        <a routerLink="/home" mat-button class="home-link">
          <mat-icon>public</mat-icon>
          Visit Public Website
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  selectedTab = 0;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  roleLabel(): string {
    return ['Student', 'Teacher', 'Admin'][this.selectedTab];
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;
    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success(`Welcome back! Redirecting to your portal...`);
        // Delay to allow token refresh
        setTimeout(() => {
          this.router.navigate([this.authService.getRedirectPath()]);
        }, 800);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.parseFirebaseError(err.code));
      },
    });
  }

  private parseFirebaseError(code: string): string {
    const messages: Record<string, string> = {
      'auth/user-not-found':    'No account found with this email address.',
      'auth/wrong-password':    'Incorrect password. Please try again.',
      'auth/invalid-email':     'Invalid email address format.',
      'auth/user-disabled':     'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/invalid-credential':'Invalid email or password.',
    };
    return messages[code] ?? 'Sign-in failed. Please check your credentials.';
  }
}
