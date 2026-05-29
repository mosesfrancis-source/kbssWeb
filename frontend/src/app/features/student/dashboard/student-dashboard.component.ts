import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, combineLatest, of } from 'rxjs';
import { Result, Assignment, Announcement, AttendanceRecord } from '../../../shared/models';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatCardModule, MatProgressBarModule],
  template: `
    <div class="route-wrapper">
      <!-- Welcome Header -->
      <div class="dash-welcome">
        <div class="welcome-info">
          <h1>Good {{ greeting() }}, {{ firstName() }}!</h1>
          <p>Here's your academic overview for today.</p>
        </div>
        @if (user()?.photoURL) {
          <img [src]="user()!.photoURL" alt="Avatar" class="dash-avatar">
        } @else {
          <div class="dash-avatar-fb">{{ firstName().charAt(0) }}</div>
        }
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon primary"><mat-icon>grade</mat-icon></div>
          <div class="stat-value">{{ avgGrade() }}%</div>
          <div class="stat-label">Current Average</div>
          <div class="stat-change up" *ngIf="avgGrade() > 0">
            <mat-icon>trending_up</mat-icon> This term
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success"><mat-icon>how_to_reg</mat-icon></div>
          <div class="stat-value">{{ attendancePct() }}%</div>
          <div class="stat-label">Attendance Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning"><mat-icon>assignment</mat-icon></div>
          <div class="stat-value">{{ pendingAssignments() }}</div>
          <div class="stat-label">Pending Assignments</div>
          <a routerLink="/student/assignments" class="stat-link">View all</a>
        </div>
        <div class="stat-card">
          <div class="stat-icon primary"><mat-icon>menu_book</mat-icon></div>
          <div class="stat-value">{{ subjectCount() }}</div>
          <div class="stat-label">Active Subjects</div>
        </div>
      </div>

      <!-- Main content grid -->
      <div class="dash-grid">
        <!-- Recent Assignments -->
        <div class="dash-panel card">
          <div class="panel-header">
            <h3><mat-icon>assignment</mat-icon> Upcoming Assignments</h3>
            <a routerLink="/student/assignments" mat-button color="primary" class="btn-sm">View All</a>
          </div>
          <div class="panel-content">
            @for (a of recentAssignments(); track a.id) {
              <div class="assignment-item">
                <div class="assignment-info">
                  <div class="assignment-title">{{ a.title }}</div>
                  <div class="assignment-due">
                    <mat-icon>calendar_today</mat-icon>
                    Due: {{ a.dueDate }}
                  </div>
                </div>
                <span class="badge badge-warning">Pending</span>
              </div>
            } @empty {
              <div class="empty-panel">
                <mat-icon>check_circle</mat-icon>
                <p>No pending assignments</p>
              </div>
            }
          </div>
        </div>

        <!-- Recent Results -->
        <div class="dash-panel card">
          <div class="panel-header">
            <h3><mat-icon>grade</mat-icon> Recent Results</h3>
            <a routerLink="/student/results" mat-button color="primary" class="btn-sm">View All</a>
          </div>
          <div class="panel-content">
            @for (r of recentResults(); track r.id) {
              <div class="result-item">
                <div class="result-subj">Subject {{ r.subjectId }}</div>
                <div class="result-score-wrap">
                  <span class="result-score">{{ r.score }}%</span>
                  <span class="badge" [class]="'badge-' + gradeColor(r.grade)">{{ r.grade }}</span>
                </div>
              </div>
            } @empty {
              <div class="empty-panel">
                <mat-icon>info</mat-icon>
                <p>No results recorded yet</p>
              </div>
            }
          </div>
        </div>

        <!-- Announcements -->
        <div class="dash-panel card">
          <div class="panel-header">
            <h3><mat-icon>campaign</mat-icon> Announcements</h3>
          </div>
          <div class="panel-content">
            @for (ann of announcements(); track ann.id) {
              <div class="announcement-item" [class.pinned]="ann.isPinned">
                @if (ann.isPinned) { <mat-icon class="pin-icon">push_pin</mat-icon> }
                <div class="ann-title">{{ ann.title }}</div>
                <div class="ann-body">{{ ann.body | slice:0:100 }}...</div>
              </div>
            } @empty {
              <div class="empty-panel">
                <mat-icon>campaign</mat-icon>
                <p>No announcements</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          @for (action of quickActions; track action.label) {
            <a [routerLink]="action.path" class="action-btn card card-hover">
              <div class="action-icon" [class]="action.color">
                <mat-icon>{{ action.icon }}</mat-icon>
              </div>
              <span>{{ action.label }}</span>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);

  user = this.auth.currentUser;

  firstName = () => this.user()?.displayName?.split(' ')[0] ?? 'Student';

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  private uid = () => this.user()?.uid ?? '';

  recentResults = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => {
        if (!u) return of([]);
        return this.fs.collection$<Result>(
          'results',
          this.fs.where('studentId', '==', u.uid),
          this.fs.orderBy('createdAt', 'desc'),
          this.fs.limit(5)
        );
      })
    ),
    { initialValue: [] }
  );

  recentAssignments = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => {
        if (!u) return of([]);
        return this.fs.collection$<Assignment>(
          'assignments',
          this.fs.orderBy('dueDate', 'asc'),
          this.fs.limit(5)
        );
      })
    ),
    { initialValue: [] }
  );

  announcements = toSignal(
    this.fs.collection$<Announcement>(
      'announcements',
      this.fs.orderBy('createdAt', 'desc'),
      this.fs.limit(5)
    ),
    { initialValue: [] }
  );

  attendance = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => {
        if (!u) return of([]);
        return this.fs.collection$<AttendanceRecord>(
          'attendance',
          this.fs.where('studentId', '==', u.uid),
          this.fs.orderBy('date', 'desc'),
          this.fs.limit(30)
        );
      })
    ),
    { initialValue: [] }
  );

  avgGrade = () => {
    const results = this.recentResults();
    if (!results.length) return 0;
    return Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  };

  attendancePct = () => {
    const records = this.attendance();
    if (!records.length) return 100;
    const present = records.filter((r) => r.status !== 'absent').length;
    return Math.round((present / records.length) * 100);
  };

  pendingAssignments = () => this.recentAssignments().length;
  subjectCount = () => 8;

  gradeColor(grade: string): string {
    const g = grade?.toUpperCase() ?? '';
    if (['A1', 'B2', 'B3'].includes(g)) return 'success';
    if (['C4', 'C5', 'C6'].includes(g)) return 'warning';
    return 'error';
  }

  quickActions = [
    { label: 'My Results',   path: '/student/results',     icon: 'grade',         color: 'primary' },
    { label: 'Assignments',  path: '/student/assignments',  icon: 'assignment',    color: 'warning' },
    { label: 'Timetable',    path: '/student/timetable',    icon: 'schedule',      color: 'primary' },
    { label: 'Attendance',   path: '/student/attendance',   icon: 'how_to_reg',    color: 'success' },
    { label: 'Resources',    path: '/student/resources',    icon: 'folder_open',   color: 'primary' },
    { label: 'My Profile',   path: '/student/profile',      icon: 'account_circle',color: 'primary' },
  ];
}
