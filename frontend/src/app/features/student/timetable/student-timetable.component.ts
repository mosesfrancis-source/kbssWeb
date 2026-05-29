import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-student-timetable',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Class Timetable</h1>
        <p>Your weekly class schedule</p>
      </div>

      <div class="timetable-container card">
        <div class="timetable-scroll">
          <table class="timetable">
            <thead>
              <tr>
                <th class="period-col">Period</th>
                <th class="time-col">Time</th>
                @for (day of days; track day) {
                  <th>{{ day }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (period of periods; track period.number) {
                <tr [class.break-row]="period.isBreak">
                  <td class="period-num mono">P{{ period.number }}</td>
                  <td class="period-time">{{ period.time }}</td>
                  @if (period.isBreak) {
                    <td colspan="5" class="break-cell">
                      <mat-icon>coffee</mat-icon> {{ period.label }}
                    </td>
                  } @else {
                    @for (day of days; track day) {
                      <td class="class-cell" [class]="getSubjectColor(timetable[day]?.[period.number])">
                        <div class="subject-name">{{ timetable[day]?.[period.number]?.subject || '—' }}</div>
                        <div class="teacher-name">{{ timetable[day]?.[period.number]?.teacher || '' }}</div>
                      </td>
                    }
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Legend -->
        <div class="timetable-legend">
          @for (entry of legend; track entry.subject) {
            <div class="legend-item">
              <div class="legend-dot" [class]="entry.color"></div>
              <span>{{ entry.subject }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timetable-container { padding: 0; overflow: hidden; }
    .timetable-scroll { overflow-x: auto; }
    .timetable { width: 100%; border-collapse: collapse; min-width: 700px; }
    .timetable th, .timetable td { border: 1px solid var(--color-border); padding: 10px 12px; font-size: 0.8rem; }
    .timetable th { background: var(--color-primary-dark); color: white; font-weight: 600; text-align: center; font-size: 11px; letter-spacing: 0.06em; }
    .period-col { width: 48px; }
    .time-col { width: 100px; white-space: nowrap; }
    .period-num { font-family: var(--font-mono); font-weight: 700; color: var(--color-primary); text-align: center; }
    .period-time { font-size: 11px; color: var(--color-text-caption); white-space: nowrap; text-align: center; }
    .class-cell { text-align: center; min-width: 120px; cursor: default; transition: background var(--transition-fast); &.math { background: #E3F2FD; } &.science { background: #E8F5E9; } &.english { background: #FFF3E0; } &.social { background: #F3E5F5; } &.arts { background: #FCE4EC; } &.pe { background: #E0F2F1; } }
    .subject-name { font-weight: 600; font-size: 0.8rem; color: var(--color-text-heading); }
    .teacher-name { font-size: 10px; color: var(--color-text-caption); margin-top: 2px; }
    .break-row { background: var(--color-surface-muted); }
    .break-cell { text-align: center; font-size: 0.875rem; color: var(--color-text-caption); font-style: italic; mat-icon { vertical-align: middle; margin-right: 4px; font-size: 16px; } }
    .timetable-legend { display: flex; flex-wrap: wrap; gap: var(--space-3); padding: var(--space-4) var(--space-5); border-top: 1px solid var(--color-border); background: var(--color-surface-muted); }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-caption); }
    .legend-dot { width: 12px; height: 12px; border-radius: 3px; &.math { background: #1565C0; } &.science { background: #2E7D32; } &.english { background: #E65100; } &.social { background: #6A1B9A; } &.arts { background: #C62828; } &.pe { background: #00695C; } }
  `],
})
export class StudentTimetableComponent {
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  periods = [
    { number: 1, time: '8:00 – 8:45', isBreak: false, label: '' },
    { number: 2, time: '8:45 – 9:30', isBreak: false, label: '' },
    { number: 3, time: '9:30 – 10:15', isBreak: false, label: '' },
    { number: 0, time: '10:15 – 10:30', isBreak: true, label: 'Morning Break' },
    { number: 4, time: '10:30 – 11:15', isBreak: false, label: '' },
    { number: 5, time: '11:15 – 12:00', isBreak: false, label: '' },
    { number: 0, time: '12:00 – 13:00', isBreak: true, label: 'Lunch Break' },
    { number: 6, time: '13:00 – 13:45', isBreak: false, label: '' },
    { number: 7, time: '13:45 – 14:30', isBreak: false, label: '' },
  ];

  timetable: Record<string, Record<number, { subject: string; teacher: string; color: string }>> = {
    Monday:    { 1: { subject: 'Mathematics', teacher: 'Mr. Koroma', color: 'math' }, 2: { subject: 'English', teacher: 'Mrs. Kamara', color: 'english' }, 3: { subject: 'Biology', teacher: 'Mr. Sannoh', color: 'science' }, 4: { subject: 'French', teacher: 'Mr. Conteh', color: 'social' }, 5: { subject: 'History', teacher: 'Mrs. Sesay', color: 'social' }, 6: { subject: 'P.E.', teacher: 'Mr. Mansaray', color: 'pe' }, 7: { subject: 'Mathematics', teacher: 'Mr. Koroma', color: 'math' } },
    Tuesday:   { 1: { subject: 'English', teacher: 'Mrs. Kamara', color: 'english' }, 2: { subject: 'Chemistry', teacher: 'Mr. Bangura', color: 'science' }, 3: { subject: 'Mathematics', teacher: 'Mr. Koroma', color: 'math' }, 4: { subject: 'Biology', teacher: 'Mr. Sannoh', color: 'science' }, 5: { subject: 'French', teacher: 'Mr. Conteh', color: 'social' }, 6: { subject: 'Geography', teacher: 'Mrs. Fofanah', color: 'social' }, 7: { subject: 'Visual Arts', teacher: 'Mr. Lahai', color: 'arts' } },
    Wednesday: { 1: { subject: 'Physics', teacher: 'Mr. Musa', color: 'science' }, 2: { subject: 'Mathematics', teacher: 'Mr. Koroma', color: 'math' }, 3: { subject: 'English', teacher: 'Mrs. Kamara', color: 'english' }, 4: { subject: 'History', teacher: 'Mrs. Sesay', color: 'social' }, 5: { subject: 'Chemistry', teacher: 'Mr. Bangura', color: 'science' }, 6: { subject: 'P.E.', teacher: 'Mr. Mansaray', color: 'pe' }, 7: { subject: 'French', teacher: 'Mr. Conteh', color: 'social' } },
    Thursday:  { 1: { subject: 'Biology', teacher: 'Mr. Sannoh', color: 'science' }, 2: { subject: 'Geography', teacher: 'Mrs. Fofanah', color: 'social' }, 3: { subject: 'Physics', teacher: 'Mr. Musa', color: 'science' }, 4: { subject: 'Mathematics', teacher: 'Mr. Koroma', color: 'math' }, 5: { subject: 'English', teacher: 'Mrs. Kamara', color: 'english' }, 6: { subject: 'Chemistry', teacher: 'Mr. Bangura', color: 'science' }, 7: { subject: 'Visual Arts', teacher: 'Mr. Lahai', color: 'arts' } },
    Friday:    { 1: { subject: 'French', teacher: 'Mr. Conteh', color: 'social' }, 2: { subject: 'Physics', teacher: 'Mr. Musa', color: 'science' }, 3: { subject: 'Geography', teacher: 'Mrs. Fofanah', color: 'social' }, 4: { subject: 'History', teacher: 'Mrs. Sesay', color: 'social' }, 5: { subject: 'Mathematics', teacher: 'Mr. Koroma', color: 'math' }, 6: { subject: 'English', teacher: 'Mrs. Kamara', color: 'english' }, 7: { subject: 'Assembly', teacher: 'All Staff', color: '' } },
  };

  getSubjectColor(entry?: { color: string }) {
    return entry?.color ?? '';
  }

  legend = [
    { subject: 'Mathematics', color: 'math' },
    { subject: 'Science', color: 'science' },
    { subject: 'English', color: 'english' },
    { subject: 'Social Studies', color: 'social' },
    { subject: 'Arts', color: 'arts' },
    { subject: 'P.E.', color: 'pe' },
  ];
}
