import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { StorageService } from '../../../core/services/storage.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Resource, SchoolClass, Subject } from '../../../shared/models';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-teacher-materials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Upload Materials</h1>
        <p>Share study materials and resources with your students</p>
      </div>

      <!-- Upload form -->
      <div class="upload-card card">
        <h3>Upload New Resource</h3>
        <form [formGroup]="form" (ngSubmit)="upload()" class="upload-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Class</mat-label>
              <mat-select formControlName="classId">
                @for (c of classes(); track c.id) {
                  <mat-option [value]="c.classId">{{ c.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Subject</mat-label>
              <mat-select formControlName="subjectId">
                @for (s of subjects(); track s.id) {
                  <mat-option [value]="s.subjectId">{{ s.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="2"></textarea>
          </mat-form-field>

          <div class="file-zone" (click)="fileInput.click()">
            @if (!selectedFile()) {
              <mat-icon>cloud_upload</mat-icon>
              <p>Click to select a file (PDF, DOC, PPT, etc.)</p>
            } @else {
              <mat-icon>insert_drive_file</mat-icon>
              <p>{{ selectedFile()!.name }}</p>
              <span class="file-size">{{ (selectedFile()!.size / 1024 / 1024).toFixed(2) }} MB</span>
            }
          </div>
          <input type="file" #fileInput style="display:none"
                 (change)="onFileSelected($event)">

          @if (uploadProgress() > 0 && uploadProgress() < 100) {
            <div class="progress-wrap">
              <mat-progress-bar mode="determinate" [value]="uploadProgress()"></mat-progress-bar>
              <span>{{ uploadProgress() }}%</span>
            </div>
          }

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || !selectedFile() || uploading()">
              @if (uploading()) {
                <mat-icon class="spin">refresh</mat-icon> Uploading {{ uploadProgress() }}%
              } @else {
                <mat-icon>upload</mat-icon> Upload Resource
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Existing resources -->
      <h3 class="section-title">Uploaded Resources</h3>
      <div class="resources-list">
        @for (r of resources(); track r.id) {
          <div class="resource-card card">
            <div class="res-icon" [class]="fileColor(r.fileType)">
              <mat-icon>{{ fileIcon(r.fileType) }}</mat-icon>
            </div>
            <div class="res-info">
              <h4>{{ r.title }}</h4>
              <p>{{ r.description }}</p>
              <div class="res-meta">
                <span class="badge badge-primary">{{ r.fileType.toUpperCase() }}</span>
                <span class="badge badge-neutral">{{ r.classId }}</span>
              </div>
            </div>
            <div class="res-actions">
              <a [href]="r.fileURL" target="_blank" mat-icon-button>
                <mat-icon>download</mat-icon>
              </a>
              <button mat-icon-button (click)="delete(r.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state"><mat-icon>folder_open</mat-icon><p>No resources uploaded yet</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .upload-card { padding: var(--space-6); margin-bottom: var(--space-8); h3 { margin-bottom: var(--space-5); } }
    .upload-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .file-zone { border: 2px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-8); text-align: center; cursor: pointer; transition: all var(--transition-fast); &:hover { border-color: var(--color-primary); background: var(--color-primary-50); } mat-icon { font-size: 36px; color: var(--color-text-muted); display: block; margin-bottom: var(--space-2); } p { color: var(--color-text-caption); margin-bottom: 4px; } .file-size { font-size: 12px; color: var(--color-text-muted); } }
    .progress-wrap { display: flex; align-items: center; gap: var(--space-3); mat-progress-bar { flex: 1; } span { font-size: 12px; color: var(--color-primary); font-weight: 700; } }
    .form-actions { display: flex; justify-content: flex-end; }
    .section-title { font-size: 1rem; color: var(--color-text-heading); margin-bottom: var(--space-4); }
    .resources-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .resource-card { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) var(--space-5); }
    .res-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; &.pdf { background: #FFEBEE; color: #C62828; } &.doc { background: #E3F2FD; color: #1565C0; } &.ppt { background: #FFF3E0; color: #E65100; } &.other { background: var(--color-surface-muted); color: var(--color-text-caption); } mat-icon { font-size: 22px; } }
    .res-info { flex: 1; h4 { font-size: 0.9rem; color: var(--color-text-heading); margin-bottom: 4px; } p { font-size: 0.8rem; color: var(--color-text-caption); margin-bottom: 6px; } }
    .res-meta { display: flex; gap: var(--space-2); }
    .res-actions { display: flex; gap: 4px; }
    .empty-state { text-align: center; padding: var(--space-10); color: var(--color-text-muted); mat-icon { font-size: 48px; display: block; margin-bottom: var(--space-3); } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `],
})
export class TeacherMaterialsComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private storage = inject(StorageService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  uploadProgress = signal(0);

  form = this.fb.group({
    title:       ['', Validators.required],
    description: [''],
    classId:     ['', Validators.required],
    subjectId:   ['', Validators.required],
  });

  resources = toSignal(
    this.fs.collection$<Resource>('resources', this.fs.orderBy('uploadedAt', 'desc')),
    { initialValue: [] }
  );

  classes  = toSignal(this.fs.collection$<SchoolClass>('classes'), { initialValue: [] });
  subjects = toSignal(this.fs.collection$<Subject>('subjects'), { initialValue: [] });

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.selectedFile.set(file);
  }

  upload(): void {
    const file = this.selectedFile();
    const uid = this.auth.currentUser()?.uid;
    if (!file || !uid || this.form.invalid) return;

    this.uploading.set(true);
    const ext = file.name.split('.').pop() ?? 'file';
    const path = this.storage.materialPath(this.form.value.classId!, this.storage.uniqueFileName(file));

    this.storage.upload(path, file).subscribe({
      next: (prog) => {
        this.uploadProgress.set(prog.progress);
        if (prog.state === 'success' && prog.downloadURL) {
          this.fs.add('resources', {
            ...this.form.value,
            fileURL: prog.downloadURL,
            fileType: ext,
            uploadedBy: uid,
          }).subscribe(() => {
            this.uploading.set(false);
            this.uploadProgress.set(0);
            this.selectedFile.set(null);
            this.form.reset();
            this.toast.success('Resource uploaded!');
          });
        }
      },
      error: () => { this.uploading.set(false); this.toast.error('Upload failed.'); },
    });
  }

  delete(id: string): void {
    this.fs.delete(`resources/${id}`).subscribe(() => this.toast.success('Resource deleted.'));
  }

  fileIcon(type: string): string {
    if (type === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(type)) return 'description';
    if (['ppt', 'pptx'].includes(type)) return 'slideshow';
    return 'insert_drive_file';
  }

  fileColor(type: string): string {
    if (type === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(type)) return 'doc';
    if (['ppt', 'pptx'].includes(type)) return 'ppt';
    return 'other';
  }
}
