import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { SchoolConfig } from '../../../shared/models';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>School Settings</h1>
        <p>Configure school information and academic year settings</p>
      </div>

      <div class="settings-grid">
        <div class="settings-card card">
          <h3><mat-icon>school</mat-icon> School Information</h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="settings-form">
            <mat-form-field appearance="outline">
              <mat-label>School Name</mat-label>
              <input matInput formControlName="schoolName">
              <mat-icon matPrefix>school</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>School Motto</mat-label>
              <input matInput formControlName="motto">
              <mat-icon matPrefix>format_quote</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="2"></textarea>
            </mat-form-field>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone">
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email">
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Academic Year</mat-label>
                <input matInput formControlName="currentAcademicYear">
                <mat-icon matPrefix>calendar_today</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Current Term</mat-label>
                <mat-select formControlName="currentTerm">
                  <mat-option [value]="1">Term 1</mat-option>
                  <mat-option [value]="2">Term 2</mat-option>
                  <mat-option [value]="3">Term 3</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>Admin Email (for notifications)</mat-label>
              <input matInput type="email" formControlName="adminEmail">
              <mat-icon matPrefix>admin_panel_settings</mat-icon>
            </mat-form-field>
            <div class="save-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) {
                  <mat-icon class="spin">refresh</mat-icon> Saving...
                } @else {
                  <mat-icon>save</mat-icon> Save Settings
                }
              </button>
            </div>
          </form>
        </div>

        <div class="settings-info">
          <div class="info-card card">
            <h4><mat-icon>info</mat-icon> Portal Info</h4>
            <div class="info-rows">
              <div class="info-row"><span>Project ID:</span><span class="mono">kbss-5a255</span></div>
              <div class="info-row"><span>Auth Domain:</span><span class="mono">kbss-5a255.firebaseapp.com</span></div>
              <div class="info-row"><span>Hosting:</span><span class="mono">kbss-5a255.web.app</span></div>
              <div class="info-row"><span>Portal Version:</span><span class="mono">1.0.0</span></div>
            </div>
          </div>

          <div class="badge-preview card">
            <h4>School Badge</h4>
            <img src="assets/images/kbss-badge.png" alt="K.B.S.S Badge" class="badge-preview-img"
                 onerror="this.style.display='none'">
            <p>Kissi Bendu Secondary School</p>
            <p class="motto-text"><em>"PRODEO ET PROPATRIA"</em></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid { display: grid; grid-template-columns: 1fr 320px; gap: var(--space-6); align-items: start; @media (max-width: 1024px) { grid-template-columns: 1fr; } }
    .settings-card { padding: var(--space-6); h3 { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-6); font-size: 1rem; mat-icon { font-size: 20px; color: var(--color-primary); } } }
    .settings-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .save-actions { display: flex; justify-content: flex-end; }
    .settings-info { display: flex; flex-direction: column; gap: var(--space-4); }
    .info-card { padding: var(--space-5); h4 { display: flex; align-items: center; gap: var(--space-2); font-size: 0.875rem; color: var(--color-text-heading); margin-bottom: var(--space-4); mat-icon { font-size: 18px; color: var(--color-primary); } } }
    .info-rows { display: flex; flex-direction: column; gap: var(--space-2); }
    .info-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--color-text-caption); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); &:last-child { border-bottom: none; } span.mono { color: var(--color-text-heading); } }
    .badge-preview { padding: var(--space-5); text-align: center; p { font-size: 0.875rem; color: var(--color-text-caption); margin: 4px 0 0; } }
    .badge-preview-img { width: 80px; height: 80px; object-fit: contain; margin: 0 auto var(--space-3); display: block; }
    .motto-text { font-size: 12px; color: var(--color-primary); font-style: italic; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `],
})
export class AdminSettingsComponent implements OnInit {
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  saving = signal(false);

  form = this.fb.group({
    schoolName:          ['Kissi Bendu Secondary School', Validators.required],
    motto:               ['PRODEO ET PROPATRIA'],
    address:             ['Koindu Town, Kailahun District, Sierra Leone'],
    phone:               ['+232 76 000 000'],
    email:               ['info@kbss.edu.sl'],
    adminEmail:          ['admin@kbss.edu.sl'],
    currentAcademicYear: ['2024/2025'],
    currentTerm:         [1],
  });

  ngOnInit(): void {
    this.fs.getDoc<SchoolConfig>('settings/schoolConfig').subscribe((config) => {
      if (config) this.form.patchValue(config as any);
    });
  }

  save(): void {
    this.saving.set(true);
    this.fs.set('settings/schoolConfig', this.form.value as object, true).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Settings saved!'); },
      error: () => { this.saving.set(false); this.toast.error('Failed to save settings.'); },
    });
  }
}
