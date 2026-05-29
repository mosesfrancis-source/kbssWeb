import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { FunctionsService } from '../../../core/services/functions.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserDoc } from '../../../shared/models';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, FormsModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>User Management</h1>
        <p>Manage user accounts and roles</p>
      </div>

      <div class="data-table-container">
        <div class="table-toolbar">
          <h3>All User Accounts ({{ users().length }})</h3>
        </div>
        <table class="users-table">
          <thead>
            <tr><th>#</th><th>Display Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (u of users(); track u.uid; let i = $index) {
              <tr>
                <td class="mono">{{ i + 1 }}</td>
                <td>{{ u.displayName }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="badge" [class]="roleBadge(u.role)">{{ u.role }}</span>
                </td>
                <td class="mono">{{ formatDate(u.createdAt) }}</td>
                <td>
                  <span class="badge" [class]="u.isActive ? 'badge-success' : 'badge-error'">
                    {{ u.isActive ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td>
                  <div class="role-select-wrap">
                    <select class="role-select" [value]="u.role"
                            (change)="changeRole(u.uid, $event)">
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <mat-icon>expand_more</mat-icon>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="empty-row"><mat-icon>manage_accounts</mat-icon> No users found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .users-table { width: 100%; border-collapse: collapse; th, td { padding: 10px 14px; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; } th { background: var(--color-surface-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; color: var(--color-text-caption); } tr:hover td { background: var(--color-primary-50); } }
    .role-select-wrap { display: flex; align-items: center; background: var(--color-surface-muted); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 4px 8px; gap: 4px; position: relative; mat-icon { font-size: 16px; color: var(--color-text-caption); } }
    .role-select { border: none; outline: none; background: transparent; font-size: 0.875rem; color: var(--color-text-body); font-family: var(--font-body); cursor: pointer; }
    .empty-row { text-align: center !important; padding: var(--space-10) !important; color: var(--color-text-muted); mat-icon { display: block; font-size: 36px; margin-bottom: 8px; } }
  `],
})
export class AdminUsersComponent {
  private fs = inject(FirestoreService);
  private functions = inject(FunctionsService);
  private toast = inject(ToastService);

  users = toSignal(
    this.fs.collection$<UserDoc>('users', this.fs.orderBy('createdAt', 'desc'), this.fs.limit(200)),
    { initialValue: [] }
  );

  changeRole(uid: string, event: Event): void {
    const role = (event.target as HTMLSelectElement).value as 'student' | 'teacher' | 'admin';
    this.functions.setUserRole(uid, role).subscribe({
      next: () => this.toast.success(`Role updated to ${role}`),
      error: () => this.toast.error('Failed to update role.'),
    });
  }

  roleBadge(role: string): string {
    if (role === 'admin')   return 'badge-error';
    if (role === 'teacher') return 'badge-warning';
    return 'badge-primary';
  }

  formatDate(ts: Timestamp): string {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  }
}
