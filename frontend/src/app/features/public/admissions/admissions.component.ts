import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../../core/services/firestore.service';
import { StorageService } from '../../../core/services/storage.service';
import { ToastService } from '../../../core/services/toast.service';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatIconModule, MatProgressBarModule, RouterLink,
  ],
  templateUrl: './admissions.component.html',
  styleUrls: ['./admissions.component.scss'],
})
export class AdmissionsComponent {
  private fb = inject(FormBuilder);
  private fs = inject(FirestoreService);
  private storage = inject(StorageService);
  private toast = inject(ToastService);

  submitting = signal(false);
  submitted = signal(false);
  uploadProgress = signal(0);
  uploadedDocURLs = signal<string[]>([]);

  personalForm = this.fb.group({
    fullName:    ['', [Validators.required, Validators.minLength(3)]],
    dateOfBirth: ['', Validators.required],
    gender:      ['', Validators.required],
    formerSchool:['', Validators.required],
    preferredClass: ['', Validators.required],
  });

  guardianForm = this.fb.group({
    guardianName:  ['', Validators.required],
    guardianPhone: ['', [Validators.required, Validators.pattern(/^[\d\+\-\s]{7,15}$/)]],
    guardianEmail: ['', [Validators.required, Validators.email]],
    address:       ['', Validators.required],
  });

  submissionRef = '';

  classes = [
    'JSS 1', 'JSS 2', 'JSS 3',
    'SSS 1 (Science)', 'SSS 1 (Arts)', 'SSS 1 (Commercial)',
    'SSS 2 (Science)', 'SSS 2 (Arts)', 'SSS 2 (Commercial)',
  ];

  feeRows = [
    { level: 'JSS 1–3',   tuition: 'NLe 150,000', exam: 'NLe 30,000', other: 'NLe 20,000', total: 'NLe 200,000' },
    { level: 'SSS 1–2',   tuition: 'NLe 180,000', exam: 'NLe 35,000', other: 'NLe 25,000', total: 'NLe 240,000' },
    { level: 'SSS 3 (WAEC)', tuition: 'NLe 180,000', exam: 'NLe 80,000', other: 'NLe 30,000', total: 'NLe 290,000' },
  ];

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    files.forEach((file) => {
      const path = this.storage.admissionDocPath('temp-' + Date.now(), this.storage.uniqueFileName(file));
      this.storage.uploadAndGetURL(path, file).subscribe({
        next: (url) => this.uploadedDocURLs.update((u) => [...u, url]),
        error: () => this.toast.error('Failed to upload document.'),
      });
    });
  }

  async submit(): Promise<void> {
    if (this.personalForm.invalid || this.guardianForm.invalid) return;

    this.submitting.set(true);
    const data = {
      ...this.personalForm.value,
      ...this.guardianForm.value,
      documentsURL: this.uploadedDocURLs(),
      status: 'pending',
      submittedAt: serverTimestamp(),
    };

    this.fs.add('admissions', data).subscribe({
      next: (id) => {
        this.submissionRef = id.slice(0, 8).toUpperCase();
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: () => {
        this.toast.error('Failed to submit application. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
