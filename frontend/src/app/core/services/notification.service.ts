import { Injectable, inject, signal } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';
import { Observable, of, switchMap } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'announcement' | 'assignment' | 'result' | 'admission' | 'general';
  isRead: boolean;
  createdAt: Timestamp;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private fs = inject(FirestoreService);
  private auth = inject(AuthService);

  unreadCount = signal(0);

  getNotifications(): Observable<AppNotification[]> {
    return this.auth.currentUser$.pipe(
      switchMap((user) => {
        if (!user) return of([]);
        return this.fs.collection$<AppNotification>(
          'notifications',
          this.fs.where('userId', '==', user.uid),
          this.fs.orderBy('createdAt', 'desc'),
          this.fs.limit(50)
        );
      })
    );
  }

  getUnread(): Observable<AppNotification[]> {
    return this.auth.currentUser$.pipe(
      switchMap((user) => {
        if (!user) return of([]);
        return this.fs.collection$<AppNotification>(
          'notifications',
          this.fs.where('userId', '==', user.uid),
          this.fs.where('isRead', '==', false),
          this.fs.orderBy('createdAt', 'desc')
        );
      })
    );
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.fs.update(`notifications/${notificationId}`, { isRead: true });
  }

  markAllAsRead(userId: string): Observable<void> {
    return new Observable((observer) => {
      this.fs
        .getDocs<AppNotification>(
          'notifications',
          this.fs.where('userId', '==', userId),
          this.fs.where('isRead', '==', false)
        )
        .subscribe((notifications) => {
          const batch = this.fs.batch();
          notifications.forEach((n) => {
            const ref = this.fs.docRef(`notifications/${n.id}`);
            batch.update(ref, { isRead: true });
          });
          batch.commit().then(() => {
            observer.next();
            observer.complete();
          }).catch((err) => observer.error(err));
        });
    });
  }

  delete(notificationId: string): Observable<void> {
    return this.fs.delete(`notifications/${notificationId}`);
  }
}
