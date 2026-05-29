import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SchoolClass, Subject, Teacher } from '../../../shared/models';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>My Courses</h1>
        <p>Your enrolled subjects and class information</p>
      </div>

      <!-- Class card -->
      @if (classInfo()) {
        <div class="class-hero-card card">
          <div class="class-hero-icon"><mat-icon>class</mat-icon></div>
          <div class="class-hero-info">
            <h2>{{ classInfo()!.name }}</h2>
            <p>Academic Year: {{ classInfo()!.academicYear }}</p>
            <div class="class-meta-row">
              <span class="badge badge-primary">{{ classInfo()!.level }}</span>
              <span class="class-subj-count">
                <mat-icon>menu_book</mat-icon>
                {{ subjects().length }} Subjects
              </span>
            </div>
          </div>
        </div>
      }

      <!-- Subjects grid -->
      <h3 class="subjects-heading">Enrolled Subjects</h3>
      <div class="subjects-grid">
        @for (subj of subjects(); track subj.id) {
          <div class="subject-card card card-hover">
            <div class="subj-icon-wrap" [class]="'division-' + subj.division.toLowerCase()">
              <mat-icon>{{ subjectIcon(subj.name) }}</mat-icon>
            </div>
            <h4>{{ subj.name }}</h4>
            <p class="subj-code mono">{{ subj.code }}</p>
            <span class="badge badge-primary">{{ subj.division }}</span>
            <span class="badge badge-neutral subj-level">{{ subj.level }}</span>
          </div>
        } @empty {
          @for (n of [1,2,3,4,5,6]; track n) {
            <div class="subject-card card">
              <div class="skeleton" style="height:48px;width:48px;border-radius:8px;margin-bottom:12px;"></div>
              <div class="skeleton" style="height:18px;margin-bottom:8px;"></div>
              <div class="skeleton" style="height:14px;width:50%;"></div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .class-hero-card { display: flex; align-items: center; gap: var(--space-5); padding: var(--space-6); margin-bottom: var(--space-8); }
    .class-hero-icon { width: 64px; height: 64px; border-radius: var(--radius-lg); background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 32px; } }
    .class-hero-info { h2 { font-size: 1.5rem; margin-bottom: 4px; } p { color: var(--color-text-caption); margin-bottom: var(--space-3); font-size: 0.875rem; } }
    .class-meta-row { display: flex; align-items: center; gap: var(--space-3); }
    .class-subj-count { display: flex; align-items: center; gap: 4px; font-size: 0.875rem; color: var(--color-text-caption); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .subjects-heading { font-size: 1rem; color: var(--color-text-heading); margin-bottom: var(--space-4); }
    .subjects-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); } @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 480px) { grid-template-columns: 1fr; } }
    .subject-card { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2); }
    .subj-icon-wrap { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-2); &.division-core       { background: var(--color-primary-50); color: var(--color-primary); } &.division-science    { background: var(--color-success-bg); color: var(--color-success); } &.division-arts       { background: #F3E5F5; color: #7B1FA2; } &.division-commercial { background: #FFF8E1; color: #F57F17; } mat-icon { font-size: 22px; } }
    h4 { font-size: 0.9rem; color: var(--color-text-heading); margin: 0; }
    .subj-code { font-size: 12px; }
    .subj-level { margin-left: var(--space-1); }
  `],
})
export class StudentCoursesComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);

  private student$ = this.auth.currentUser$.pipe(
    switchMap((u) => u ? this.fs.doc$<{ classId: string }>(`students/${u.uid}`) : of(null))
  );

  classInfo = toSignal(
    this.student$.pipe(
      switchMap((s) => s?.classId ? this.fs.doc$<SchoolClass>(`classes/${s.classId}`) : of(null))
    ),
    { initialValue: null }
  );

  subjects = toSignal(
    this.fs.collection$<Subject>('subjects'),
    { initialValue: [] }
  );

  subjectIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('math')) return 'calculate';
    if (n.includes('english')) return 'menu_book';
    if (n.includes('science') || n.includes('biology') || n.includes('chemistry') || n.includes('physics')) return 'science';
    if (n.includes('history')) return 'history_edu';
    if (n.includes('geography')) return 'terrain';
    if (n.includes('french')) return 'translate';
    if (n.includes('economics')) return 'trending_up';
    if (n.includes('commerce')) return 'store';
    if (n.includes('accounts')) return 'account_balance';
    if (n.includes('pe') || n.includes('physical')) return 'sports_soccer';
    if (n.includes('art')) return 'palette';
    return 'book';
  }
}
