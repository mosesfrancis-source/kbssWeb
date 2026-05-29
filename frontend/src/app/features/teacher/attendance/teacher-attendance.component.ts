import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Student, Teacher, SchoolClass } from '../../../shared/models';
import { serverTimestamp } from '@angular/fire/firestore';

type AttendStatus = 'present' | 'absent' | 'late';

interface AttendRow { uid: string; studentId: string; fullName: string; status: AttendStatus; }

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, FormsModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Mark Attendance</h1>
        <p>Record daily student attendance for your classes</p>
      </div>

      <!-- Toolbar -->
      <div class="attend-toolbar card">
        <mat-form-field appearance="outline">
          <mat-label>Class</mat-label>
          <mat-select [(ngModel)]="selectedClassIdValue" (ngModelChange)="onClassChange($event)">
            @for (c of myClasses(); track c.id) {
              <mat-option [value]="c.classId">{{ c.name }}</mat-option>
            }
            @if (!myClasses().length) {
              <mat-option value="">No classes assigned</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Date</mat-label>
          <input type="date" class="date-input" [(ngModel)]="selectedDate"
                 style="border:none;outline:none;background:transparent;font-size:0.875rem;">
        </mat-form-field>

        <div class="bulk-actions">
          <button mat-stroked-button (click)="markAll('present')">
            <mat-icon>check_circle</mat-icon> All Present
          </button>
          <button mat-stroked-button (click)="markAll('absent')">
            <mat-icon>cancel</mat-icon> All Absent
          </button>
        </div>

        <button mat-raised-button color="primary" (click)="save()" [disabled]="saving()">
          @if (saving()) {
            <mat-icon class="spin">refresh</mat-icon> Saving...
          } @else {
            <mat-icon>save</mat-icon> Save Attendance
          }
        </button>
      </div>

      <!-- Summary -->
      <div class="attend-summary">
        <div class="sum-item success">
          <mat-icon>check_circle</mat-icon>
          <span>Present: {{ presentCount() }}</span>
        </div>
        <div class="sum-item error">
          <mat-icon>cancel</mat-icon>
          <span>Absent: {{ absentCount() }}</span>
        </div>
        <div class="sum-item warning">
          <mat-icon>schedule</mat-icon>
          <span>Late: {{ lateCount() }}</span>
        </div>
      </div>

      <!-- Attendance table -->
      <div class="data-table-container">
        <table class="attend-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (row of attendRows(); track row.uid; let i = $index) {
              <tr [class]="'row-' + row.status">
                <td class="mono">{{ i + 1 }}</td>
                <td class="mono">{{ row.studentId }}</td>
                <td>{{ row.fullName }}</td>
                <td>
                  <div class="status-btns">
                    @for (s of statuses; track s) {
                      <button
                        [class.active]="row.status === s"
                        [class]="'status-btn ' + s"
                        (click)="row.status = s"
                        [title]="s | titlecase"
                      >
                        <mat-icon>{{ statusIcon(s) }}</mat-icon>
                        {{ s | titlecase }}
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="empty-row"><mat-icon>groups</mat-icon> No students found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./teacher-attendance.component.scss'],
})
export class TeacherAttendanceComponent {
  private auth  = inject(AuthService);
  private fs    = inject(FirestoreService);
  private toast = inject(ToastService);

  selectedDate = new Date().toISOString().split('T')[0];
  selectedClassIdValue = '';
  saving = signal(false);
  statuses: AttendStatus[] = ['present', 'absent', 'late'];

  // Load this teacher's Firestore document
  private teacherDoc = toSignal(
    toObservable(this.auth.currentUser).pipe(
      switchMap(u => u ? this.fs.getDoc<Teacher>(`teachers/${u.uid}`) : of(null))
    ), { initialValue: null }
  );

  allClasses  = toSignal(this.fs.collection$<SchoolClass>('classes'), { initialValue: [] });
  myClasses   = computed(() => {
    const ids = this.teacherDoc()?.classIds ?? [];
    const all = this.allClasses();
    return ids.length ? all.filter(c => ids.includes(c.classId)) : all;
  });

  private allStudents = toSignal(
    this.fs.collection$<Student>('students', this.fs.limit(100)),
    { initialValue: [] }
  );

  private _rows = signal<AttendRow[]>([]);
  attendRows = this._rows.asReadonly();

  constructor() {
    effect(() => {
      const ids = this.teacherDoc()?.classIds ?? [];
      if (ids.length && !this.selectedClassIdValue) {
        this.selectedClassIdValue = ids[0];
        this.refreshRows(ids[0]);
      }
    });
  }

  onClassChange(classId: string): void { this.refreshRows(classId); }

  private refreshRows(classId: string): void {
    const students = classId
      ? this.allStudents().filter(s => s.classId === classId)
      : this.allStudents();
    this._rows.set(students.map(s => ({ uid: s.uid, studentId: s.studentId, fullName: s.fullName, status: 'present' })));
  }

  presentCount = () => this.attendRows().filter(r => r.status === 'present').length;
  absentCount  = () => this.attendRows().filter(r => r.status === 'absent').length;
  lateCount    = () => this.attendRows().filter(r => r.status === 'late').length;

  markAll(status: AttendStatus): void {
    this._rows.update(rows => rows.map(r => ({ ...r, status })));
  }

  statusIcon(s: string): string {
    if (s === 'present') return 'check_circle';
    if (s === 'late') return 'schedule';
    return 'cancel';
  }

  toggleStatus(row: AttendRow): void {
    const cycle: AttendStatus[] = ['present', 'late', 'absent'];
    row.status = cycle[(cycle.indexOf(row.status) + 1) % 3];
  }

  save(): void {
    const teacherId = this.auth.currentUser()?.uid ?? '';
    const classId   = this.selectedClassIdValue || (this.teacherDoc()?.classIds?.[0] ?? '');
    if (!classId) { this.toast.error('No class selected.'); return; }
    this.saving.set(true);
    const rows = this.attendRows();
    let saved = 0;

    rows.forEach(row => {
      this.fs.add('attendance', {
        studentId: row.uid, classId,
        date: this.selectedDate, status: row.status, recordedBy: teacherId,
      }).subscribe(() => {
        if (++saved === rows.length) {
          this.saving.set(false);
          this.toast.success(`Attendance saved for ${saved} students.`);
        }
      });
    });
  }
}
