import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Resource } from '../../../shared/models';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-student-resources',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <div class="route-wrapper">
      <div class="portal-page-header">
        <h1>Learning Resources</h1>
        <p>Study materials uploaded by your teachers</p>
      </div>

      <!-- Search -->
      <div class="resources-search card">
        <mat-icon>search</mat-icon>
        <input type="text" placeholder="Search resources..." [(ngModel)]="searchQuery" class="search-input">
      </div>

      <!-- Resources grid -->
      <div class="resources-grid">
        @for (r of filteredResources(); track r.id) {
          <div class="resource-card card card-hover">
            <div class="resource-icon" [class]="fileColor(r.fileType)">
              <mat-icon>{{ fileIcon(r.fileType) }}</mat-icon>
            </div>
            <div class="resource-info">
              <h4>{{ r.title }}</h4>
              <p>{{ r.description }}</p>
              <div class="resource-meta">
                <span class="badge badge-primary">{{ r.fileType.toUpperCase() }}</span>
              </div>
            </div>
            <a [href]="r.fileURL" target="_blank" mat-icon-button class="download-btn" aria-label="Download">
              <mat-icon>download</mat-icon>
            </a>
          </div>
        } @empty {
          <div class="empty-state">
            <mat-icon>folder_open</mat-icon>
            <p>No resources available yet</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .resources-search { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-5); margin-bottom: var(--space-6); mat-icon { color: var(--color-text-caption); } .search-input { border: none; outline: none; background: transparent; font-family: var(--font-body); font-size: 0.875rem; color: var(--color-text-body); flex: 1; &::placeholder { color: var(--color-text-muted); } } }
    .resources-grid { display: flex; flex-direction: column; gap: var(--space-3); }
    .resource-card { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) var(--space-5); }
    .resource-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; &.pdf { background: #FFEBEE; color: #C62828; } &.doc { background: #E3F2FD; color: #1565C0; } &.ppt { background: #FFF3E0; color: #E65100; } &.other { background: var(--color-surface-muted); color: var(--color-text-caption); } mat-icon { font-size: 22px; } }
    .resource-info { flex: 1; h4 { font-size: 0.9rem; color: var(--color-text-heading); margin-bottom: 4px; } p { font-size: 0.8rem; color: var(--color-text-caption); margin-bottom: var(--space-2); } }
    .resource-meta { display: flex; gap: var(--space-2); }
    .download-btn { color: var(--color-primary) !important; }
    .empty-state { text-align: center; padding: var(--space-12); color: var(--color-text-muted); mat-icon { font-size: 48px; display: block; margin-bottom: var(--space-3); } }
  `],
})
export class StudentResourcesComponent {
  private fs = inject(FirestoreService);
  searchQuery = '';

  allResources = toSignal(
    this.fs.collection$<Resource>('resources', this.fs.orderBy('uploadedAt', 'desc')),
    { initialValue: [] }
  );

  filteredResources = () => {
    const q = this.searchQuery.toLowerCase();
    return q ? this.allResources().filter((r) =>
      r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    ) : this.allResources();
  };

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
