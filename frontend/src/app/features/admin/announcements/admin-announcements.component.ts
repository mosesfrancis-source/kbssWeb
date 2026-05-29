import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Announcement } from '../../../shared/models';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Announcements</h1>
        <p>Broadcast announcements to the entire school community</p>
      </div>
      <div class="compose-card card">
        <h3>New Announcement</h3>
        <form [formGroup]="form" (ngSubmit)="publish()" class="compose-form">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title">
            <mat-icon matPrefix>title</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Message</mat-label>
            <textarea matInput formControlName="body" rows="5"></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Target Audience</mat-label>
            <mat-select formControlName="targetRoles" multiple>
              <mat-option value="student">Students</mat-option>
              <mat-option value="teacher">Teachers</mat-option>
              <mat-option value="admin">Admin</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-checkbox formControlName="isPinned" color="primary">Pin this announcement</mat-checkbox>
          <div style="display:flex;justify-content:flex-end;">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || publishing()">
              @if (publishing()) { <mat-icon class="spin">refresh</mat-icon> Publishing... }
              @else { <mat-icon>campaign</mat-icon> Publish }
            </button>
          </div>
        </form>
      </div>
      <div class="announce-list">
        @for (a of announcements(); track a.id) {
          <div class="ann-card card" [class.pinned]="a.isPinned">
            @if (a.isPinned) { <div class="pin-banner"><mat-icon>push_pin</mat-icon> Pinned</div> }
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <h4 style="margin:0;font-size:0.9rem;">{{ a.title }}</h4>
              <button mat-icon-button (click)="delete(a.id!)"><mat-icon>delete</mat-icon></button>
            </div>
            <p style="font-size:0.875rem;color:var(--color-text-caption);margin-bottom:12px;">{{ a.body }}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              @for (role of a.targetRoles; track role) { <span class="badge badge-primary">{{ role }}</span> }
              <span style="font-size:12px;color:var(--color-text-muted);margin-left:auto;">{{ formatDate(a.createdAt) }}</span>
            </div>
          </div>
        } @empty {
          <div style="text-align:center;padding:48px;color:var(--color-text-muted);">
            <mat-icon style="font-size:48px;display:block;margin-bottom:12px;">campaign</mat-icon><p>No announcements yet</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`.compose-card{padding:24px;margin-bottom:32px;h3{margin-bottom:20px;}}.compose-form{display:flex;flex-direction:column;gap:16px;}.announce-list{display:flex;flex-direction:column;gap:16px;}.ann-card{padding:20px;&.pinned{border-left:4px solid var(--color-accent);}}.pin-banner{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--color-accent);font-weight:700;margin-bottom:8px;mat-icon{font-size:14px;}}.spin{animation:spin 1s linear infinite;}@keyframes spin{from{transform:rotate(0);}to{transform:rotate(360deg);}}`],
})
export class AdminAnnouncementsComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  publishing = signal(false);

  form = this.fb.group({
    title:       ['', Validators.required],
    body:        ['', [Validators.required, Validators.minLength(10)]],
    targetRoles: [['student', 'teacher'], Validators.required],
    isPinned:    [false],
  });

  announcements = toSignal(
    this.fs.collection$<Announcement>('announcements', this.fs.orderBy('createdAt', 'desc')),
    { initialValue: [] }
  );

  publish(): void {
    const uid = this.auth.currentUser()?.uid;
    if (!uid || this.form.invalid) return;
    this.publishing.set(true);
    this.fs.add('announcements', { ...this.form.value, authorId: uid, authorName: this.auth.currentUser()?.displayName ?? 'Admin' }).subscribe({
      next: () => { this.publishing.set(false); this.form.reset({ targetRoles: ['student', 'teacher'], isPinned: false }); this.toast.success('Published!'); },
      error: () => { this.publishing.set(false); this.toast.error('Failed.'); },
    });
  }

  delete(id: string): void {
    this.fs.delete(`announcements/${id}`).subscribe(() => this.toast.success('Deleted.'));
  }

  formatDate(ts: Timestamp): string {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
