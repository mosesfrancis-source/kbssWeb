import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Announcement } from '../../../shared/models';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCheckboxModule, MatIconModule, MatChipsModule,
  ],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <div class="header-row">
          <div>
            <h1>Post News</h1>
            <p>Publish news articles that appear on the public homepage and News page</p>
          </div>
          <a routerLink="/admin/announcements" mat-stroked-button class="view-all-btn">
            <mat-icon>campaign</mat-icon> All Announcements
          </a>
        </div>
      </div>

      <!-- Compose form -->
      <div class="compose-card card">
        <div class="compose-header">
          <mat-icon class="compose-icon">edit_note</mat-icon>
          <h3>New Article</h3>
        </div>

        <form [formGroup]="form" (ngSubmit)="publish()" class="compose-form">
          <!-- Title -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Headline / Title</mat-label>
            <input matInput formControlName="title" placeholder="e.g. WASSCE Exams Begin at K.B.S.S">
            <mat-icon matPrefix>title</mat-icon>
            <mat-error>Title is required</mat-error>
          </mat-form-field>

          <!-- Category + Pin row -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="Academic">Academic</mat-option>
                <mat-option value="Exam">Exam</mat-option>
                <mat-option value="Sports">Sports</mat-option>
                <mat-option value="Events">Events</mat-option>
                <mat-option value="Achievement">Achievement</mat-option>
                <mat-option value="General">General</mat-option>
              </mat-select>
              <mat-icon matPrefix>label</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Visible to</mat-label>
              <mat-select formControlName="targetRoles" multiple>
                <mat-option value="student">Students</mat-option>
                <mat-option value="teacher">Teachers</mat-option>
                <mat-option value="admin">Admin</mat-option>
              </mat-select>
              <mat-icon matPrefix>group</mat-icon>
            </mat-form-field>
          </div>

          <!-- Image URL (optional) -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Image URL (optional)</mat-label>
            <input matInput formControlName="imageURL" placeholder="https://...">
            <mat-icon matPrefix>image</mat-icon>
            <mat-hint>Paste a direct image link. Leave blank if no image.</mat-hint>
          </mat-form-field>

          <!-- Body -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Article Body</mat-label>
            <textarea matInput formControlName="body" rows="10"
              placeholder="Write the full news article here..."></textarea>
            <mat-error>Article body must be at least 20 characters</mat-error>
          </mat-form-field>

          <!-- Pin option -->
          <div class="pin-row">
            <mat-checkbox formControlName="isPinned" color="primary">
              Pin to top of homepage (featured post)
            </mat-checkbox>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button mat-button type="button" (click)="form.reset(defaults)" class="reset-btn">
              <mat-icon>refresh</mat-icon> Clear
            </button>
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || publishing()" class="publish-btn">
              @if (publishing()) {
                <mat-icon class="spin">sync</mat-icon> Publishing...
              } @else {
                <mat-icon>publish</mat-icon> Publish Article
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Recent articles list -->
      <div class="recent-section">
        <h3 class="recent-title">
          <mat-icon>history</mat-icon>
          Recent Articles
        </h3>

        @if (articles() === undefined) {
          <div class="loading-hint">Loading...</div>
        } @else if (articles()!.length === 0) {
          <div class="empty-hint">
            <mat-icon>newspaper</mat-icon>
            <p>No articles posted yet. Be the first!</p>
          </div>
        } @else {
          <div class="articles-list">
            @for (a of articles()!; track a.id) {
              <div class="article-row card" [class.pinned]="a.isPinned">
                <div class="article-meta">
                  @if (a.isPinned) {
                    <span class="badge badge-info pin-badge">
                      <mat-icon>push_pin</mat-icon> Featured
                    </span>
                  }
                  <span class="badge badge-primary">{{ a.category ?? 'General' }}</span>
                </div>
                <h4 class="article-title">{{ a.title }}</h4>
                <p class="article-preview">{{ a.body | slice:0:140 }}{{ a.body.length > 140 ? '...' : '' }}</p>
                <div class="article-footer">
                  <span class="article-author">
                    <mat-icon>person</mat-icon> {{ a.authorName ?? 'Admin' }}
                  </span>
                  <button mat-icon-button color="warn" (click)="delete(a.id!)"
                          aria-label="Delete article" class="delete-btn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .view-all-btn { color: var(--color-primary); }

    .compose-card { padding: 32px; margin-bottom: 40px; }

    .compose-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border);

      h3 { margin: 0; font-size: 1.125rem; color: var(--color-text-heading); }
    }

    .compose-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--color-primary);
    }

    .compose-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width { width: 100%; }

    .form-row {
      display: flex;
      gap: 16px;

      @media (max-width: 600px) { flex-direction: column; }
    }

    .flex-1 { flex: 1; }

    .pin-row {
      padding: 4px 0;
    }

    .form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 8px;
      border-top: 1px solid var(--color-border);
      margin-top: 4px;
    }

    .publish-btn { padding: 0 24px; min-height: 44px; }
    .reset-btn { color: var(--color-text-caption); }

    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

    .recent-section { margin-top: 8px; }

    .recent-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      color: var(--color-text-heading);
      margin-bottom: 20px;

      mat-icon { color: var(--color-primary); }
    }

    .loading-hint, .empty-hint {
      text-align: center;
      padding: 48px 24px;
      color: var(--color-text-muted);

      mat-icon { font-size: 40px; display: block; margin: 0 auto 12px; }
      p { margin: 0; font-size: 0.875rem; }
    }

    .articles-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .article-row {
      padding: 20px 24px;

      &.pinned { border-left: 4px solid var(--color-accent); }
    }

    .article-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }

    .pin-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;

      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .article-title {
      margin: 0 0 6px;
      font-size: 0.95rem;
      color: var(--color-text-heading);
    }

    .article-preview {
      font-size: 0.8125rem;
      color: var(--color-text-caption);
      margin: 0 0 12px;
      line-height: 1.5;
    }

    .article-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .article-author {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--color-text-muted);

      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .delete-btn { color: var(--color-error) !important; }
  `],
})
export class AdminNewsComponent {
  private auth = inject(AuthService);
  private fs = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  publishing = signal(false);

  readonly defaults = {
    title: '',
    body: '',
    category: 'General',
    targetRoles: ['student', 'teacher'],
    imageURL: '',
    isPinned: false,
  };

  form = this.fb.group({
    title:       ['', Validators.required],
    body:        ['', [Validators.required, Validators.minLength(20)]],
    category:    ['General'],
    targetRoles: [['student', 'teacher'] as string[], Validators.required],
    imageURL:    [''],
    isPinned:    [false],
  });

  articles = toSignal(
    this.fs.collection$<Announcement & { category?: string; imageURL?: string }>(
      'announcements',
      this.fs.orderBy('createdAt', 'desc'),
      this.fs.limit(20)
    )
  );

  publish(): void {
    const uid = this.auth.currentUser()?.uid;
    if (!uid || this.form.invalid) return;
    this.publishing.set(true);

    const val = this.form.value;
    const payload = {
      title:       val.title,
      body:        val.body,
      category:    val.category ?? 'General',
      imageURL:    val.imageURL ?? '',
      targetRoles: val.targetRoles ?? ['student', 'teacher'],
      isPinned:    val.isPinned ?? false,
      authorId:    uid,
      authorName:  this.auth.currentUser()?.displayName ?? 'Admin',
    };

    this.fs.add('announcements', payload).subscribe({
      next: () => {
        this.publishing.set(false);
        this.form.reset(this.defaults);
        this.toast.success('Article published! It will appear on the homepage.');
      },
      error: () => {
        this.publishing.set(false);
        this.toast.error('Failed to publish. Check your connection.');
      },
    });
  }

  delete(id: string): void {
    this.fs.delete(`announcements/${id}`).subscribe(() =>
      this.toast.success('Article deleted.')
    );
  }
}
