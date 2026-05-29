import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Teacher, Subject, SchoolClass } from '../../../shared/models';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div><h1>Teachers</h1><p>{{ teachers().length }} teaching staff</p></div>
        <button mat-raised-button color="primary" (click)="openCreate()">
          <mat-icon>person_add</mat-icon> Add Teacher
        </button>
      </div>

      @if (showForm()) {
        <div class="form-panel card" style="padding:0;margin-bottom:var(--space-6);">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border);background:var(--color-surface-muted);">
            <h3 style="margin:0;">{{ editId() ? 'Edit Teacher' : 'Add Teacher' }}</h3>
            <button mat-icon-button (click)="showForm.set(false)"><mat-icon>close</mat-icon></button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" style="padding:24px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
            <mat-form-field appearance="outline"><mat-label>Teacher ID</mat-label><input matInput formControlName="teacherId"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Full Name</mat-label><input matInput formControlName="fullName"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" formControlName="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Gender</mat-label><mat-select formControlName="gender"><mat-option value="Male">Male</mat-option><mat-option value="Female">Female</mat-option></mat-select></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Qualification</mat-label><input matInput formControlName="qualification"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Join Date</mat-label><input matInput type="date" formControlName="joinDate"></mat-form-field>
            <div style="display:flex;align-items:flex-end;gap:8px;">
              <button mat-button type="button" (click)="showForm.set(false)">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                @if (saving()) { <mat-icon class="spin">refresh</mat-icon> } @else { <mat-icon>save</mat-icon> }
                {{ editId() ? 'Update' : 'Add' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Search -->
      <div class="data-table-container">
        <div class="table-toolbar">
          <h3>Staff Records</h3>
          <div class="search-bar-sm">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search..." [(ngModel)]="searchQuery" class="search-input">
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr><th>#</th><th>ID</th><th>Name</th><th>Email</th><th>Gender</th><th>Qualification</th><th>Join Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (t of filtered(); track t.uid; let i = $index) {
              <tr>
                <td class="mono">{{ i + 1 }}</td>
                <td class="mono">{{ t.teacherId }}</td>
                <td>{{ t.fullName }}</td>
                <td>{{ t.email }}</td>
                <td><span class="badge" [class]="t.gender === 'Male' ? 'badge-info' : 'badge-primary'">{{ t.gender }}</span></td>
                <td>{{ t.qualification }}</td>
                <td class="mono">{{ t.joinDate }}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button mat-icon-button (click)="openEdit(t)"><mat-icon>edit</mat-icon></button>
                    <button mat-icon-button color="warn" (click)="delete(t.uid, t.fullName)"><mat-icon>delete</mat-icon></button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="empty-row"><mat-icon>people</mat-icon> No teachers found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .data-table { width: 100%; border-collapse: collapse; th, td { padding: 10px 14px; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; } th { background: var(--color-surface-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; color: var(--color-text-caption); } tr:hover td { background: var(--color-primary-50); } }
    .search-bar-sm { display: flex; align-items: center; gap: 8px; background: var(--color-surface-muted); border-radius: 999px; padding: 8px 16px; border: 1px solid var(--color-border); mat-icon { font-size: 18px; color: var(--color-text-caption); } .search-input { border: none; outline: none; background: transparent; font-size: 0.875rem; width: 200px; } }
    .empty-row { text-align: center !important; padding: var(--space-10) !important; color: var(--color-text-muted); mat-icon { display: block; font-size: 36px; margin-bottom: 8px; } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `],
})
export class AdminTeachersComponent {
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  showForm = signal(false);
  editId = signal<string | null>(null);
  saving = signal(false);
  searchQuery = '';

  form = this.fb.group({
    teacherId:     ['', Validators.required],
    fullName:      ['', Validators.required],
    email:         ['', [Validators.required, Validators.email]],
    phone:         [''],
    gender:        ['Male'],
    qualification: [''],
    joinDate:      [''],
  });

  teachers = toSignal(this.fs.collection$<Teacher>('teachers', this.fs.orderBy('fullName', 'asc')), { initialValue: [] });

  filtered = () => {
    const q = this.searchQuery.toLowerCase();
    return q ? this.teachers().filter((t) => t.fullName.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)) : this.teachers();
  };

  openCreate(): void { this.editId.set(null); this.form.reset({ gender: 'Male' }); this.showForm.set(true); }

  openEdit(t: Teacher): void { this.editId.set(t.uid); this.form.patchValue(t as any); this.showForm.set(true); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editId();
    const data = this.form.value;
    const op = id ? this.fs.update(`teachers/${id}`, data as object)
      : this.fs.set(`teachers/${data.teacherId}`, { ...data, uid: data.teacherId, subjectIds: [], classIds: [] });
    op.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.toast.success(id ? 'Teacher updated!' : 'Teacher added!'); },
      error: () => { this.saving.set(false); this.toast.error('Failed.'); },
    });
  }

  delete(uid: string, name: string): void {
    if (!confirm(`Delete "${name}"?`)) return;
    this.fs.delete(`teachers/${uid}`).subscribe(() => this.toast.success('Teacher deleted.'));
  }
}
