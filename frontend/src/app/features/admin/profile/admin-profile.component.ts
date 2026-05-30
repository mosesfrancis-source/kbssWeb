import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { StorageService } from '../../../core/services/storage.service';
import { ToastService } from '../../../core/services/toast.service';
import { firstValueFrom } from 'rxjs';
import { updateProfile } from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
  ],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>My Profile</h1>
        <p>View and update your account information</p>
      </div>

      <div class="profile-layout">
        <!-- Avatar section -->
        <div class="profile-avatar-section card">
          <div class="avatar-wrap">
            @if (previewURL() || user()?.photoURL) {
              <img [src]="previewURL() || user()!.photoURL" alt="Profile photo" class="profile-photo">
            } @else {
              <div class="profile-photo-fallback">
                {{ user()?.displayName?.charAt(0) || 'A' }}
              </div>
            }
            <label class="avatar-upload-btn" for="avatarInput">
              <mat-icon>photo_camera</mat-icon>
            </label>
            <input type="file" id="avatarInput" accept="image/*"
                   style="display:none" (change)="onAvatarChange($event)">
          </div>
          <h3>{{ user()?.displayName }}</h3>
          <p class="role-tag"><span class="badge badge-warning">Admin</span></p>
          <p class="mono">{{ user()?.email }}</p>

          <button mat-raised-button color="primary" (click)="saveAvatar()"
                  [disabled]="!selectedFile() || uploading()" class="w-full">
            @if (uploading()) {
              <mat-icon class="spin">refresh</mat-icon> Uploading...
            } @else {
              <mat-icon>save</mat-icon> Save Photo
            }
          </button>
        </div>

        <!-- Info form -->
        <div class="profile-form card">
          <h3>Account Information</h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="prof-form">
            <mat-form-field appearance="outline">
              <mat-label>Display Name</mat-label>
              <input matInput formControlName="displayName">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email (read-only)</mat-label>
              <input matInput [value]="user()?.email || ''" readonly>
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) {
                  <mat-icon class="spin">refresh</mat-icon> Saving...
                } @else {
                  <mat-icon>save</mat-icon> Save Changes
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--space-6); align-items: start; @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .profile-avatar-section { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-6); text-align: center; }
    .avatar-wrap { position: relative; margin-bottom: var(--space-2); }
    .profile-photo, .profile-photo-fallback { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--color-primary-100); }
    .profile-photo-fallback { background: var(--gradient-primary); color: white; font-size: 3rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .avatar-upload-btn { position: absolute; bottom: 0; right: 0; width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 3px solid white; mat-icon { font-size: 18px; } }
    .role-tag { margin: 0; }
    .profile-form { padding: var(--space-6); h3 { margin-bottom: var(--space-6); } }
    .prof-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-actions { display: flex; justify-content: flex-end; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `],
})
export class AdminProfileComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private storage = inject(StorageService);
  private toast = inject(ToastService);
  private firebaseAuth = inject(Auth);
  private fb = inject(FormBuilder);

  user = this.auth.currentUser;
  saving = signal(false);
  uploading = signal(false);
  previewURL = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  form = this.fb.group({
    displayName: [''],
  });

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewURL.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  saveAvatar(): void {
    const file = this.selectedFile();
    const uid = this.user()?.uid;
    if (!file || !uid) return;
    this.uploading.set(true);

    this.storage.uploadAndGetURL(this.storage.avatarPath(uid), file).subscribe({
      next: async (url) => {
        try {
          const currentUser = this.firebaseAuth.currentUser;
          if (currentUser) await updateProfile(currentUser, { photoURL: url });
          await firstValueFrom(this.fs.set(`users/${uid}`, { photoURL: url }, true));
          this.auth.refreshToken();
          this.selectedFile.set(null);
          this.uploading.set(false);
          this.toast.success('Profile photo updated!');
        } catch {
          this.uploading.set(false);
          this.toast.error('Failed to save photo.');
        }
      },
      error: () => { this.uploading.set(false); this.toast.error('Upload failed.'); },
    });
  }

  save(): void {
    const uid = this.user()?.uid;
    const displayName = this.form.value.displayName?.trim();
    if (!uid || !displayName) return;
    this.saving.set(true);

    this.fs.set(`users/${uid}`, { displayName }, true).subscribe({
      next: async () => {
        try {
          const cu = this.firebaseAuth.currentUser;
          if (cu) await updateProfile(cu, { displayName });
          this.auth.refreshToken();
        } catch { /* best-effort */ }
        this.saving.set(false);
        this.toast.success('Profile saved!');
      },
      error: () => { this.saving.set(false); this.toast.error('Save failed.'); },
    });
  }
}
