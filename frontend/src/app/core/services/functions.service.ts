import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FunctionsService {
  private functions = inject(Functions);

  private call<T, R>(name: string, data: T): Observable<R> {
    const fn = httpsCallable<T, R>(this.functions, name);
    return from(fn(data)).pipe(map((result) => result.data));
  }

  setUserRole(uid: string, role: 'student' | 'teacher' | 'admin'): Observable<{ success: boolean }> {
    return this.call('setUserRole', { uid, role });
  }

  generateResultsPDF(
    studentId: string,
    term: 1 | 2 | 3,
    academicYear: string
  ): Observable<{ downloadURL: string; fileName: string }> {
    return this.call('generateResultsPDF', { studentId, term, academicYear });
  }

  ping(): Observable<{ status: string }> {
    return this.call('ping', {});
  }
}
