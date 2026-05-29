import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FunctionsService } from '../../../core/services/functions.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Student } from '../../../shared/models';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Reports</h1>
        <p>Generate student result sheets and school reports</p>
      </div>

      <div class="reports-grid">
        <!-- Student Result PDF -->
        <div class="report-card card">
          <div class="report-icon primary"><mat-icon>picture_as_pdf</mat-icon></div>
          <div class="report-info">
            <h3>Student Result Sheet</h3>
            <p>Generate a formatted PDF result sheet for any student, term, and academic year.</p>
          </div>
          <div class="report-form">
            <mat-form-field appearance="outline">
              <mat-label>Select Student</mat-label>
              <mat-select [(value)]="selectedStudentId">
                @for (s of students(); track s.uid) {
                  <mat-option [value]="s.uid">{{ s.fullName }} — {{ s.studentId }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <div class="form-row-2">
              <mat-form-field appearance="outline">
                <mat-label>Term</mat-label>
                <mat-select [(value)]="selectedTerm">
                  <mat-option [value]="1">Term 1</mat-option>
                  <mat-option [value]="2">Term 2</mat-option>
                  <mat-option [value]="3">Term 3</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Academic Year</mat-label>
                <mat-select [(value)]="selectedYear">
                  <mat-option value="2024/2025">2024/2025</mat-option>
                  <mat-option value="2023/2024">2023/2024</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <button mat-raised-button color="primary" (click)="generatePDF()"
                    [disabled]="!selectedStudentId || pdfLoading()">
              @if (pdfLoading()) {
                <mat-icon class="spin">refresh</mat-icon> Generating PDF...
              } @else {
                <mat-icon>download</mat-icon> Generate & Download
              }
            </button>
          </div>
        </div>

        <!-- Attendance CSV -->
        <div class="report-card card">
          <div class="report-icon success"><mat-icon>table_chart</mat-icon></div>
          <div class="report-info">
            <h3>Attendance Report (CSV)</h3>
            <p>Export full attendance records for all students as a CSV spreadsheet.</p>
          </div>
          <button mat-raised-button color="primary" (click)="exportAttendanceCSV()">
            <mat-icon>download</mat-icon> Export Attendance CSV
          </button>
        </div>

        <!-- Student List CSV -->
        <div class="report-card card">
          <div class="report-icon primary"><mat-icon>people</mat-icon></div>
          <div class="report-info">
            <h3>Student Register</h3>
            <p>Download a complete list of all enrolled students with their class assignments.</p>
          </div>
          <button mat-raised-button color="primary" (click)="exportStudentCSV()">
            <mat-icon>download</mat-icon> Export Student List
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; } @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .report-card { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .report-icon { width: 56px; height: 56px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; mat-icon { font-size: 26px; } &.primary { background: var(--color-primary-50); color: var(--color-primary); } &.success { background: var(--color-success-bg); color: var(--color-success); } }
    .report-info { h3 { font-size: 1rem; color: var(--color-text-heading); margin-bottom: 4px; } p { font-size: 0.875rem; color: var(--color-text-caption); margin: 0; } }
    .report-form { display: flex; flex-direction: column; gap: var(--space-3); }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `],
})
export class AdminReportsComponent {
  private functions = inject(FunctionsService);
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);

  selectedStudentId = '';
  selectedTerm: 1 | 2 | 3 = 1;
  selectedYear = '2024/2025';
  pdfLoading = signal(false);

  students = toSignal(
    this.fs.collection$<Student>('students', this.fs.orderBy('fullName', 'asc'), this.fs.limit(200)),
    { initialValue: [] }
  );

  generatePDF(): void {
    if (!this.selectedStudentId) return;
    this.pdfLoading.set(true);
    this.functions.generateResultsPDF(this.selectedStudentId, this.selectedTerm, this.selectedYear).subscribe({
      next: ({ downloadURL }) => {
        window.open(downloadURL, '_blank');
        this.pdfLoading.set(false);
        this.toast.success('PDF generated successfully!');
      },
      error: () => { this.pdfLoading.set(false); this.toast.error('Failed to generate PDF.'); },
    });
  }

  exportStudentCSV(): void {
    const rows = this.students().map((s, i) =>
      `${i + 1},${s.studentId},${s.fullName},${s.gender},${s.classId},${s.enrollmentYear}`
    );
    const csv = ['#,Student ID,Name,Gender,Class,Year', ...rows].join('\n');
    this.downloadCSV(csv, 'students');
  }

  exportAttendanceCSV(): void {
    this.fs.getDocs<{ studentId: string; date: string; status: string }>('attendance').subscribe((records) => {
      const rows = records.map((r) => `${r.studentId},${r.date},${r.status}`);
      const csv = ['Student ID,Date,Status', ...rows].join('\n');
      this.downloadCSV(csv, 'attendance');
    });
  }

  private downloadCSV(csv: string, name: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kbss-${name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('CSV downloaded!');
  }
}
