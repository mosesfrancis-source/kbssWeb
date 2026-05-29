import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Student, SchoolClass } from '../../../shared/models';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatDialogModule, MatPaginatorModule],
  templateUrl: './admin-students.component.html',
  styleUrls: ['./admin-students.component.scss'],
})
export class AdminStudentsComponent {
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  showForm = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  searchQuery = '';
  pageIndex = 0;
  pageSize = 20;

  form = this.fb.group({
    studentId:     ['', Validators.required],
    fullName:      ['', [Validators.required, Validators.minLength(3)]],
    dateOfBirth:   ['', Validators.required],
    gender:        ['Male', Validators.required],
    classId:       ['', Validators.required],
    guardianName:  ['', Validators.required],
    guardianPhone: ['', Validators.required],
    guardianEmail: [''],
    address:       [''],
    enrollmentYear: [new Date().getFullYear()],
  });

  allStudents = toSignal(
    this.fs.collection$<Student>('students', this.fs.orderBy('fullName', 'asc'), this.fs.limit(200)),
    { initialValue: [] }
  );

  classes = toSignal(this.fs.collection$<SchoolClass>('classes'), { initialValue: [] });

  filteredStudents = () => {
    const q = this.searchQuery.toLowerCase();
    const all = this.allStudents();
    return q ? all.filter((s) =>
      s.fullName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.classId.toLowerCase().includes(q)
    ) : all;
  };

  pagedStudents = () => {
    const start = this.pageIndex * this.pageSize;
    return this.filteredStudents().slice(start, start + this.pageSize);
  };

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ gender: 'Male', enrollmentYear: new Date().getFullYear() });
    this.showForm.set(true);
  }

  openEdit(student: Student): void {
    this.editingId.set(student.id ?? student.uid);
    this.form.patchValue(student as any);
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const id = this.editingId();
    const data = this.form.value;

    const op = id
      ? this.fs.update(`students/${id}`, data as object)
      : this.fs.set(`students/${data.studentId}`, { ...data, uid: data.studentId });

    op.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.success(id ? 'Student updated!' : 'Student added!');
      },
      error: () => { this.saving.set(false); this.toast.error('Operation failed.'); },
    });
  }

  delete(id: string, name: string): void {
    if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    this.fs.delete(`students/${id}`).subscribe(() =>
      this.toast.success('Student deleted.')
    );
  }
}
