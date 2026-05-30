import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ─── Public shell (with navbar + footer) ──────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-shell/public-shell.component').then(
        (m) => m.PublicShellComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/public/home/home.component').then(
            (m) => m.HomeComponent
          ),
        title: 'Home — K.B.S.S Portal',
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/public/about/about.component').then(
            (m) => m.AboutComponent
          ),
        title: 'About — K.B.S.S',
      },
      {
        path: 'academics',
        loadComponent: () =>
          import('./features/public/academics/academics.component').then(
            (m) => m.AcademicsComponent
          ),
        title: 'Academics — K.B.S.S',
      },
      {
        path: 'admissions',
        loadComponent: () =>
          import('./features/public/admissions/admissions.component').then(
            (m) => m.AdmissionsComponent
          ),
        title: 'Admissions — K.B.S.S',
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./features/public/gallery/gallery.component').then(
            (m) => m.GalleryComponent
          ),
        title: 'Gallery — K.B.S.S',
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./features/public/news/news.component').then(
            (m) => m.NewsComponent
          ),
        title: 'News & Events — K.B.S.S',
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/contact/contact.component').then(
            (m) => m.ContactComponent
          ),
        title: 'Contact — K.B.S.S',
      },
    ],
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadComponent: () =>
      import('./layout/auth-shell/auth-shell.component').then(
        (m) => m.AuthShellComponent
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Sign In — K.B.S.S',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'Register — K.B.S.S',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
        title: 'Reset Password — K.B.S.S',
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ─── Student portal ───────────────────────────────────────────────────────
  {
    path: 'student',
    loadComponent: () =>
      import('./layout/portal-shell/portal-shell.component').then(
        (m) => m.PortalShellComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/student/dashboard/student-dashboard.component').then(
            (m) => m.StudentDashboardComponent
          ),
        title: 'Dashboard — Student Portal',
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/student/courses/student-courses.component').then(
            (m) => m.StudentCoursesComponent
          ),
        title: 'My Courses',
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./features/student/assignments/student-assignments.component').then(
            (m) => m.StudentAssignmentsComponent
          ),
        title: 'Assignments',
      },
      {
        path: 'results',
        loadComponent: () =>
          import('./features/student/results/student-results.component').then(
            (m) => m.StudentResultsComponent
          ),
        title: 'Results & Grades',
      },
      {
        path: 'timetable',
        loadComponent: () =>
          import('./features/student/timetable/student-timetable.component').then(
            (m) => m.StudentTimetableComponent
          ),
        title: 'Timetable',
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/student/attendance/student-attendance.component').then(
            (m) => m.StudentAttendanceComponent
          ),
        title: 'Attendance',
      },
      {
        path: 'resources',
        loadComponent: () =>
          import('./features/student/resources/student-resources.component').then(
            (m) => m.StudentResourcesComponent
          ),
        title: 'Learning Resources',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/student/notifications/student-notifications.component').then(
            (m) => m.StudentNotificationsComponent
          ),
        title: 'Notifications',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/student/profile/student-profile.component').then(
            (m) => m.StudentProfileComponent
          ),
        title: 'My Profile',
      },
    ],
  },

  // ─── Teacher portal ───────────────────────────────────────────────────────
  {
    path: 'teacher',
    loadComponent: () =>
      import('./layout/portal-shell/portal-shell.component').then(
        (m) => m.PortalShellComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['teacher'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/teacher/dashboard/teacher-dashboard.component').then(
            (m) => m.TeacherDashboardComponent
          ),
        title: 'Dashboard — Teacher Portal',
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./features/teacher/classes/teacher-classes.component').then(
            (m) => m.TeacherClassesComponent
          ),
        title: 'My Classes',
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./features/teacher/assignments/teacher-assignments.component').then(
            (m) => m.TeacherAssignmentsComponent
          ),
        title: 'Assignments',
      },
      {
        path: 'grade-book',
        loadComponent: () =>
          import('./features/teacher/grade-book/teacher-grade-book.component').then(
            (m) => m.TeacherGradeBookComponent
          ),
        title: 'Grade Book',
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/teacher/attendance/teacher-attendance.component').then(
            (m) => m.TeacherAttendanceComponent
          ),
        title: 'Attendance',
      },
      {
        path: 'materials',
        loadComponent: () =>
          import('./features/teacher/materials/teacher-materials.component').then(
            (m) => m.TeacherMaterialsComponent
          ),
        title: 'Upload Materials',
      },
      {
        path: 'announcements',
        loadComponent: () =>
          import('./features/teacher/announcements/teacher-announcements.component').then(
            (m) => m.TeacherAnnouncementsComponent
          ),
        title: 'Announcements',
      },
      {
        path: 'performance',
        loadComponent: () =>
          import('./features/teacher/performance/teacher-performance.component').then(
            (m) => m.TeacherPerformanceComponent
          ),
        title: 'Student Performance',
      },
    ],
  },

  // ─── Admin portal ─────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/portal-shell/portal-shell.component').then(
        (m) => m.PortalShellComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        title: 'Dashboard — Admin Portal',
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/admin/students/admin-students.component').then(
            (m) => m.AdminStudentsComponent
          ),
        title: 'Students Management',
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./features/admin/teachers/admin-teachers.component').then(
            (m) => m.AdminTeachersComponent
          ),
        title: 'Teachers Management',
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./features/admin/classes/admin-classes.component').then(
            (m) => m.AdminClassesComponent
          ),
        title: 'Classes & Subjects',
      },
      {
        path: 'admissions',
        loadComponent: () =>
          import('./features/admin/admissions/admin-admissions.component').then(
            (m) => m.AdminAdmissionsComponent
          ),
        title: 'Admissions',
      },
      {
        path: 'announcements',
        loadComponent: () =>
          import('./features/admin/announcements/admin-announcements.component').then(
            (m) => m.AdminAnnouncementsComponent
          ),
        title: 'Announcements',
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./features/admin/news/admin-news.component').then(
            (m) => m.AdminNewsComponent
          ),
        title: 'Post News — Admin',
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./features/admin/gallery/admin-gallery.component').then(
            (m) => m.AdminGalleryComponent
          ),
        title: 'Gallery Management',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/reports/admin-reports.component').then(
            (m) => m.AdminReportsComponent
          ),
        title: 'Reports',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/admin-users.component').then(
            (m) => m.AdminUsersComponent
          ),
        title: 'User Management',
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/analytics/admin-analytics.component').then(
            (m) => m.AdminAnalyticsComponent
          ),
        title: 'Analytics',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent
          ),
        title: 'Settings',
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: '404 — Page Not Found',
  },
];
