import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Assignment, Submission, SchoolClass, Subject } from '../../../shared/models';
import { serverTimestamp } from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-teacher-assignments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <h1>Assignments</h1>
          <p>Create, manage, and grade student assignments</p>
        </div>
        <button mat-raised-button color="primary" (click)="showForm.set(!showForm())">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancel' : 'New Assignment' }}
        </button>
      </div>

      <!-- Create form -->
      @if (showForm()) {
        <div class="create-form card">
          <h3>Create New Assignment</h3>
          <form [formGroup]="form" (ngSubmit)="create()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Class</mat-label>
                <mat-select formControlName="classId">
                  @for (c of classes(); track c.id) {
                    <mat-option [value]="c.classId">{{ c.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Subject</mat-label>
                <mat-select formControlName="subjectId">
                  @for (s of subjects(); track s.id) {
                    <mat-option [value]="s.subjectId">{{ s.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Due Date</mat-label>
                <input matInput type="date" formControlName="dueDate">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Description / Instructions</mat-label>
              <textarea matInput formControlName="description" rows="4"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || creating()">
                @if (creating()) { <mat-icon class="spin">refresh</mat-icon> Creating... }
                @else { <mat-icon>save</mat-icon> Create Assignment }
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Assignments list -->
      <div class="assignments-list">
        @for (a of assignments(); track a.id) {
          <div class="assignment-card card">
            <div class="assign-head">
              <div>
                <h3>{{ a.title }}</h3>
                <div class="assign-meta">
                  <span class="badge badge-primary">{{ a.classId }}</span>
                  <span class="badge badge-neutral">{{ a.subjectId }}</span>
                  <span class="assign-due"><mat-icon>calendar_today</mat-icon>Due: {{ a.dueDate }}</span>
                </div>
              </div>
              <div class="assign-actions">
                <button mat-icon-button (click)="deleteAssignment(a.id!)" aria-label="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
            <p class="assign-desc">{{ a.description }}</p>

            <!-- Submissions count -->
            <div class="submissions-count">
              <mat-icon>assignment_turned_in</mat-icon>
              {{ getSubmissionCount(a.id!) }} submissions received
            </div>
          </div>
        } @empty {
          <div class="empty-state card">
            <mat-icon>assignment</mat-icon>
            <p>No assignments created yet. Click "New Assignment" to start.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .create-form { padding: var(--space-6); margin-bottom: var(--space-6); h3 { margin-bottom: var(--space-5); } }
    .form-grid { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .form-actions { display: flex; justify-content: flex-end; }
    .assignments-list { display: flex; flex-direction: column; gap: var(--space-4); }
    .assignment-card { padding: var(--space-5); }
    .assign-head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-3); h3 { font-size: 1rem; color: var(--color-text-heading); margin-bottom: var(--space-2); } }
    .assign-meta { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
    .assign-due { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-text-caption); mat-icon { font-size: 14px; width: 14px; height: 14px; } }
    .assign-desc { font-size: 0.875rem; color: var(--color-text-caption); line-height: 1.6; margin-bottom: var(--space-3); }
    .submissions-count { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--color-text-caption); mat-icon { font-size: 16px; color: var(--color-primary); } }
    .empty-state { text-align: center; padding: var(--space-10); mat-icon { font-size: 48px; color: var(--color-text-muted); display: block; margin-bottom: var(--space-3); } p { color: var(--color-text-caption); } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `],
})
export class TeacherAssignmentsComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  showForm = signal(false);
  creating = signal(false);

  form = this.fb.group({
    title:       ['', Validators.required],
    description: ['', Validators.required],
    classId:     ['', Validators.required],
    subjectId:   ['', Validators.required],
    dueDate:     ['', Validators.required],
  });

  assignments = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => u ? this.fs.collection$<Assignment>(
        'assignments',
        this.fs.where('teacherId', '==', u.uid),
        this.fs.orderBy('createdAt', 'desc')
      ) : of([]))
    ),
    { initialValue: [] }
  );

  submissions = toSignal(
    this.fs.collection$<Submission>('submissions'),
    { initialValue: [] }
  );

  classes = toSignal(this.fs.collection$<SchoolClass>('classes'), { initialValue: [] });
  subjects = toSignal(this.fs.collection$<Subject>('subjects'), { initialValue: [] });

  getSubmissionCount(assignmentId: string): number {
    return this.submissions().filter((s) => s.assignmentId === assignmentId).length;
  }

  create(): void {
    const uid = this.auth.currentUser()?.uid;
    if (!uid || this.form.invalid) return;
    this.creating.set(true);

    this.fs.add('assignments', { ...this.form.value, teacherId: uid }).subscribe({
      next: () => {
        this.creating.set(false);
        this.showForm.set(false);
        this.form.reset();
        this.toast.success('Assignment created!');
      },
      error: () => { this.creating.set(false); this.toast.error('Failed to create assignment.'); },
    });
  }

  deleteAssignment(id: string): void {
    this.fs.delete(`assignments/${id}`).subscribe(() =>
      this.toast.success('Assignment deleted.')
    );
  }
}
