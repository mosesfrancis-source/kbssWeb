import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { SchoolClass, Student } from '../../../shared/models';

@Component({
  selector: 'app-teacher-classes',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>My Classes</h1>
        <p>View student rosters for your assigned classes</p>
      </div>

      <div class="classes-grid">
        @for (cls of classes(); track cls.id) {
          <div class="class-card card card-hover">
            <div class="class-card-header">
              <div class="class-badge">{{ cls.level }}</div>
              <h3>{{ cls.name }}</h3>
              <p class="academic-year">{{ cls.academicYear }}</p>
            </div>
            <div class="class-stats">
              <div class="class-stat">
                <mat-icon>people</mat-icon>
                <span>{{ getStudentCount(cls.classId) }} Students</span>
              </div>
              <div class="class-stat">
                <mat-icon>menu_book</mat-icon>
                <span>{{ cls.subjectIds?.length ?? 0 }} Subjects</span>
              </div>
            </div>
            <div class="class-actions">
              <a [routerLink]="['/teacher/grade-book']" mat-stroked-button class="btn-sm">
                <mat-icon>edit_note</mat-icon> Grade Book
              </a>
              <a [routerLink]="['/teacher/attendance']" mat-raised-button color="primary" class="btn-sm">
                <mat-icon>how_to_reg</mat-icon> Attendance
              </a>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <mat-icon>class</mat-icon>
            <p>No classes assigned yet.</p>
          </div>
        }
      </div>

      <!-- Student roster -->
      <div class="data-table-container" style="margin-top: var(--space-8);">
        <div class="table-toolbar">
          <h3>Student Roster — All Classes</h3>
        </div>
        <table class="roster-table">
          <thead>
            <tr><th>#</th><th>Student ID</th><th>Name</th><th>Gender</th><th>Class</th></tr>
          </thead>
          <tbody>
            @for (s of students(); track s.id; let i = $index) {
              <tr>
                <td class="mono">{{ i + 1 }}</td>
                <td class="mono">{{ s.studentId }}</td>
                <td>{{ s.fullName }}</td>
                <td><span class="badge" [class]="s.gender === 'Male' ? 'badge-info' : 'badge-primary'">{{ s.gender }}</span></td>
                <td>{{ s.classId }}</td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="empty-row"><mat-icon>info</mat-icon> No students found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .classes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .class-card { padding: 0; overflow: hidden; }
    .class-card-header { background: var(--gradient-primary); padding: var(--space-5) var(--space-5) var(--space-4); h3 { color: white; font-size: 1.25rem; margin: 4px 0; } }
    .class-badge { display: inline-block; background: rgba(255,255,255,0.2); color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-full); margin-bottom: 4px; }
    .academic-year { color: rgba(255,255,255,0.7); font-size: 12px; margin: 0; }
    .class-stats { display: flex; gap: var(--space-4); padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); }
    .class-stat { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--color-text-caption); mat-icon { font-size: 18px; color: var(--color-primary); } }
    .class-actions { display: flex; gap: var(--space-2); padding: var(--space-3) var(--space-4); }
    .roster-table { width: 100%; border-collapse: collapse; th, td { padding: 10px 14px; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; } th { background: var(--color-surface-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; color: var(--color-text-caption); } tr:hover td { background: var(--color-primary-50); } }
    .empty-state { text-align: center; padding: var(--space-12); color: var(--color-text-muted); mat-icon { font-size: 48px; display: block; margin-bottom: var(--space-3); } }
    .empty-row { text-align: center; padding: var(--space-10) !important; color: var(--color-text-muted); mat-icon { display: block; margin-bottom: var(--space-2); } }
  `],
})
export class TeacherClassesComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);

  classes = toSignal(
    this.fs.collection$<SchoolClass>('classes'),
    { initialValue: [] }
  );

  students = toSignal(
    this.fs.collection$<Student>('students', this.fs.orderBy('fullName', 'asc'), this.fs.limit(100)),
    { initialValue: [] }
  );

  getStudentCount(classId: string): number {
    return this.students().filter((s) => s.classId === classId).length;
  }
}
