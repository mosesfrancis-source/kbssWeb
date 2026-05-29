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
import { switchMap, of } from 'rxjs';
import { Announcement } from '../../../shared/models';
import { serverTimestamp, Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-teacher-announcements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Announcements</h1>
        <p>Publish announcements to students and staff</p>
      </div>

      <!-- Compose -->
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
            <textarea matInput formControlName="body" rows="5" placeholder="Write your announcement..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Target Audience</mat-label>
            <mat-select formControlName="targetRoles" multiple>
              <mat-option value="student">Students</mat-option>
              <mat-option value="teacher">Teachers</mat-option>
              <mat-option value="admin">Admin</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-checkbox formControlName="isPinned" color="primary">
            Pin this announcement
          </mat-checkbox>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || publishing()">
              @if (publishing()) {
                <mat-icon class="spin">refresh</mat-icon> Publishing...
              } @else {
                <mat-icon>campaign</mat-icon> Publish Announcement
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Existing -->
      <h3 class="section-title">Published Announcements</h3>
      <div class="announce-list">
        @for (a of announcements(); track a.id) {
          <div class="ann-card card" [class.pinned]="a.isPinned">
            @if (a.isPinned) {
              <div class="pin-banner"><mat-icon>push_pin</mat-icon> Pinned</div>
            }
            <div class="ann-head">
              <h4>{{ a.title }}</h4>
              <button mat-icon-button (click)="delete(a.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <p>{{ a.body }}</p>
            <div class="ann-footer">
              @for (role of a.targetRoles; track role) {
                <span class="badge badge-primary">{{ role }}</span>
              }
              <span class="ann-date">{{ formatDate(a.createdAt) }}</span>
            </div>
          </div>
        } @empty {
          <div class="empty-state"><mat-icon>campaign</mat-icon><p>No announcements published yet</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .compose-card { padding: var(--space-6); margin-bottom: var(--space-8); h3 { margin-bottom: var(--space-5); } }
    .compose-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-actions { display: flex; justify-content: flex-end; }
    .section-title { font-size: 1rem; color: var(--color-text-heading); margin-bottom: var(--space-4); }
    .announce-list { display: flex; flex-direction: column; gap: var(--space-4); }
    .ann-card { padding: var(--space-5); &.pinned { border-left: 4px solid var(--color-accent); } }
    .pin-banner { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-accent); font-weight: 700; margin-bottom: var(--space-2); mat-icon { font-size: 14px; } }
    .ann-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2); h4 { font-size: 0.9rem; color: var(--color-text-heading); margin: 0; } }
    p { font-size: 0.875rem; color: var(--color-text-caption); line-height: 1.6; margin-bottom: var(--space-3); }
    .ann-footer { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
    .ann-date { font-size: 12px; color: var(--color-text-muted); margin-left: auto; }
    .empty-state { text-align: center; padding: var(--space-10); color: var(--color-text-muted); mat-icon { font-size: 48px; display: block; margin-bottom: var(--space-3); } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `],
})
export class TeacherAnnouncementsComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  publishing = signal(false);

  form = this.fb.group({
    title:       ['', Validators.required],
    body:        ['', [Validators.required, Validators.minLength(10)]],
    targetRoles: [['student'], Validators.required],
    isPinned:    [false],
  });

  announcements = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => u ? this.fs.collection$<Announcement>(
        'announcements',
        this.fs.where('authorId', '==', u.uid),
        this.fs.orderBy('createdAt', 'desc')
      ) : of([]))
    ),
    { initialValue: [] }
  );

  publish(): void {
    const uid = this.auth.currentUser()?.uid;
    if (!uid || this.form.invalid) return;
    this.publishing.set(true);

    this.fs.add('announcements', {
      ...this.form.value,
      authorId: uid,
      authorName: this.auth.currentUser()?.displayName ?? '',
    }).subscribe({
      next: () => {
        this.publishing.set(false);
        this.form.reset({ targetRoles: ['student'], isPinned: false });
        this.toast.success('Announcement published!');
      },
      error: () => { this.publishing.set(false); this.toast.error('Failed to publish.'); },
    });
  }

  delete(id: string): void {
    this.fs.delete(`announcements/${id}`).subscribe(() =>
      this.toast.success('Announcement deleted.')
    );
  }

  formatDate(ts: Timestamp): string {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
