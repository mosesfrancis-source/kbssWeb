import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FirestoreService } from '../../../core/services/firestore.service';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Student, Teacher, Admission } from '../../../shared/models';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="route-wrapper">
      <!-- Glass hero header with badge -->
      <div class="admin-hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <img src="assets/images/kbss-badge.svg" alt="K.B.S.S" class="admin-badge"
               onerror="this.style.display='none'">
          <div class="hero-text">
            <h1>Admin Dashboard</h1>
            <p>Kissi Bendu Secondary School — Academic Year 2024/2025</p>
          </div>
        </div>
      </div>

      <!-- KPI Stats -->
      <div class="kpi-grid">
        <div class="kpi-card card card-hover" routerLink="/admin/students">
          <div class="kpi-icon students"><mat-icon>school</mat-icon></div>
          <div class="kpi-info">
            <div class="kpi-value">{{ studentCount() }}</div>
            <div class="kpi-label">Total Students</div>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

        <div class="kpi-card card card-hover" routerLink="/admin/teachers">
          <div class="kpi-icon teachers"><mat-icon>supervisor_account</mat-icon></div>
          <div class="kpi-info">
            <div class="kpi-value">{{ teacherCount() }}</div>
            <div class="kpi-label">Teaching Staff</div>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

        <div class="kpi-card card card-hover" routerLink="/admin/classes">
          <div class="kpi-icon classes"><mat-icon>class</mat-icon></div>
          <div class="kpi-info">
            <div class="kpi-value">{{ classCount() }}</div>
            <div class="kpi-label">Active Classes</div>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

        <div class="kpi-card card card-hover accent" routerLink="/admin/admissions">
          <div class="kpi-icon admissions"><mat-icon>pending_actions</mat-icon></div>
          <div class="kpi-info">
            <div class="kpi-value">{{ pendingAdmissions() }}</div>
            <div class="kpi-label">Pending Admissions</div>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>
      </div>

      <!-- Main panels -->
      <div class="admin-grid">
        <!-- Recent Admissions -->
        <div class="admin-panel card">
          <div class="panel-header">
            <h3><mat-icon>person_add</mat-icon> Recent Admissions</h3>
            <a routerLink="/admin/admissions" mat-button color="primary" class="btn-sm">View All</a>
          </div>
          <div class="panel-content">
            @for (a of recentAdmissions(); track a.id) {
              <div class="admission-row">
                <div class="admission-info">
                  <div class="adm-name">{{ a.fullName }}</div>
                  <div class="adm-class">{{ a.preferredClass }}</div>
                </div>
                <span class="badge" [class]="statusBadge(a.status)">{{ a.status }}</span>
              </div>
            } @empty {
              <div class="empty-panel"><mat-icon>inbox</mat-icon><p>No recent applications</p></div>
            }
          </div>
        </div>

        <!-- System Activity -->
        <div class="admin-panel card">
          <div class="panel-header">
            <h3><mat-icon>history</mat-icon> System Activity</h3>
          </div>
          <div class="panel-content">
            @for (item of activityLog; track item.time) {
              <div class="activity-item">
                <div class="activity-dot" [class]="item.type"></div>
                <div class="activity-info">
                  <div class="activity-text">{{ item.text }}</div>
                  <div class="activity-time">{{ item.time }}</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Gender Distribution -->
        <div class="admin-panel card">
          <div class="panel-header">
            <h3><mat-icon>people</mat-icon> Enrollment</h3>
          </div>
          <div class="panel-content stats-breakdown">
            <div class="gender-chart">
              <div class="gender-bar">
                <div class="gender-fill male" [style.width]="malePct() + '%'"></div>
                <div class="gender-fill female" [style.width]="femalePct() + '%'"></div>
              </div>
              <div class="gender-labels">
                <span class="gender-label male">
                  <span class="gender-dot male"></span>
                  Male — {{ maleCount() }} ({{ malePct() }}%)
                </span>
                <span class="gender-label female">
                  <span class="gender-dot female"></span>
                  Female — {{ femaleCount() }} ({{ femalePct() }}%)
                </span>
              </div>
            </div>

            <div class="level-stats">
              <div class="level-row">
                <span class="level-name">JSS Students</span>
                <span class="level-val mono">{{ jssCount() }}</span>
              </div>
              <div class="level-row">
                <span class="level-name">SSS Students</span>
                <span class="level-val mono">{{ sssCount() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Admin Actions -->
      <div class="admin-actions-grid">
        @for (action of adminActions; track action.label) {
          <a [routerLink]="action.path" class="admin-action card card-hover">
            <div class="admin-action-icon" [class]="action.color">
              <mat-icon>{{ action.icon }}</mat-icon>
            </div>
            <div class="admin-action-text">
              <div class="admin-action-label">{{ action.label }}</div>
              <div class="admin-action-desc">{{ action.desc }}</div>
            </div>
            <mat-icon class="chevron">chevron_right</mat-icon>
          </a>
        }
      </div>
    </div>
  `,
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {
  private fs = inject(FirestoreService);
  private auth = inject(AuthService);

  students = toSignal(this.fs.collection$<Student>('students', this.fs.limit(500)), { initialValue: [] });
  teachers = toSignal(this.fs.collection$<Teacher>('teachers', this.fs.limit(100)), { initialValue: [] });
  admissions = toSignal(this.fs.collection$<Admission>('admissions', this.fs.orderBy('submittedAt', 'desc'), this.fs.limit(50)), { initialValue: [] });
  classes = toSignal(this.fs.collection$<{ classId: string }>('classes'), { initialValue: [] });

  studentCount = () => this.students().length;
  teacherCount = () => this.teachers().length;
  classCount   = () => this.classes().length;
  pendingAdmissions = () => this.admissions().filter((a) => a.status === 'pending').length;
  recentAdmissions  = () => this.admissions().slice(0, 5);

  maleCount   = () => this.students().filter((s) => s.gender === 'Male').length;
  femaleCount = () => this.students().filter((s) => s.gender === 'Female').length;
  malePct  = () => this.studentCount() ? Math.round((this.maleCount() / this.studentCount()) * 100) : 0;
  femalePct = () => this.studentCount() ? 100 - this.malePct() : 0;
  jssCount = () => this.students().filter((s) => s.classId?.startsWith('jss') || s.classId?.includes('JSS')).length;
  sssCount = () => this.students().filter((s) => s.classId?.startsWith('sss') || s.classId?.includes('SSS')).length;

  statusBadge(status: string): string {
    if (status === 'approved') return 'badge-success';
    if (status === 'rejected') return 'badge-error';
    return 'badge-warning';
  }

  activityLog = [
    { text: 'New admission application received', time: '2 mins ago', type: 'info' },
    { text: 'Results uploaded for JSS 2A', time: '1 hour ago', type: 'success' },
    { text: 'Announcement published by Mr. Koroma', time: '3 hours ago', type: 'primary' },
    { text: 'New teacher account created', time: 'Yesterday', type: 'primary' },
    { text: 'Gallery images uploaded', time: '2 days ago', type: 'info' },
  ];

  adminActions = [
    { label: 'Manage Students',    desc: 'Add, edit, and manage student records', path: '/admin/students',    icon: 'school',          color: 'primary' },
    { label: 'Manage Teachers',    desc: 'Staff records and subject assignments',  path: '/admin/teachers',    icon: 'supervisor_account', color: 'primary' },
    { label: 'Review Admissions',  desc: 'Approve or reject applications',        path: '/admin/admissions',  icon: 'person_add',      color: 'accent' },
    { label: 'Generate Reports',   desc: 'Download student result PDFs',          path: '/admin/reports',     icon: 'description',     color: 'primary' },
    { label: 'Analytics',          desc: 'School-wide performance analytics',     path: '/admin/analytics',   icon: 'analytics',       color: 'success' },
    { label: 'School Settings',    desc: 'Configure school information',          path: '/admin/settings',    icon: 'settings',        color: 'neutral' },
  ];
}
