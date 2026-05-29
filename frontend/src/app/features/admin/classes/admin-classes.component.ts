import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SchoolClass, Subject, Teacher } from '../../../shared/models';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatTabsModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Classes & Subjects</h1>
        <p>Manage class groups and subject catalogue</p>
      </div>

      <mat-tab-group animationDuration="200ms">
        <!-- Classes Tab -->
        <mat-tab label="Classes ({{ classes().length }})">
          <div class="tab-body">
            <div class="toolbar-row">
              <button mat-raised-button color="primary" (click)="showClassForm.set(!showClassForm())">
                <mat-icon>{{ showClassForm() ? 'close' : 'add' }}</mat-icon>
                {{ showClassForm() ? 'Cancel' : 'New Class' }}
              </button>
            </div>

            @if (showClassForm()) {
              <div class="form-card card" style="padding:24px;margin-bottom:24px;">
                <form [formGroup]="classForm" (ngSubmit)="saveClass()" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:end;">
                  <mat-form-field appearance="outline"><mat-label>Class ID</mat-label><input matInput formControlName="classId"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Class Name</mat-label><input matInput formControlName="name" placeholder="e.g. JSS 1A"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Level</mat-label><mat-select formControlName="level"><mat-option value="JSS">JSS</mat-option><mat-option value="SSS">SSS</mat-option></mat-select></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Academic Year</mat-label><input matInput formControlName="academicYear"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Form Teacher</mat-label><mat-select formControlName="teacherId"><mat-option value="">None</mat-option>@for (t of teachers(); track t.uid) { <mat-option [value]="t.uid">{{ t.fullName }}</mat-option> }</mat-select></mat-form-field>
                  <div style="display:flex;gap:8px;">
                    <button mat-raised-button color="primary" type="submit" [disabled]="classForm.invalid">
                      <mat-icon>save</mat-icon> Save
                    </button>
                  </div>
                </form>
              </div>
            }

            <div class="classes-grid">
              @for (c of classes(); track c.id) {
                <div class="class-card card">
                  <div class="cc-header">
                    <span class="cc-level">{{ c.level }}</span>
                    <h3>{{ c.name }}</h3>
                    <span class="cc-year">{{ c.academicYear }}</span>
                  </div>
                  <div class="cc-body">
                    <div class="cc-meta"><mat-icon>menu_book</mat-icon>{{ c.subjectIds?.length ?? 0 }} subjects</div>
                  </div>
                  <button mat-icon-button color="warn" class="cc-delete" (click)="deleteClass(c.id!)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              } @empty {
                <div class="empty-state"><mat-icon>class</mat-icon><p>No classes yet</p></div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Subjects Tab -->
        <mat-tab label="Subjects ({{ subjects().length }})">
          <div class="tab-body">
            <div class="toolbar-row">
              <button mat-raised-button color="primary" (click)="showSubjForm.set(!showSubjForm())">
                <mat-icon>{{ showSubjForm() ? 'close' : 'add' }}</mat-icon>
                {{ showSubjForm() ? 'Cancel' : 'New Subject' }}
              </button>
            </div>

            @if (showSubjForm()) {
              <div class="form-card card" style="padding:24px;margin-bottom:24px;">
                <form [formGroup]="subjForm" (ngSubmit)="saveSubject()" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;align-items:end;">
                  <mat-form-field appearance="outline"><mat-label>Subject ID</mat-label><input matInput formControlName="subjectId"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Code</mat-label><input matInput formControlName="code"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Division</mat-label><mat-select formControlName="division"><mat-option value="Core">Core</mat-option><mat-option value="Science">Science</mat-option><mat-option value="Arts">Arts</mat-option><mat-option value="Commercial">Commercial</mat-option></mat-select></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Level</mat-label><mat-select formControlName="level"><mat-option value="JSS">JSS</mat-option><mat-option value="SSS">SSS</mat-option><mat-option value="Both">Both</mat-option></mat-select></mat-form-field>
                  <button mat-raised-button color="primary" type="submit" [disabled]="subjForm.invalid">
                    <mat-icon>save</mat-icon> Save
                  </button>
                </form>
              </div>
            }

            <div class="subjects-grid">
              @for (s of subjects(); track s.id) {
                <div class="subject-card card">
                  <div class="subj-header">
                    <span class="badge badge-primary">{{ s.division }}</span>
                    <button mat-icon-button color="warn" (click)="deleteSubject(s.id!)"><mat-icon>delete</mat-icon></button>
                  </div>
                  <h4>{{ s.name }}</h4>
                  <span class="mono subj-code">{{ s.code }}</span>
                  <span class="badge badge-neutral">{{ s.level }}</span>
                </div>
              } @empty {
                <div class="empty-state"><mat-icon>menu_book</mat-icon><p>No subjects yet</p></div>
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tab-body { padding: var(--space-6) 0; }
    .toolbar-row { margin-bottom: var(--space-5); }
    .classes-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); } @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } }
    .class-card { padding: 0; overflow: hidden; position: relative; }
    .cc-header { background: var(--gradient-primary); padding: var(--space-4) var(--space-5) var(--space-3); h3 { color: white; margin: 4px 0; font-size: 1.1rem; } }
    .cc-level { display: inline-block; background: rgba(255,255,255,0.2); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; margin-bottom: 4px; }
    .cc-year { font-size: 11px; color: rgba(255,255,255,0.65); }
    .cc-body { padding: var(--space-3) var(--space-4); }
    .cc-meta { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--color-text-caption); mat-icon { font-size: 16px; color: var(--color-primary); } }
    .cc-delete { position: absolute; top: 8px; right: 8px; color: rgba(255,255,255,0.6) !important; }
    .subjects-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-4); @media (max-width: 1200px) { grid-template-columns: repeat(4, 1fr); } @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } }
    .subject-card { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
    .subj-header { display: flex; align-items: center; justify-content: space-between; }
    h4 { font-size: 0.875rem; color: var(--color-text-heading); margin: 0; }
    .subj-code { font-size: 12px; }
    .empty-state { text-align: center; padding: var(--space-10); color: var(--color-text-muted); mat-icon { font-size: 48px; display: block; margin-bottom: var(--space-3); } }
  `],
})
export class AdminClassesComponent {
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  showClassForm = signal(false);
  showSubjForm = signal(false);

  classes  = toSignal(this.fs.collection$<SchoolClass>('classes'), { initialValue: [] });
  subjects = toSignal(this.fs.collection$<Subject>('subjects'), { initialValue: [] });
  teachers = toSignal(this.fs.collection$<Teacher>('teachers', this.fs.orderBy('fullName', 'asc')), { initialValue: [] });

  classForm = this.fb.group({ classId: ['', Validators.required], name: ['', Validators.required], level: ['JSS'], academicYear: ['2024/2025'], teacherId: [''] });
  subjForm  = this.fb.group({ subjectId: ['', Validators.required], name: ['', Validators.required], code: [''], division: ['Core'], level: ['JSS'] });

  saveClass(): void {
    const data = this.classForm.value;
    this.fs.set(`classes/${data.classId}`, { ...data, subjectIds: [] }).subscribe(() => {
      this.showClassForm.set(false); this.classForm.reset({ level: 'JSS', academicYear: '2024/2025' }); this.toast.success('Class saved!');
    });
  }

  saveSubject(): void {
    const data = this.subjForm.value;
    this.fs.set(`subjects/${data.subjectId}`, data as object).subscribe(() => {
      this.showSubjForm.set(false); this.subjForm.reset({ division: 'Core', level: 'JSS' }); this.toast.success('Subject saved!');
    });
  }

  deleteClass(id: string): void { if (confirm('Delete class?')) this.fs.delete(`classes/${id}`).subscribe(() => this.toast.success('Deleted.')); }
  deleteSubject(id: string): void { if (confirm('Delete subject?')) this.fs.delete(`subjects/${id}`).subscribe(() => this.toast.success('Deleted.')); }
}
