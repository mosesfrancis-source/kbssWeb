import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

function passwordMatchValidator(control: AbstractControl) {
  const pw = control.get("password");
  const pw2 = control.get("confirmPassword");
  if (pw && pw2 && pw.value !== pw2.value) {
    pw2.setErrors({ mismatch: true });
  } else {
    pw2?.setErrors(null);
  }
  return null;
}

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
  ],
  template: `
    <div class="register-page">
      <div class="register-card">
        <div class="register-header">
          <img
            src="assets/images/kbss-badge.png"
            alt="K.B.S.S"
            class="reg-badge"
            onerror="this.style.display='none'"
          />
          <h2>Create Account</h2>
          <p>Register for access to the K.B.S.S Academic Portal</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="reg-form">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="displayName" autocomplete="name" />
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email Address</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              autocomplete="email"
            />
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="form.get('email')?.hasError('email')"
              >Enter a valid email address</mat-error
            >
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="student">Student</mat-option>
              <mat-option value="teacher">Teacher</mat-option>
            </mat-select>
            <mat-icon matPrefix>badge</mat-icon>
            <mat-hint
              >Admin accounts are created by the school admin only.</mat-hint
            >
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input
              matInput
              [type]="showPw() ? 'text' : 'password'"
              formControlName="password"
              autocomplete="new-password"
            />
            <mat-icon matPrefix>lock</mat-icon>
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="showPw.set(!showPw())"
            >
              <mat-icon>{{
                showPw() ? "visibility_off" : "visibility"
              }}</mat-icon>
            </button>
            <mat-hint>Minimum 8 characters</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Confirm Password</mat-label>
            <input
              matInput
              [type]="showPw() ? 'text' : 'password'"
              formControlName="confirmPassword"
              autocomplete="new-password"
            />
            <mat-icon matPrefix>lock_reset</mat-icon>
            <mat-error *ngIf="form.get('confirmPassword')?.hasError('mismatch')"
              >Passwords do not match</mat-error
            >
          </mat-form-field>

          <div *ngIf="error()" class="error-banner">
            <mat-icon>error</mat-icon>{{ error() }}
          </div>

          <button
            mat-raised-button
            color="primary"
            type="submit"
            class="btn-lg w-full"
            [disabled]="form.invalid || loading()"
          >
            <mat-icon *ngIf="loading()" class="spin">refresh</mat-icon>
            <ng-container *ngIf="!loading()">
              <mat-icon>person_add</mat-icon> Create Account
            </ng-container>
            <ng-container *ngIf="loading()">Creating account...</ng-container>
          </button>
        </form>

        <p class="login-link-text">
          Already have an account?
          <a routerLink="/auth/login">Sign In</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .register-page {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-8) var(--space-6);
        min-height: calc(100vh - 52px);
      }
      .register-card {
        width: 100%;
        max-width: 460px;
        background: #ffffff;
        border-radius: 16px;
        padding: 40px 32px;
        box-shadow: 0 8px 32px rgba(30, 90, 168, 0.10), 0 2px 8px rgba(0,0,0,0.06);
        border: 1px solid #d8e3f0;
      }
      .register-header {
        text-align: center;
        margin-bottom: var(--space-6);
      }
      .reg-badge {
        width: 64px;
        height: 64px;
        object-fit: contain;
        border-radius: 50%;
        background: white;
        padding: 6px;
        box-shadow: var(--shadow-md);
        border: 2px solid var(--color-primary-100);
        margin: 0 auto var(--space-3);
        display: block;
      }
      .register-header h2 {
        font-size: 1.4rem;
        color: var(--color-text-heading);
        margin-bottom: 4px;
      }
      .register-header p {
        font-size: 0.875rem;
        color: var(--color-text-caption);
        margin: 0;
      }
      .reg-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--color-error-bg);
        color: var(--color-error);
        padding: 12px 16px;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        mat-icon {
          font-size: 18px;
          flex-shrink: 0;
        }
      }
      .login-link-text {
        text-align: center;
        font-size: 0.875rem;
        color: var(--color-text-caption);
        margin-top: var(--space-4);
        a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
          &:hover {
            text-decoration: underline;
          }
        }
      }
      .spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from {
          transform: rotate(0);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal("");
  showPw = signal(false);

  form = this.fb.group(
    {
      displayName: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      role: ["student", Validators.required],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set("");

    const { email, password, displayName, role } = this.form.value;
    this.authService.register(email!, password!, displayName!, role as 'student' | 'teacher').subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success("Account created! Welcome to K.B.S.S portal.");
        const path = role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
        setTimeout(() => this.router.navigate([path]), 800);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.parseError(err?.code ?? ''));
      },
    });
  }

  private parseError(code: string): string {
    const messages: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered.",
      "auth/invalid-email": "Invalid email address.",
      "auth/weak-password": "Password is too weak.",
    };
    return messages[code] ?? "Registration failed. Please try again.";
  }
}
