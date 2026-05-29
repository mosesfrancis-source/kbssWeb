import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { FunctionsService } from '../../../core/services/functions.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Result, scoreToGrade, gradeColor } from '../../../shared/models';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, FormsModule, MatProgressBarModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Results & Grades</h1>
        <p>Your academic performance by term and subject</p>
      </div>

      <!-- Filters -->
      <div class="results-filters card">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Academic Year</mat-label>
          <mat-select [(ngModel)]="selectedYear" (ngModelChange)="onFilterChange()">
            <mat-option value="2024/2025">2024/2025</mat-option>
            <mat-option value="2023/2024">2023/2024</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Term</mat-label>
          <mat-select [(ngModel)]="selectedTerm" (ngModelChange)="onFilterChange()">
            <mat-option [value]="1">Term 1</mat-option>
            <mat-option [value]="2">Term 2</mat-option>
            <mat-option [value]="3">Term 3</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="downloadPDF()" [disabled]="pdfLoading()">
          @if (pdfLoading()) {
            <mat-icon class="spin">refresh</mat-icon> Generating...
          } @else {
            <mat-icon>picture_as_pdf</mat-icon> Download Report
          }
        </button>
      </div>

      <!-- Summary cards -->
      <div class="results-summary">
        <div class="summary-card card">
          <div class="summary-icon primary"><mat-icon>grade</mat-icon></div>
          <div class="summary-val">{{ average() }}%</div>
          <div class="summary-lbl">Term Average</div>
        </div>
        <div class="summary-card card">
          <div class="summary-icon success"><mat-icon>emoji_events</mat-icon></div>
          <div class="summary-val">{{ highestScore() }}%</div>
          <div class="summary-lbl">Highest Score</div>
        </div>
        <div class="summary-card card">
          <div class="summary-icon warning"><mat-icon>trending_down</mat-icon></div>
          <div class="summary-val">{{ lowestScore() }}%</div>
          <div class="summary-lbl">Lowest Score</div>
        </div>
        <div class="summary-card card">
          <div class="summary-icon primary"><mat-icon>menu_book</mat-icon></div>
          <div class="summary-val">{{ results().length }}</div>
          <div class="summary-lbl">Subjects</div>
        </div>
      </div>

      <!-- Results table -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <h3>Subject Results — Term {{ selectedTerm }}, {{ selectedYear }}</h3>
        </div>
        <table class="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Subject</th>
              <th>Score (%)</th>
              <th>Grade</th>
              <th>Performance</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (r of results(); track r.id; let i = $index) {
              <tr>
                <td class="mono">{{ i + 1 }}</td>
                <td>{{ r.subjectId }}</td>
                <td>
                  <span class="score-mono">{{ r.score }}</span>
                </td>
                <td>
                  <span class="badge" [class]="'badge-' + gradeColor(r.grade)">{{ r.grade }}</span>
                </td>
                <td>
                  <div class="score-bar-wrap">
                    <mat-progress-bar
                      mode="determinate"
                      [value]="r.score"
                      [color]="r.score >= 50 ? 'primary' : 'warn'"
                    ></mat-progress-bar>
                    <span>{{ r.score }}%</span>
                  </div>
                </td>
                <td class="remarks">{{ r.remarks || '—' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-row">
                  <mat-icon>info</mat-icon>
                  No results found for this term
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./student-results.component.scss'],
})
export class StudentResultsComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private functions = inject(FunctionsService);
  private toast = inject(ToastService);

  selectedYear = '2024/2025';
  selectedTerm: 1 | 2 | 3 = 1;
  pdfLoading = signal(false);

  results = toSignal(
    this.auth.currentUser$.pipe(
      switchMap((u) => {
        if (!u) return of([]);
        return this.fs.collection$<Result>(
          'results',
          this.fs.where('studentId', '==', u.uid),
          this.fs.where('term', '==', this.selectedTerm),
          this.fs.where('academicYear', '==', this.selectedYear)
        );
      })
    ),
    { initialValue: [] }
  );

  onFilterChange(): void {
    // Signal-based reactivity handles the reload
  }

  average() {
    const r = this.results();
    if (!r.length) return 0;
    return Math.round(r.reduce((s, x) => s + x.score, 0) / r.length);
  }

  highestScore() {
    return this.results().length ? Math.max(...this.results().map((r) => r.score)) : 0;
  }

  lowestScore() {
    return this.results().length ? Math.min(...this.results().map((r) => r.score)) : 0;
  }

  gradeColor = gradeColor;

  downloadPDF(): void {
    const uid = this.auth.currentUser()?.uid;
    if (!uid) return;
    this.pdfLoading.set(true);
    this.functions.generateResultsPDF(uid, this.selectedTerm, this.selectedYear).subscribe({
      next: ({ downloadURL }) => {
        window.open(downloadURL, '_blank');
        this.pdfLoading.set(false);
        this.toast.success('Report generated!');
      },
      error: () => {
        this.pdfLoading.set(false);
        this.toast.error('Failed to generate PDF.');
      },
    });
  }
}
