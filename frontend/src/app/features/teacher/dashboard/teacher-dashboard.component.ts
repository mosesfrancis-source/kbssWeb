import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Assignment, Submission, Announcement } from '../../../shared/models';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="route-wrapper">
      <!-- Welcome -->
      <div class="dash-welcome">
        <div>
          <h1>Good {{ greeting() }}, {{ firstName() }}!</h1>
          <p>Manage your classes and track student progress</p>
        </div>
        @if (user()?.photoURL) {
          <img [src]="user()!.photoURL" alt="" class="dash-avatar">
        } @else {
          <div class="dash-avatar-fb">{{ firstName().charAt(0) }}</div>
        }
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon primary"><mat-icon>groups</mat-icon></div>
          <div class="stat-value">{{ classCount() }}</div>
          <div class="stat-label">My Classes</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-value">{{ ungradedCount() }}</div>
          <div class="stat-label">Pending Grading</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success"><mat-icon>assignment_turned_in</mat-icon></div>
          <div class="stat-value">{{ myAssignments().length }}</div>
          <div class="stat-label">Active Assignments</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon primary"><mat-icon>school</mat-icon></div>
          <div class="stat-value">{{ studentCount() }}</div>
          <div class="stat-label">Total Students</div>
        </div>
      </div>

      <!-- Dashboard grid -->
      <div class="dash-grid">
        <!-- Today's schedule -->
        <div class="dash-panel card">
          <div class="panel-header">
            <h3><mat-icon>schedule</mat-icon> Today's Classes</h3>
            <a routerLink="/teacher/classes" mat-button color="primary" class="btn-sm">View All</a>
          </div>
          <div class="panel-content">
            @for (cls of todayClasses; track cls.time) {
              <div class="schedule-item">
                <div class="schedule-time">{{ cls.time }}</div>
                <div class="schedule-info">
                  <div class="schedule-class">{{ cls.name }}</div>
                  <div class="schedule-subject">{{ cls.subject }}</div>
                </div>
                <span class="badge badge-primary">{{ cls.room }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Pending submissions -->
        <div class="dash-panel card">
          <div class="panel-header">
            <h3><mat-icon>assignment</mat-icon> Pending Grading</h3>
            <a routerLink="/teacher/assignments" mat-button color="primary" class="btn-sm">Grade</a>
          </div>
          <div class="panel-content">
            @for (s of pendingSubmissions(); track s.id) {
              <div class="submission-item">
                <mat-icon>assignment_late</mat-icon>
                <div>
                  <div class="sub-student">Student submission</div>
                  <div class="sub-assign">Assignment: {{ s.assignmentId }}</div>
                </div>
                <a routerLink="/teacher/assignments" mat-mini-fab color="primary" class="grade-btn">
                  <mat-icon>edit</mat-icon>
                </a>
              </div>
            } @empty {
              <div class="empty-panel">
                <mat-icon>check_circle</mat-icon>
                <p>All submissions graded</p>
              </div>
            }
          </div>
        </div>

        <!-- Announcements -->
        <div class="dash-panel card">
          <div class="panel-header">
            <h3><mat-icon>campaign</mat-icon> Recent Announcements</h3>
            <a routerLink="/teacher/announcements" mat-button color="primary" class="btn-sm">New</a>
          </div>
          <div class="panel-content">
            @for (a of announcements(); track a.id) {
              <div class="ann-item">
                <div class="ann-title">{{ a.title }}</div>
                <div class="ann-body">{{ a.body | slice:0:80 }}...</div>
              </div>
            } @empty {
              <div class="empty-panel"><mat-icon>campaign</mat-icon><p>No recent announcements</p></div>
            }
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          @for (a of quickActions; track a.label) {
            <a [routerLink]="a.path" class="action-btn card card-hover">
              <div class="action-icon primary"><mat-icon>{{ a.icon }}</mat-icon></div>
              <span>{{ a.label }}</span>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./teacher-dashboard.component.scss'],
})
export class TeacherDashboardComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);

  user = this.auth.currentUser;
  firstName = () => this.user()?.displayName?.split(' ')[0] ?? 'Teacher';
  greeting(): string {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  myAssignments = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => u ? this.fs.collection$<Assignment>(
        'assignments',
        this.fs.where('teacherId', '==', u.uid),
        this.fs.orderBy('createdAt', 'desc'),
        this.fs.limit(10)
      ) : of([]))
    ),
    { initialValue: [] }
  );

  pendingSubmissions = toSignal(
    this.fs.collection$<Submission>(
      'submissions',
      this.fs.where('status', '==', 'pending'),
      this.fs.limit(10)
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

  classCount = () => 3;
  studentCount = () => 90;
  ungradedCount = () => this.pendingSubmissions().length;

  todayClasses = [
    { time: '8:00 AM', name: 'JSS 2A', subject: 'Mathematics', room: 'Room 3' },
    { time: '10:30 AM', name: 'SSS 1B', subject: 'Mathematics', room: 'Room 5' },
    { time: '1:00 PM', name: 'SSS 2A', subject: 'Further Math', room: 'Room 3' },
  ];

  quickActions = [
    { label: 'Grade Book',    path: '/teacher/grade-book',    icon: 'edit_note' },
    { label: 'Mark Attendance', path: '/teacher/attendance',  icon: 'how_to_reg' },
    { label: 'New Assignment', path: '/teacher/assignments',  icon: 'add_task' },
    { label: 'Upload Material', path: '/teacher/materials',   icon: 'upload_file' },
    { label: 'Announce',       path: '/teacher/announcements',icon: 'campaign' },
    { label: 'Performance',    path: '/teacher/performance',  icon: 'bar_chart' },
  ];
}
