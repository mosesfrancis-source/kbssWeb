import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../../core/services/firestore.service';
import { GalleryImage } from '../../../shared/models';
import { toSignal } from '@angular/core/rxjs-interop';

type Category = 'All' | 'Sports' | 'Graduation' | 'Events' | 'Academics' | 'General';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, RouterLink],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/home">Home</a><span>›</span><span>Gallery</span>
        </div>
        <h1>School Gallery</h1>
        <p>Capturing moments of learning, achievement, and community at K.B.S.S.</p>
      </div>
    </section>

    <section class="gallery-page">
      <div class="container">
        <!-- Category filters -->
        <div class="filter-bar">
          @for (cat of categories; track cat) {
            <button
              mat-stroked-button
              [class.active]="activeCategory() === cat"
              (click)="activeCategory.set(cat)"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Gallery grid -->
        <div class="gallery-masonry">
          @for (img of filteredImages(); track img.id) {
            <div class="gallery-item" (click)="openLightbox(img)">
              <img [src]="img.imageURL" [alt]="img.caption" loading="lazy">
              <div class="gallery-overlay">
                <mat-icon>zoom_in</mat-icon>
                <span class="img-caption">{{ img.caption }}</span>
                <span class="img-category badge badge-primary">{{ img.category }}</span>
              </div>
            </div>
          } @empty {
            @for (n of [1,2,3,4,5,6,7,8]; track n) {
              <div class="gallery-item skeleton-item">
                <div class="skeleton" style="height:100%;border-radius:12px;"></div>
              </div>
            }
          }
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    @if (lightboxImg()) {
      <div class="lightbox" (click)="closeLightbox()">
        <button class="lightbox-close" (click)="closeLightbox()">
          <mat-icon>close</mat-icon>
        </button>
        <button class="lightbox-prev" (click)="navigate(-1); $event.stopPropagation()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <img [src]="lightboxImg()!.imageURL" [alt]="lightboxImg()!.caption">
          <div class="lightbox-info">
            <span class="badge badge-primary">{{ lightboxImg()!.category }}</span>
            <p>{{ lightboxImg()!.caption }}</p>
          </div>
        </div>
        <button class="lightbox-next" (click)="navigate(1); $event.stopPropagation()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    }
  `,
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent {
  private fs = inject(FirestoreService);

  activeCategory = signal<Category>('All');
  lightboxImg = signal<GalleryImage | null>(null);
  lightboxIndex = signal(0);

  categories: Category[] = ['All', 'Sports', 'Graduation', 'Events', 'Academics', 'General'];

  allImages = toSignal(
    this.fs.collection$<GalleryImage>('gallery', this.fs.orderBy('uploadedAt', 'desc')),
    { initialValue: [] }
  );

  filteredImages = () => {
    const cat = this.activeCategory();
    const imgs = this.allImages();
    return cat === 'All' ? imgs : imgs.filter((i) => i.category === cat);
  };

  openLightbox(img: GalleryImage): void {
    const idx = this.filteredImages().findIndex((i) => i.id === img.id);
    this.lightboxIndex.set(idx);
    this.lightboxImg.set(img);
    document.body.classList.add('no-scroll');
  }

  closeLightbox(): void {
    this.lightboxImg.set(null);
    document.body.classList.remove('no-scroll');
  }

  navigate(dir: -1 | 1): void {
    const imgs = this.filteredImages();
    const newIdx = (this.lightboxIndex() + dir + imgs.length) % imgs.length;
    this.lightboxIndex.set(newIdx);
    this.lightboxImg.set(imgs[newIdx]);
  }
}
