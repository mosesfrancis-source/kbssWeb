import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Admission } from '../../../shared/models';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-admissions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, FormsModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Admissions</h1>
        <p>Review and process student admission applications</p>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        @for (tab of tabs; track tab.value) {
          <button [class.active]="activeFilter() === tab.value" (click)="activeFilter.set(tab.value)">
            {{ tab.label }} ({{ countByStatus(tab.value) }})
          </button>
        }
      </div>

      <!-- Applications list -->
      <div class="applications-list">
        @for (a of filteredAdmissions(); track a.id) {
          <div class="application-card card" [class]="'status-' + a.status">
            <div class="app-header">
              <div class="app-info">
                <h3>{{ a.fullName }}</h3>
                <div class="app-meta">
                  <span class="badge" [class]="statusBadge(a.status)">{{ a.status }}</span>
                  <span class="app-class">{{ a.preferredClass }}</span>
                  <span class="app-date"><mat-icon>calendar_today</mat-icon>{{ formatDate(a.submittedAt) }}</span>
                </div>
              </div>
              <div class="app-actions">
                @if (a.status === 'pending') {
                  <button mat-raised-button color="primary" class="btn-sm" (click)="review(a, 'approved')">
                    <mat-icon>check_circle</mat-icon> Approve
                  </button>
                  <button mat-stroked-button color="warn" class="btn-sm" (click)="review(a, 'rejected')">
                    <mat-icon>cancel</mat-icon> Reject
                  </button>
                }
              </div>
            </div>

            <div class="app-details">
              <div class="detail-item"><mat-icon>people</mat-icon><span>{{ a.guardianName }}</span></div>
              <div class="detail-item"><mat-icon>phone</mat-icon><span>{{ a.guardianPhone }}</span></div>
              <div class="detail-item"><mat-icon>school</mat-icon><span>Former: {{ a.formerSchool }}</span></div>
              <div class="detail-item"><mat-icon>email</mat-icon><span>{{ a.guardianEmail }}</span></div>
            </div>

            @if (a.documentsURL?.length) {
              <div class="app-docs">
                <mat-icon>attach_file</mat-icon>
                <span>{{ a.documentsURL.length }} document(s) uploaded</span>
                @for (url of a.documentsURL; track url) {
                  <a [href]="url" target="_blank" mat-button class="btn-sm">View</a>
                }
              </div>
            }
          </div>
        } @empty {
          <div class="empty-state card">
            <mat-icon>inbox</mat-icon>
            <p>No {{ activeFilter() === 'all' ? '' : activeFilter() }} applications</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./admin-admissions.component.scss'],
})
export class AdminAdmissionsComponent {
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);

  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  tabs = [
    { label: 'Pending', value: 'pending' as const },
    { label: 'Approved', value: 'approved' as const },
    { label: 'Rejected', value: 'rejected' as const },
    { label: 'All', value: 'all' as const },
  ];

  admissions = toSignal(
    this.fs.collection$<Admission>('admissions', this.fs.orderBy('submittedAt', 'desc'), this.fs.limit(100)),
    { initialValue: [] }
  );

  filteredAdmissions = () => {
    const f = this.activeFilter();
    return f === 'all' ? this.admissions() : this.admissions().filter((a) => a.status === f);
  };

  countByStatus(status: string): number {
    return status === 'all' ? this.admissions().length :
      this.admissions().filter((a) => a.status === status).length;
  }

  review(admission: Admission, status: 'approved' | 'rejected'): void {
    const id = admission.id;
    if (!id) return;
    this.fs.update(`admissions/${id}`, { status }).subscribe(() => {
      this.toast.success(`Application ${status}!`);
    });
  }

  statusBadge(status: string): string {
    if (status === 'approved') return 'badge-success';
    if (status === 'rejected') return 'badge-error';
    return 'badge-warning';
  }

  formatDate(ts: Timestamp): string {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
