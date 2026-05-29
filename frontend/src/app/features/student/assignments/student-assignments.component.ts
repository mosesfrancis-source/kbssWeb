import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { StorageService } from '../../../core/services/storage.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Assignment, Submission } from '../../../shared/models';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-student-assignments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Assignments</h1>
        <p>Submit your work before the due dates</p>
      </div>

      <!-- Tabs: Pending / Submitted -->
      <div class="tab-strip">
        <button [class.active]="activeTab() === 'pending'" (click)="activeTab.set('pending')">
          <mat-icon>pending_actions</mat-icon> Pending ({{ pending().length }})
        </button>
        <button [class.active]="activeTab() === 'submitted'" (click)="activeTab.set('submitted')">
          <mat-icon>check_circle</mat-icon> Submitted ({{ submitted().length }})
        </button>
      </div>

      <div class="assignments-list">
        @if (activeTab() === 'pending') {
          @for (a of pending(); track a.id) {
            <div class="assignment-card card">
              <div class="assign-header">
                <div class="assign-meta">
                  <h3>{{ a.title }}</h3>
                  <div class="assign-info">
                    <span class="badge badge-warning">Pending</span>
                    <span class="assign-due">
                      <mat-icon>calendar_today</mat-icon> Due: {{ a.dueDate }}
                    </span>
                  </div>
                </div>
                @if (a.attachmentURL) {
                  <a [href]="a.attachmentURL" target="_blank" mat-stroked-button class="btn-sm">
                    <mat-icon>download</mat-icon> Brief
                  </a>
                }
              </div>
              <p class="assign-desc">{{ a.description }}</p>
              <div class="assign-actions">
                <input type="file" [id]="'file-' + a.id" style="display:none"
                       (change)="submit(a, $event)">
                <label [for]="'file-' + a.id" class="upload-label">
                  <mat-icon>upload_file</mat-icon> Submit Work
                </label>
              </div>
            </div>
          } @empty {
            <div class="empty-state card">
              <mat-icon>check_circle</mat-icon>
              <h3>All caught up!</h3>
              <p>No pending assignments right now.</p>
            </div>
          }
        }

        @if (activeTab() === 'submitted') {
          @for (s of submitted(); track s.id) {
            <div class="assignment-card card">
              <div class="assign-header">
                <div class="assign-meta">
                  <h3>Assignment</h3>
                  <div class="assign-info">
                    @if (s.grade) {
                      <span class="badge badge-success">Graded: {{ s.grade }}</span>
                    } @else {
                      <span class="badge badge-info">Submitted</span>
                    }
                  </div>
                </div>
              </div>
              @if (s.feedback) {
                <div class="feedback-box">
                  <mat-icon>comment</mat-icon>
                  <p>{{ s.feedback }}</p>
                </div>
              }
            </div>
          } @empty {
            <div class="empty-state card">
              <mat-icon>assignment</mat-icon>
              <p>No submitted assignments yet.</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .tab-strip { display: flex; gap: var(--space-2); margin-bottom: var(--space-6); border-bottom: 2px solid var(--color-border); padding-bottom: 0; }
    .tab-strip button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: none; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; color: var(--color-text-caption); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all var(--transition-fast); mat-icon { font-size: 18px; } &.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 600; } &:hover { color: var(--color-primary); } }
    .assignments-list { display: flex; flex-direction: column; gap: var(--space-4); }
    .assignment-card { padding: var(--space-5); }
    .assign-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-3); }
    .assign-meta h3 { font-size: 1rem; margin-bottom: var(--space-2); color: var(--color-text-heading); }
    .assign-info { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
    .assign-due { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-text-caption); mat-icon { font-size: 14px; width: 14px; height: 14px; } }
    .assign-desc { font-size: 0.875rem; color: var(--color-text-caption); line-height: 1.6; margin-bottom: var(--space-4); }
    .assign-actions { display: flex; gap: var(--space-3); }
    .upload-label { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; background: var(--gradient-primary); color: white; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity var(--transition-fast); &:hover { opacity: 0.9; } mat-icon { font-size: 18px; } }
    .feedback-box { display: flex; align-items: flex-start; gap: var(--space-2); background: var(--color-info-bg); border-radius: var(--radius-md); padding: var(--space-3); margin-top: var(--space-3); mat-icon { color: var(--color-info); flex-shrink: 0; } p { font-size: 0.875rem; color: var(--color-text-body); margin: 0; } }
    .empty-state { text-align: center; padding: var(--space-12); mat-icon { font-size: 48px; color: var(--color-text-muted); display: block; margin-bottom: var(--space-3); } h3 { color: var(--color-text-heading); margin-bottom: var(--space-2); } p { color: var(--color-text-caption); } }
  `],
})
export class StudentAssignmentsComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private storage = inject(StorageService);
  private toast = inject(ToastService);

  activeTab = signal<'pending' | 'submitted'>('pending');

  assignments = toSignal(
    this.fs.collection$<Assignment>('assignments', this.fs.orderBy('dueDate', 'asc')),
    { initialValue: [] }
  );

  submissions = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => {
        if (!u) return of([]);
        return this.fs.collection$<Submission>(
          'submissions',
          this.fs.where('studentId', '==', u.uid)
        );
      })
    ),
    { initialValue: [] }
  );

  submittedIds = () => new Set(this.submissions().map((s) => s.assignmentId));
  pending = () => this.assignments().filter((a) => !this.submittedIds().has(a.id!));
  submitted = () => this.submissions();

  submit(assignment: Assignment, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !assignment.id) return;

    const uid = this.auth.currentUser()?.uid ?? 'unknown';
    const path = this.storage.submissionPath(assignment.id, uid, this.storage.uniqueFileName(file));

    this.storage.uploadAndGetURL(path, file).subscribe({
      next: (url) => {
        this.fs.add('submissions', {
          assignmentId: assignment.id!,
          studentId: uid,
          fileURL: url,
          status: 'pending',
          submittedAt: serverTimestamp(),
        }).subscribe(() => this.toast.success('Assignment submitted successfully!'));
      },
      error: () => this.toast.error('Upload failed. Please try again.'),
    });
  }
}
