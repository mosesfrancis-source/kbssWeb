import { Component, inject, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FirestoreService } from '../../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Student, AttendanceRecord, Result } from '../../../shared/models';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Analytics</h1>
        <p>School-wide performance and enrollment insights</p>
      </div>

      <!-- Summary KPIs -->
      <div class="analytics-kpis">
        <div class="kpi card">
          <div class="kpi-icon primary"><mat-icon>school</mat-icon></div>
          <div class="kpi-val">{{ students().length }}</div>
          <div class="kpi-lbl">Total Students</div>
        </div>
        <div class="kpi card">
          <div class="kpi-icon success"><mat-icon>how_to_reg</mat-icon></div>
          <div class="kpi-val">{{ avgAttendance() }}%</div>
          <div class="kpi-lbl">Avg. Attendance</div>
        </div>
        <div class="kpi card">
          <div class="kpi-icon primary"><mat-icon>grade</mat-icon></div>
          <div class="kpi-val">{{ avgScore() }}%</div>
          <div class="kpi-lbl">Avg. Score</div>
        </div>
        <div class="kpi card">
          <div class="kpi-icon success"><mat-icon>emoji_events</mat-icon></div>
          <div class="kpi-val">{{ passRate() }}%</div>
          <div class="kpi-lbl">Pass Rate (≥50%)</div>
        </div>
      </div>

      <!-- Charts section -->
      <div class="charts-grid">
        <!-- Gender chart -->
        <div class="chart-card card">
          <h3>Gender Distribution</h3>
          <div class="donut-chart">
            <div class="donut-visual" [style.background]="donutGradient()"></div>
            <div class="donut-center">
              <div class="donut-total">{{ students().length }}</div>
              <div class="donut-label">Students</div>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-row">
              <div class="legend-dot primary"></div>
              <span>Male: {{ maleCount() }} ({{ malePct() }}%)</span>
            </div>
            <div class="legend-row">
              <div class="legend-dot accent"></div>
              <span>Female: {{ femaleCount() }} ({{ femalePct() }}%)</span>
            </div>
          </div>
        </div>

        <!-- Grade distribution -->
        <div class="chart-card card">
          <h3>Grade Distribution</h3>
          <div class="bar-chart">
            @for (g of gradeDistribution(); track g.grade) {
              <div class="bar-row">
                <span class="bar-label">{{ g.grade }}</span>
                <div class="bar-track">
                  <div class="bar-fill" [class]="g.color"
                       [style.width]="(g.count / maxGradeCount() * 100) + '%'"></div>
                </div>
                <span class="bar-count">{{ g.count }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Enrollment by class level -->
        <div class="chart-card card">
          <h3>Enrollment by Level</h3>
          <div class="level-bars">
            <div class="level-bar-item">
              <div class="level-name">Junior Secondary (JSS)</div>
              <div class="level-track">
                <div class="level-fill jss" [style.width]="jssPct() + '%'"></div>
              </div>
              <span>{{ jssCount() }} ({{ jssPct() }}%)</span>
            </div>
            <div class="level-bar-item">
              <div class="level-name">Senior Secondary (SSS)</div>
              <div class="level-track">
                <div class="level-fill sss" [style.width]="sssPct() + '%'"></div>
              </div>
              <span>{{ sssCount() }} ({{ sssPct() }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Score distribution table -->
      <div class="data-table-container" style="margin-top: var(--space-8);">
        <div class="table-toolbar">
          <h3>Score Range Analysis</h3>
        </div>
        <table class="analytics-table">
          <thead>
            <tr><th>Score Range</th><th>Grade</th><th>Students</th><th>% of Total</th><th>Bar</th></tr>
          </thead>
          <tbody>
            @for (r of scoreRanges(); track r.range) {
              <tr>
                <td>{{ r.range }}</td>
                <td><span class="badge" [class]="r.badgeClass">{{ r.grade }}</span></td>
                <td class="mono">{{ r.count }}</td>
                <td class="mono">{{ r.pct }}%</td>
                <td>
                  <div class="mini-bar" [style.width]="r.pct + '%'" [class]="r.barClass"></div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .analytics-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-5); margin-bottom: var(--space-8); @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } }
    .kpi { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--space-6); gap: var(--space-2); }
    .kpi-icon { width: 52px; height: 52px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; mat-icon { font-size: 24px; } &.primary { background: var(--color-primary-50); color: var(--color-primary); } &.success { background: var(--color-success-bg); color: var(--color-success); } }
    .kpi-val { font-family: var(--font-mono); font-size: 2.5rem; font-weight: 700; color: var(--color-primary-dark); line-height: 1; }
    .kpi-lbl { font-size: 0.8rem; color: var(--color-text-caption); }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-6); @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; } @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .chart-card { padding: var(--space-5); h3 { font-size: 0.9rem; color: var(--color-text-heading); margin-bottom: var(--space-5); } }
    .donut-chart { position: relative; width: 140px; height: 140px; margin: 0 auto var(--space-4); }
    .donut-visual { width: 100%; height: 100%; border-radius: 50%; }
    .donut-center { position: absolute; inset: 20px; border-radius: 50%; background: var(--color-surface); display: flex; flex-direction: column; align-items: center; justify-content: center; .donut-total { font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--color-primary-dark); line-height: 1; } .donut-label { font-size: 11px; color: var(--color-text-caption); } }
    .chart-legend { display: flex; flex-direction: column; gap: var(--space-2); }
    .legend-row { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--color-text-body); }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; &.primary { background: var(--color-primary); } &.accent { background: var(--color-accent); } }
    .bar-chart { display: flex; flex-direction: column; gap: var(--space-2); }
    .bar-row { display: flex; align-items: center; gap: var(--space-2); }
    .bar-label { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--color-text-heading); width: 32px; text-align: right; }
    .bar-track { flex: 1; height: 12px; background: var(--color-surface-muted); border-radius: 999px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; &.success { background: var(--color-success); } &.warning { background: var(--color-warning); } &.error { background: var(--color-error); } &.primary { background: var(--color-primary); } }
    .bar-count { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-caption); width: 24px; }
    .level-bars { display: flex; flex-direction: column; gap: var(--space-6); padding-top: var(--space-4); }
    .level-bar-item { display: flex; flex-direction: column; gap: var(--space-2); .level-name { font-size: 0.875rem; color: var(--color-text-body); } span { font-size: 12px; color: var(--color-text-caption); font-family: var(--font-mono); } }
    .level-track { height: 16px; background: var(--color-surface-muted); border-radius: 999px; overflow: hidden; }
    .level-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; &.jss { background: var(--color-primary); } &.sss { background: var(--color-accent); } }
    .analytics-table { width: 100%; border-collapse: collapse; th, td { padding: 10px 14px; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; } th { background: var(--color-surface-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; color: var(--color-text-caption); } tr:hover td { background: var(--color-primary-50); } }
    .mini-bar { height: 8px; border-radius: 999px; min-width: 4px; transition: width 0.6s ease; &.success { background: var(--color-success); } &.warning { background: var(--color-warning); } &.error { background: var(--color-error); } &.primary { background: var(--color-primary); } }
  `],
})
export class AdminAnalyticsComponent {
  private fs = inject(FirestoreService);

  students = toSignal(this.fs.collection$<Student>('students', this.fs.limit(500)), { initialValue: [] });
  results  = toSignal(this.fs.collection$<Result>('results', this.fs.limit(1000)), { initialValue: [] });
  attendance = toSignal(this.fs.collection$<AttendanceRecord>('attendance', this.fs.limit(1000)), { initialValue: [] });

  maleCount   = () => this.students().filter((s) => s.gender === 'Male').length;
  femaleCount = () => this.students().filter((s) => s.gender === 'Female').length;
  malePct  = () => this.students().length ? Math.round((this.maleCount() / this.students().length) * 100) : 0;
  femalePct = () => 100 - this.malePct();

  jssCount = () => this.students().filter((s) => s.classId?.toUpperCase().includes('JSS')).length;
  sssCount = () => this.students().filter((s) => s.classId?.toUpperCase().includes('SSS')).length;
  jssPct = () => this.students().length ? Math.round((this.jssCount() / this.students().length) * 100) : 0;
  sssPct = () => 100 - this.jssPct();

  avgScore = () => {
    const r = this.results();
    return r.length ? Math.round(r.reduce((s, x) => s + x.score, 0) / r.length) : 0;
  };

  passRate = () => {
    const r = this.results();
    return r.length ? Math.round((r.filter((x) => x.score >= 50).length / r.length) * 100) : 0;
  };

  avgAttendance = () => {
    const r = this.attendance();
    return r.length ? Math.round((r.filter((x) => x.status !== 'absent').length / r.length) * 100) : 95;
  };

  donutGradient = () => {
    const m = this.malePct();
    return `conic-gradient(#1565C0 0% ${m}%, #C62828 ${m}% 100%)`;
  };

  gradeDistribution = () => {
    const grades = ['A1','B2','B3','C4','C5','C6','D7','E8','F9'];
    const results = this.results();
    return grades.map((g) => ({
      grade: g,
      count: results.filter((r) => r.grade === g).length,
      color: ['A1','B2','B3'].includes(g) ? 'success' : ['C4','C5','C6'].includes(g) ? 'warning' : 'error',
    }));
  };

  maxGradeCount = () => Math.max(...this.gradeDistribution().map((g) => g.count), 1);

  scoreRanges = () => {
    const r = this.results();
    const total = r.length || 1;
    const ranges = [
      { range: '75–100%', grade: 'A1', min: 75, badgeClass: 'badge-success', barClass: 'success' },
      { range: '70–74%',  grade: 'B2', min: 70, badgeClass: 'badge-success', barClass: 'success' },
      { range: '65–69%',  grade: 'B3', min: 65, badgeClass: 'badge-success', barClass: 'primary' },
      { range: '60–64%',  grade: 'C4', min: 60, badgeClass: 'badge-warning', barClass: 'warning' },
      { range: '55–59%',  grade: 'C5', min: 55, badgeClass: 'badge-warning', barClass: 'warning' },
      { range: '50–54%',  grade: 'C6', min: 50, badgeClass: 'badge-warning', barClass: 'warning' },
      { range: '0–49%',   grade: 'F',  min: 0,  badgeClass: 'badge-error',   barClass: 'error' },
    ];
    return ranges.map((rng, i) => {
      const max = i === 0 ? 101 : ranges[i - 1].min;
      const count = r.filter((x) => x.score >= rng.min && x.score < max).length;
      return { ...rng, count, pct: Math.round((count / total) * 100) };
    });
  };
}
