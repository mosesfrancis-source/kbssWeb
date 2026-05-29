import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
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
import { GalleryImage } from '../../../shared/models';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Gallery Management</h1>
        <p>Upload and manage school photo gallery</p>
      </div>

      <!-- Upload zone -->
      <div class="upload-card card">
        <h3>Upload Images</h3>
        <div class="upload-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Caption</mat-label>
              <input matInput [(ngModel)]="caption">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="category">
                <mat-option value="Sports">Sports</mat-option>
                <mat-option value="Graduation">Graduation</mat-option>
                <mat-option value="Events">Events</mat-option>
                <mat-option value="Academics">Academics</mat-option>
                <mat-option value="General">General</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="file-zone" (click)="fileInput.click()">
            <mat-icon>add_photo_alternate</mat-icon>
            <p>Click to select images (JPG, PNG, WEBP)</p>
          </div>
          <input type="file" #fileInput accept="image/*" multiple style="display:none"
                 (change)="onFilesSelected($event)">

          @if (uploading()) {
            <div class="progress-row">
              <mat-progress-bar mode="determinate" [value]="uploadProgress()"></mat-progress-bar>
              <span>{{ uploadProgress() }}%</span>
            </div>
          }
        </div>
      </div>

      <!-- Gallery grid -->
      <div class="gallery-manage-grid">
        @for (img of images(); track img.id) {
          <div class="gallery-manage-item">
            <img [src]="img.imageURL" [alt]="img.caption" loading="lazy">
            <div class="gallery-manage-overlay">
              <span class="badge badge-primary">{{ img.category }}</span>
              <p>{{ img.caption }}</p>
              <button mat-mini-fab color="warn" (click)="deleteImage(img.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state"><mat-icon>photo_library</mat-icon><p>No images uploaded</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .upload-card { padding: var(--space-6); margin-bottom: var(--space-8); h3 { margin-bottom: var(--space-5); } }
    .upload-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .file-zone { border: 2px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-8); text-align: center; cursor: pointer; &:hover { border-color: var(--color-primary); background: var(--color-primary-50); } mat-icon { font-size: 36px; color: var(--color-text-muted); display: block; margin-bottom: 8px; } p { color: var(--color-text-caption); margin: 0; } }
    .progress-row { display: flex; align-items: center; gap: var(--space-3); mat-progress-bar { flex: 1; } span { font-size: 12px; color: var(--color-primary); font-weight: 700; } }
    .gallery-manage-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-3); @media (max-width: 1024px) { grid-template-columns: repeat(4, 1fr); } @media (max-width: 768px) { grid-template-columns: repeat(3, 1fr); } @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); } }
    .gallery-manage-item { position: relative; aspect-ratio: 1; border-radius: var(--radius-md); overflow: hidden; cursor: pointer; img { width: 100%; height: 100%; object-fit: cover; } &:hover .gallery-manage-overlay { opacity: 1; } }
    .gallery-manage-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity var(--transition-normal); padding: 8px; text-align: center; p { color: white; font-size: 12px; margin: 0; } }
    .empty-state { text-align: center; padding: var(--space-12); color: var(--color-text-muted); mat-icon { font-size: 48px; display: block; margin-bottom: var(--space-3); } }
  `],
})
export class AdminGalleryComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private storage = inject(StorageService);
  private toast = inject(ToastService);

  caption = '';
  category = 'General';
  uploading = signal(false);
  uploadProgress = signal(0);

  images = toSignal(
    this.fs.collection$<GalleryImage>('gallery', this.fs.orderBy('uploadedAt', 'desc')),
    { initialValue: [] }
  );

  onFilesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (!files.length) return;

    const uid = this.auth.currentUser()?.uid ?? 'admin';
    this.uploading.set(true);
    let done = 0;

    files.forEach((file) => {
      const path = this.storage.galleryPath('events', this.storage.uniqueFileName(file));
      this.storage.upload(path, file).subscribe({
        next: (prog) => {
          this.uploadProgress.set(Math.round((done / files.length) * 100 + (prog.progress / files.length)));
          if (prog.state === 'success' && prog.downloadURL) {
            this.fs.add('gallery', {
              imageURL: prog.downloadURL,
              caption: this.caption || 'K.B.S.S School Photo',
              category: this.category,
              uploadedBy: uid,
            }).subscribe();
            done++;
            if (done === files.length) {
              this.uploading.set(false);
              this.uploadProgress.set(0);
              this.toast.success(`${done} image(s) uploaded!`);
              this.caption = '';
            }
          }
        },
        error: () => { this.uploading.set(false); this.toast.error('Upload failed.'); },
      });
    });
  }

  deleteImage(id: string): void {
    if (!confirm('Delete this image?')) return;
    this.fs.delete(`gallery/${id}`).subscribe(() => this.toast.success('Image deleted.'));
  }
}
