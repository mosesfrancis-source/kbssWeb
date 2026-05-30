import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Announcement, GalleryImage, SchoolEvent } from '../../../shared/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private fs = inject(FirestoreService);

  // Firestore streams — no initialValue → starts as undefined (loading),
  // then Firestore emits [] (empty) or populated array
  announcements = toSignal(
    this.fs.collection$<Announcement>(
      'announcements',
      this.fs.where('isPinned', '==', false),
      this.fs.orderBy('createdAt', 'desc'),
      this.fs.limit(6)
    )
  );

  pinnedAnnouncements = toSignal(
    this.fs.collection$<Announcement>(
      'announcements',
      this.fs.where('isPinned', '==', true),
      this.fs.orderBy('createdAt', 'desc'),
      this.fs.limit(3)
    )
  );

  gallery = toSignal(
    this.fs.collection$<GalleryImage>(
      'gallery',
      this.fs.orderBy('uploadedAt', 'desc'),
      this.fs.limit(6)
    ),
    { initialValue: [] }
  );

  events = toSignal(
    this.fs.collection$<SchoolEvent>(
      'events',
      this.fs.orderBy('date', 'asc'),
      this.fs.limit(3)
    ),
    { initialValue: [] }
  );

  // Animated counters
  counters = signal([
    { label: 'Students Enrolled', target: 520, current: 0, suffix: '+', icon: 'school' },
    { label: 'Qualified Teachers', target: 34, current: 0, suffix: '', icon: 'supervisor_account' },
    { label: 'WAEC Pass Rate', target: 87, current: 0, suffix: '%', icon: 'emoji_events' },
    { label: 'Years of Excellence', target: 45, current: 0, suffix: '+', icon: 'verified' },
  ]);

  // Countdown timer
  deadline = new Date('2025-09-01');
  countdown = signal({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  private countdownTimer?: ReturnType<typeof setInterval>;

  // Gallery lightbox
  lightboxImage = signal<GalleryImage | null>(null);

  // News ticker
  tickerIndex = signal(0);
  private tickerTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startCountdown();
    this.startTicker();
  }

  ngAfterViewInit(): void {
    this.animateCounters();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownTimer);
    clearInterval(this.tickerTimer);
  }

  private animateCounters(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.counters().forEach((counter, i) => {
              const duration = 2000;
              const step = counter.target / (duration / 16);
              let current = 0;
              const timer = setInterval(() => {
                current = Math.min(current + step, counter.target);
                this.counters.update((c) => {
                  const updated = [...c];
                  updated[i] = { ...updated[i], current: Math.round(current) };
                  return updated;
                });
                if (current >= counter.target) clearInterval(timer);
              }, 16);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsEl = document.querySelector('.stats-section');
    if (statsEl) observer.observe(statsEl);
  }

  private startCountdown(): void {
    const update = () => {
      const now = new Date().getTime();
      const distance = this.deadline.getTime() - now;

      if (distance <= 0) {
        this.countdown.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      this.countdown.set({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    update();
    this.countdownTimer = setInterval(update, 1000);
  }

  private startTicker(): void {
    this.tickerTimer = setInterval(() => {
      const items = this.announcements();
      if (items && items.length > 0) {
        this.tickerIndex.update((i) => (i + 1) % items.length);
      }
    }, 4000);
  }

  openLightbox(img: GalleryImage): void {
    this.lightboxImage.set(img);
    document.body.classList.add('no-scroll');
  }

  closeLightbox(): void {
    this.lightboxImage.set(null);
    document.body.classList.remove('no-scroll');
  }

  features = [
    {
      icon: 'emoji_events',
      title: 'Academic Excellence',
      desc: 'Consistently high WAEC performance with dedicated teachers and modern curriculum.',
    },
    {
      icon: 'groups',
      title: 'Strong Community',
      desc: 'A tight-knit school family that supports every student\'s growth and potential.',
    },
    {
      icon: 'sports_soccer',
      title: 'Sports & Culture',
      desc: 'Rich extracurricular program: football, athletics, drama, cultural events and more.',
    },
    {
      icon: 'laptop',
      title: 'Digital Learning',
      desc: 'Modern digital tools and online portal to support 21st-century education.',
    },
    {
      icon: 'menu_book',
      title: 'Comprehensive Curriculum',
      desc: 'JSS and SSS programs covering Science, Arts, and Commercial divisions.',
    },
    {
      icon: 'security',
      title: 'Safe Environment',
      desc: 'A safe, inclusive, and disciplined learning environment for all students.',
    },
  ];
}
