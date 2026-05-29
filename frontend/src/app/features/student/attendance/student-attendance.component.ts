import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { AttendanceRecord } from '../../../shared/models';

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Attendance Record</h1>
        <p>Your attendance history for this term</p>
      </div>

      <!-- Summary stats -->
      <div class="attend-stats">
        <div class="attend-stat card">
          <div class="stat-icon success"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-value">{{ presentCount() }}</div>
          <div class="stat-label">Days Present</div>
        </div>
        <div class="attend-stat card">
          <div class="stat-icon error"><mat-icon>cancel</mat-icon></div>
          <div class="stat-value">{{ absentCount() }}</div>
          <div class="stat-label">Days Absent</div>
        </div>
        <div class="attend-stat card">
          <div class="stat-icon warning"><mat-icon>schedule</mat-icon></div>
          <div class="stat-value">{{ lateCount() }}</div>
          <div class="stat-label">Days Late</div>
        </div>
        <div class="attend-stat card" [class]="pctClass()">
          <div class="stat-icon primary"><mat-icon>percent</mat-icon></div>
          <div class="stat-value">{{ attendancePct() }}%</div>
          <div class="stat-label">Attendance Rate</div>
        </div>
      </div>

      <!-- Records table -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <h3>Attendance Records</h3>
          <span class="badge" [class]="pctClass()">{{ attendancePct() }}% — {{ pctLabel() }}</span>
        </div>
        <table class="attend-table">
          <thead>
            <tr><th>Date</th><th>Day</th><th>Status</th><th>Recorded By</th></tr>
          </thead>
          <tbody>
            @for (r of records(); track r.id) {
              <tr>
                <td class="mono">{{ r.date }}</td>
                <td>{{ getDayName(r.date) }}</td>
                <td>
                  <span class="badge" [class]="statusBadge(r.status)">
                    <mat-icon>{{ statusIcon(r.status) }}</mat-icon>
                    {{ r.status | titlecase }}
                  </span>
                </td>
                <td>{{ r.recordedBy || 'Teacher' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="empty-row"><mat-icon>info</mat-icon> No attendance records found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .attend-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-bottom: var(--space-6); @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } }
    .attend-stat { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--space-5); gap: var(--space-2); }
    .stat-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; mat-icon { font-size: 22px; } &.primary { background: var(--color-primary-50); color: var(--color-primary); } &.success { background: var(--color-success-bg); color: var(--color-success); } &.warning { background: var(--color-warning-bg); color: var(--color-warning); } &.error { background: var(--color-error-bg); color: var(--color-error); } }
    .stat-value { font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: var(--color-text-heading); line-height: 1; }
    .stat-label { font-size: 12px; color: var(--color-text-caption); }
    .attend-table { width: 100%; border-collapse: collapse; th, td { padding: 12px 16px; text-align: left; font-size: 0.875rem; border-bottom: 1px solid var(--color-border); } th { background: var(--color-surface-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-caption); } tr:hover td { background: var(--color-primary-50); } }
    .badge mat-icon { font-size: 13px; width: 13px; height: 13px; vertical-align: middle; margin-right: 2px; }
    .empty-row { text-align: center; padding: var(--space-10) !important; color: var(--color-text-muted); mat-icon { display: block; margin-bottom: var(--space-2); } }
  `],
})
export class StudentAttendanceComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);

  records = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => {
        if (!u) return of([]);
        return this.fs.collection$<AttendanceRecord>(
          'attendance',
          this.fs.where('studentId', '==', u.uid),
          this.fs.orderBy('date', 'desc'),
          this.fs.limit(90)
        );
      })
    ),
    { initialValue: [] }
  );

  presentCount = () => this.records().filter((r) => r.status === 'present').length;
  absentCount  = () => this.records().filter((r) => r.status === 'absent').length;
  lateCount    = () => this.records().filter((r) => r.status === 'late').length;

  attendancePct = () => {
    const total = this.records().length;
    if (!total) return 100;
    return Math.round(((total - this.absentCount()) / total) * 100);
  };

  pctClass = () => {
    const p = this.attendancePct();
    if (p >= 80) return 'badge-success';
    if (p >= 60) return 'badge-warning';
    return 'badge-error';
  };

  pctLabel = () => {
    const p = this.attendancePct();
    if (p >= 80) return 'Good Standing';
    if (p >= 60) return 'Needs Improvement';
    return 'At Risk';
  };

  getDayName(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', { weekday: 'short' });
  }

  statusBadge(status: string): string {
    if (status === 'present') return 'badge-success';
    if (status === 'late') return 'badge-warning';
    return 'badge-error';
  }

  statusIcon(status: string): string {
    if (status === 'present') return 'check_circle';
    if (status === 'late') return 'schedule';
    return 'cancel';
  }
}
