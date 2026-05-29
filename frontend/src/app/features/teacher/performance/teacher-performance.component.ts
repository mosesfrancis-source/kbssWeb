import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from '../../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Student, Result, scoreToGrade, gradeColor } from '../../../shared/models';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-teacher-performance',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <h1>Student Performance</h1>
          <p>View and analyze student academic performance</p>
        </div>
        <button mat-stroked-button (click)="exportCSV()">
          <mat-icon>download</mat-icon> Export CSV
        </button>
      </div>

      <!-- Summary stats -->
      <div class="perf-summary">
        <div class="perf-stat card">
          <div class="ps-val">{{ classAverage() }}%</div>
          <div class="ps-lbl">Class Average</div>
        </div>
        <div class="perf-stat card">
          <div class="ps-val">{{ topPerformers().length }}</div>
          <div class="ps-lbl">A1 / B2 Grades</div>
        </div>
        <div class="perf-stat card">
          <div class="ps-val">{{ atRiskCount() }}</div>
          <div class="ps-lbl">At Risk (&lt;50%)</div>
        </div>
        <div class="perf-stat card">
          <div class="ps-val">{{ students().length }}</div>
          <div class="ps-lbl">Total Students</div>
        </div>
      </div>

      <!-- Performance table -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <h3>Student Ranking</h3>
        </div>
        <table class="perf-table">
          <thead>
            <tr><th>Rank</th><th>Student ID</th><th>Name</th><th>Avg Score</th><th>Grade</th><th>Subjects</th><th>Status</th></tr>
          </thead>
          <tbody>
            @for (s of rankedStudents(); track s.uid; let i = $index) {
              <tr>
                <td class="rank">
                  @if (i < 3) {
                    <span class="rank-medal" [class]="['gold','silver','bronze'][i]">{{ ['🥇','🥈','🥉'][i] }}</span>
                  } @else {
                    <span class="mono">{{ i + 1 }}</span>
                  }
                </td>
                <td class="mono">{{ s.studentId }}</td>
                <td>{{ s.fullName }}</td>
                <td>
                  <span class="score-mono" [class]="'grade-' + (s.avg >= 75 ? 'high' : s.avg >= 50 ? 'mid' : 'low')">
                    {{ s.avg }}%
                  </span>
                </td>
                <td><span class="badge" [class]="'badge-' + gradeClass(scoreToGrade(s.avg))">{{ scoreToGrade(s.avg) }}</span></td>
                <td class="mono">{{ s.subjects }}</td>
                <td>
                  @if (s.avg >= 50) {
                    <span class="badge badge-success">Passing</span>
                  } @else {
                    <span class="badge badge-error">At Risk</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="empty-row"><mat-icon>info</mat-icon> No results data available</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .perf-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-bottom: var(--space-6); @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } }
    .perf-stat { text-align: center; padding: var(--space-6); }
    .ps-val { font-family: var(--font-mono); font-size: 2.5rem; font-weight: 700; color: var(--color-primary-dark); line-height: 1; margin-bottom: 8px; }
    .ps-lbl { font-size: 0.875rem; color: var(--color-text-caption); }
    .perf-table { width: 100%; border-collapse: collapse; th, td { padding: 10px 14px; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; } th { background: var(--color-surface-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; color: var(--color-text-caption); } tr:hover td { background: var(--color-primary-50); } }
    .rank { text-align: center; }
    .rank-medal { font-size: 1.2rem; }
    .score-mono { font-family: var(--font-mono); font-weight: 700; &.grade-high { color: var(--color-success); } &.grade-mid { color: var(--color-warning); } &.grade-low { color: var(--color-error); } }
    .empty-row { text-align: center; padding: var(--space-10) !important; color: var(--color-text-muted); mat-icon { display: block; margin-bottom: var(--space-2); } }
  `],
})
export class TeacherPerformanceComponent {
  private fs = inject(FirestoreService);

  students = toSignal(
    this.fs.collection$<Student>('students', this.fs.limit(100)),
    { initialValue: [] }
  );

  results = toSignal(
    this.fs.collection$<Result>('results', this.fs.limit(500)),
    { initialValue: [] }
  );

  rankedStudents = () => {
    const resultMap = new Map<string, number[]>();
    this.results().forEach((r) => {
      const arr = resultMap.get(r.studentId) ?? [];
      arr.push(r.score);
      resultMap.set(r.studentId, arr);
    });

    return this.students()
      .map((s) => {
        const scores = resultMap.get(s.uid) ?? [];
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        return { ...s, avg, subjects: scores.length };
      })
      .sort((a, b) => b.avg - a.avg);
  };

  classAverage = () => {
    const r = this.rankedStudents();
    if (!r.length) return 0;
    return Math.round(r.reduce((s, x) => s + x.avg, 0) / r.length);
  };

  topPerformers = () => this.rankedStudents().filter((s) => s.avg >= 70);
  atRiskCount   = () => this.rankedStudents().filter((s) => s.avg < 50).length;

  scoreToGrade = scoreToGrade;
  gradeClass = gradeColor;

  exportCSV(): void {
    const rows = this.rankedStudents().map((s, i) =>
      `${i + 1},${s.studentId},${s.fullName},${s.avg}%,${scoreToGrade(s.avg)}`
    );
    const csv = ['Rank,Student ID,Name,Average,Grade', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-performance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
