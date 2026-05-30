import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, UserRole } from '../../core/services/auth.service';

interface SidebarItem {
  label: string;
  icon: string;
  path: string;
}

const STUDENT_ITEMS: SidebarItem[] = [
  { label: 'Dashboard',    icon: 'dashboard',          path: '/student/dashboard' },
  { label: 'My Courses',   icon: 'menu_book',           path: '/student/courses' },
  { label: 'Assignments',  icon: 'assignment',          path: '/student/assignments' },
  { label: 'Results',      icon: 'grade',               path: '/student/results' },
  { label: 'Timetable',    icon: 'schedule',            path: '/student/timetable' },
  { label: 'Attendance',   icon: 'how_to_reg',          path: '/student/attendance' },
  { label: 'Resources',    icon: 'folder_open',         path: '/student/resources' },
  { label: 'Notifications',icon: 'notifications',       path: '/student/notifications' },
  { label: 'My Profile',   icon: 'account_circle',      path: '/student/profile' },
];

const TEACHER_ITEMS: SidebarItem[] = [
  { label: 'Dashboard',    icon: 'dashboard',           path: '/teacher/dashboard' },
  { label: 'My Classes',   icon: 'groups',              path: '/teacher/classes' },
  { label: 'Assignments',  icon: 'assignment',          path: '/teacher/assignments' },
  { label: 'Grade Book',   icon: 'edit_note',           path: '/teacher/grade-book' },
  { label: 'Attendance',   icon: 'how_to_reg',          path: '/teacher/attendance' },
  { label: 'Materials',    icon: 'upload_file',         path: '/teacher/materials' },
  { label: 'Announcements',icon: 'campaign',            path: '/teacher/announcements' },
  { label: 'Performance',  icon: 'bar_chart',           path: '/teacher/performance' },
];

const ADMIN_ITEMS: SidebarItem[] = [
  { label: 'Dashboard',    icon: 'dashboard',           path: '/admin/dashboard' },
  { label: 'Students',     icon: 'school',              path: '/admin/students' },
  { label: 'Teachers',     icon: 'supervisor_account',  path: '/admin/teachers' },
  { label: 'Classes',      icon: 'class',               path: '/admin/classes' },
  { label: 'Admissions',   icon: 'person_add',          path: '/admin/admissions' },
  { label: 'Post News',    icon: 'edit_note',           path: '/admin/news' },
  { label: 'Announcements',icon: 'campaign',            path: '/admin/announcements' },
  { label: 'Gallery',      icon: 'photo_library',       path: '/admin/gallery' },
  { label: 'Reports',      icon: 'description',         path: '/admin/reports' },
  { label: 'Users',        icon: 'manage_accounts',     path: '/admin/users' },
  { label: 'Analytics',    icon: 'analytics',           path: '/admin/analytics' },
  { label: 'Settings',     icon: 'settings',            path: '/admin/settings' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <aside class="sidebar" [class.open]="open">
      <!-- Brand -->
      <div class="sidebar-brand">
        <img src="assets/images/kbss-badge.svg" alt="K.B.S.S" class="sidebar-badge"
             onerror="this.style.display='none'">
        <div class="sidebar-brand-text">
          <span class="sidebar-abbr">K.B.S.S</span>
          <span class="sidebar-role">{{ getRoleLabel() }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav" role="navigation" aria-label="Portal navigation">
        @for (item of getItems(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            class="sidebar-item"
            [matTooltip]="item.label"
            matTooltipPosition="right"
            (click)="onItemClick()"
          >
            <mat-icon class="sidebar-icon">{{ item.icon }}</mat-icon>
            <span class="sidebar-label">{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="user-info">
          @if (auth.currentUser()?.photoURL) {
            <img [src]="auth.currentUser()!.photoURL" alt="" class="user-photo" />
          } @else {
            <div class="user-initials">
              {{ auth.currentUser()?.displayName?.charAt(0) || 'U' }}
            </div>
          }
          <div class="user-details">
            <span class="user-name">{{ auth.currentUser()?.displayName }}</span>
            <span class="user-role">{{ auth.role() | titlecase }}</span>
          </div>
        </div>
        <button
          mat-icon-button
          (click)="auth.logout().subscribe()"
          matTooltip="Sign out"
          class="logout-btn"
          aria-label="Sign out"
        >
          <mat-icon>logout</mat-icon>
        </button>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() open = true;
  @Input() role: UserRole = 'student';
  @Output() close = new EventEmitter<void>();

  auth = inject(AuthService);

  getItems(): SidebarItem[] {
    switch (this.role) {
      case 'admin': return ADMIN_ITEMS;
      case 'teacher': return TEACHER_ITEMS;
      default: return STUDENT_ITEMS;
    }
  }

  getRoleLabel(): string {
    switch (this.role) {
      case 'admin': return 'Admin Portal';
      case 'teacher': return 'Teacher Portal';
      default: return 'Student Portal';
    }
  }

  onItemClick(): void {
    if (window.innerWidth < 1024) this.close.emit();
  }
}
