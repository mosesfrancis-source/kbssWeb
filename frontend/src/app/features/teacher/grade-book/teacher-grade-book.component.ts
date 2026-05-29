import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Student, Teacher, SchoolClass, Subject, scoreToGrade } from '../../../shared/models';
import { serverTimestamp } from '@angular/fire/firestore';

interface GradeEntry { studentId: string; fullName: string; uid: string; score: number; grade: string; remarks: string; }

@Component({
  selector: 'app-teacher-grade-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Grade Book</h1>
        <p>Enter and manage student results</p>
      </div>

      <!-- Filters -->
      <div class="grade-filters card">
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
          <mat-label>Academic Year</mat-label>
          <mat-select [(ngModel)]="selectedYear">
            <mat-option value="2024/2025">2024/2025</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Term</mat-label>
          <mat-select [(ngModel)]="selectedTerm">
            <mat-option [value]="1">Term 1</mat-option>
            <mat-option [value]="2">Term 2</mat-option>
            <mat-option [value]="3">Term 3</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Subject</mat-label>
          <mat-select [(ngModel)]="selectedSubject">
            @for (s of subjects(); track s.id) {
              <mat-option [value]="s.subjectId">{{ s.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Grade entry table -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <h3>Enter Grades — Term {{ selectedTerm }}, {{ selectedYear }}</h3>
          <button mat-raised-button color="primary" (click)="saveAll()" [disabled]="saving()">
            @if (saving()) {
              <mat-icon class="spin">refresh</mat-icon> Saving...
            } @else {
              <mat-icon>save</mat-icon> Save All Grades
            }
          </button>
        </div>
        <table class="grade-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Score (%)</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (entry of gradeEntries(); track entry.studentId; let i = $index) {
              <tr>
                <td class="mono">{{ i + 1 }}</td>
                <td class="mono">{{ entry.studentId }}</td>
                <td>{{ entry.fullName }}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    class="score-input"
                    [(ngModel)]="entry.score"
                    (ngModelChange)="updateGrade(entry)"
                  >
                </td>
                <td>
                  <span class="badge" [class]="gradeClass(entry.grade)">{{ entry.grade }}</span>
                </td>
                <td>
                  <input
                    type="text"
                    class="remarks-input"
                    [(ngModel)]="entry.remarks"
                    placeholder="Optional remarks"
                  >
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-row">
                  <mat-icon>info</mat-icon>
                  Select a class and subject to start entering grades
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./teacher-grade-book.component.scss'],
})
export class TeacherGradeBookComponent {
  private auth = inject(AuthService);
  private fs   = inject(FirestoreService);
  private toast = inject(ToastService);

  selectedYear = '2024/2025';
  selectedTerm: 1 | 2 | 3 = 1;
  selectedSubject = '';
  selectedClassIdValue = '';
  saving = signal(false);

  subjects = toSignal(this.fs.collection$<Subject>('subjects'), { initialValue: [] });

  // Load this teacher's Firestore document to get their real classIds
  private teacherDoc = toSignal(
    toObservable(this.auth.currentUser).pipe(
      switchMap(u => u ? this.fs.getDoc<Teacher>(`teachers/${u.uid}`) : of(null))
    ), { initialValue: null }
  );

  allClasses = toSignal(this.fs.collection$<SchoolClass>('classes'), { initialValue: [] });
  myClasses  = computed(() => {
    const ids = this.teacherDoc()?.classIds ?? [];
    const all = this.allClasses();
    return ids.length ? all.filter(c => ids.includes(c.classId)) : all;
  });

  allStudents = toSignal(
    this.fs.collection$<Student>('students', this.fs.limit(100)),
    { initialValue: [] }
  );

  private _entries = signal<GradeEntry[]>([]);
  gradeEntries = this._entries.asReadonly();

  constructor() {
    // Initialise class selector when teacher doc loads
    effect(() => {
      const ids = this.teacherDoc()?.classIds ?? [];
      if (ids.length && !this.selectedClassIdValue) {
        this.selectedClassIdValue = ids[0];
        this.refreshEntries(ids[0]);
      }
    });
  }

  onClassChange(classId: string): void {
    this.refreshEntries(classId);
  }

  private refreshEntries(classId: string): void {
    const students = classId
      ? this.allStudents().filter(s => s.classId === classId)
      : this.allStudents();
    this._entries.set(students.map(s => ({
      studentId: s.studentId, fullName: s.fullName, uid: s.uid,
      score: 0, grade: 'F9', remarks: '',
    })));
  }

  updateGrade(entry: GradeEntry): void { entry.grade = scoreToGrade(entry.score); }

  gradeClass(grade: string): string {
    if (['A1','B2','B3'].includes(grade)) return 'badge-success';
    if (['C4','C5','C6'].includes(grade)) return 'badge-warning';
    return 'badge-error';
  }

  saveAll(): void {
    const uid     = this.auth.currentUser()?.uid;
    const classId = this.selectedClassIdValue || (this.teacherDoc()?.classIds?.[0] ?? '');
    if (!uid || !this.selectedSubject || !classId) {
      this.toast.error('Please select a class and subject first.'); return;
    }
    this.saving.set(true);
    const entries = this.gradeEntries().filter(e => e.score > 0);
    if (!entries.length) { this.saving.set(false); this.toast.warning('No scores entered yet.'); return; }

    let saved = 0;
    entries.forEach(entry => {
      this.fs.add('results', {
        studentId: entry.uid, subjectId: this.selectedSubject,
        teacherId: uid, classId,
        term: this.selectedTerm, academicYear: this.selectedYear,
        score: entry.score, grade: entry.grade, remarks: entry.remarks,
      }).subscribe(() => {
        if (++saved === entries.length) {
          this.saving.set(false);
          this.toast.success(`${saved} grades saved successfully!`);
        }
      });
    });
  }
}
