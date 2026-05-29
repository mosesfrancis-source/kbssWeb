import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  IdTokenResult,
} from '@angular/fire/auth';
import { from, Observable, BehaviorSubject, of, firstValueFrom } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { FirestoreService } from './firestore.service';

export type UserRole = 'student' | 'teacher' | 'admin' | null;

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private fs = inject(FirestoreService);

  // Signals
  currentUser = signal<AppUser | null>(null);
  loading = signal(true);

  role = computed<UserRole>(() => this.currentUser()?.role ?? null);
  isLoggedIn = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.role() === 'admin');
  isTeacher = computed(() => this.role() === 'teacher');
  isStudent = computed(() => this.role() === 'student');

  // Observable for legacy AngularFire consumers
  private userSubject = new BehaviorSubject<AppUser | null>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        let role = tokenResult.claims['role'] as UserRole | undefined;

        // No custom claim yet (Cloud Function hasn't run) — fall back to Firestore
        if (!role) {
          const doc = await firstValueFrom(
            this.fs.getDoc<{ role: UserRole }>(`users/${firebaseUser.uid}`)
          ).catch(() => null);
          role = doc?.role ?? 'student';
        }

        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? '',
          role: role ?? 'student',
          photoURL: firebaseUser.photoURL ?? '',
          isActive: true,
        };
        this.currentUser.set(appUser);
        this.userSubject.next(appUser);
      } else {
        this.currentUser.set(null);
        this.userSubject.next(null);
      }
      this.loading.set(false);
    });
  }

  private mapUser(user: User, token: IdTokenResult): AppUser {
    return {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      role: (token.claims['role'] as UserRole) ?? 'student',
      photoURL: user.photoURL ?? '',
      isActive: true,
    };
  }

  login(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(() => void 0)
    );
  }

  register(
    email: string,
    password: string,
    displayName: string,
    role: 'student' | 'teacher' = 'student'
  ): Observable<void> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap((cred) =>
        from(updateProfile(cred.user, { displayName })).pipe(
          switchMap(() =>
            this.fs.set(`users/${cred.user.uid}`, {
              uid: cred.user.uid,
              email,
              displayName,
              role,
              photoURL: '',
              isActive: true,
            }, true)
          )
        )
      ),
      map(() => void 0)
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.userSubject.next(null);
        this.router.navigate(['/auth/login']);
      })
    );
  }

  sendPasswordReset(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  getToken(): Observable<string | null> {
    const user = this.auth.currentUser;
    if (!user) return of(null);
    return from(user.getIdToken());
  }

  async refreshToken(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    const tokenResult = await user.getIdTokenResult(true);
    const appUser = this.mapUser(user, tokenResult);
    this.currentUser.set(appUser);
    this.userSubject.next(appUser);
  }

  getRedirectPath(): string {
    const role = this.role();
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/home';
    }
  }
}
