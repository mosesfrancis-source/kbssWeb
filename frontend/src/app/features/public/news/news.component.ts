import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Announcement, SchoolEvent } from '../../../shared/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/home">Home</a><span>›</span><span>News & Events</span>
        </div>
        <h1>News & Events</h1>
        <p>Stay up to date with everything happening at Kissi Bendu Secondary School.</p>
      </div>
    </section>

    <section class="news-page">
      <div class="container">
        <div class="news-layout">
          <!-- News feed -->
          <main class="news-main">
            @if (pinned().length > 0) {
              <div class="featured-post card card-hover" [routerLink]="[]">
                <div class="featured-label">
                  <mat-icon>push_pin</mat-icon> Pinned
                </div>
                <h2>{{ pinned()[0].title }}</h2>
                <p>{{ pinned()[0].body }}</p>
                <div class="post-meta">
                  <mat-icon>calendar_today</mat-icon>
                  {{ formatDate(pinned()[0].createdAt) }}
                </div>
              </div>
            }

            <div class="news-grid">
              @for (item of announcements(); track item.id) {
                <div class="news-card card card-hover">
                  <div class="news-roles">
                    @for (role of item.targetRoles; track role) {
                      <span class="badge badge-primary">{{ role }}</span>
                    }
                  </div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.body | slice:0:160 }}{{ item.body.length > 160 ? '...' : '' }}</p>
                  <div class="news-meta">
                    <mat-icon>calendar_today</mat-icon>
                    {{ formatDate(item.createdAt) }}
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <mat-icon>newspaper</mat-icon>
                  <p>No announcements at the moment. Check back soon.</p>
                </div>
              }
            </div>
          </main>

          <!-- Sidebar: upcoming events -->
          <aside class="news-sidebar">
            <div class="sidebar-section">
              <h3><mat-icon>event</mat-icon> Upcoming Events</h3>
              <div class="events-list">
                @for (event of events(); track event.id) {
                  <div class="event-item">
                    <div class="event-date-badge">
                      <span class="event-day">{{ getDay(event.date) }}</span>
                      <span class="event-month">{{ getMonth(event.date) }}</span>
                    </div>
                    <div class="event-info">
                      <h4>{{ event.title }}</h4>
                      <p><mat-icon>location_on</mat-icon> {{ event.location }}</p>
                      <span class="badge badge-info">{{ event.category }}</span>
                    </div>
                  </div>
                } @empty {
                  <p class="no-events">No upcoming events scheduled.</p>
                }
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
  private fs = inject(FirestoreService);

  announcements = toSignal(
    this.fs.collection$<Announcement>(
      'announcements',
      this.fs.where('isPinned', '==', false),
      this.fs.orderBy('createdAt', 'desc'),
      this.fs.limit(20)
    ),
    { initialValue: [] }
  );

  pinned = toSignal(
    this.fs.collection$<Announcement>(
      'announcements',
      this.fs.where('isPinned', '==', true),
      this.fs.orderBy('createdAt', 'desc')
    ),
    { initialValue: [] }
  );

  events = toSignal(
    this.fs.collection$<SchoolEvent>(
      'events',
      this.fs.orderBy('date', 'asc'),
      this.fs.limit(5)
    ),
    { initialValue: [] }
  );

  formatDate(ts: Timestamp): string {
    if (!ts) return '';
    const d = ts.toDate();
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getDay(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit' });
  }

  getMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short' });
  }
}
