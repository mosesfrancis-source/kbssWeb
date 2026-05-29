import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
} from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  state: 'running' | 'paused' | 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);

  /**
   * Upload a file and emit progress events.
   */
  upload(path: string, file: File): Observable<UploadProgress> {
    const storageRef = ref(this.storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Observable<UploadProgress>((observer) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          observer.next({
            progress,
            state: snapshot.state as 'running' | 'paused',
          });
        },
        (error) => {
          observer.next({ progress: 0, state: 'error' });
          observer.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          observer.next({ progress: 100, downloadURL, state: 'success' });
          observer.complete();
        }
      );

      return () => uploadTask.cancel();
    });
  }

  /**
   * Upload and wait for completion — returns download URL.
   */
  uploadAndGetURL(path: string, file: File): Observable<string> {
    return new Observable<string>((observer) => {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (err) => observer.error(err),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          observer.next(url);
          observer.complete();
        }
      );
    });
  }

  getDownloadURL(path: string): Observable<string> {
    return from(getDownloadURL(ref(this.storage, path)));
  }

  delete(path: string): Observable<void> {
    return from(deleteObject(ref(this.storage, path)));
  }

  listFiles(path: string): Observable<StorageReference[]> {
    return from(listAll(ref(this.storage, path))).pipe(
      map((result) => result.items)
    );
  }

  getRef(path: string): StorageReference {
    return ref(this.storage, path);
  }

  // ─── Path builders ────────────────────────────────────────────────────────

  avatarPath(uid: string): string {
    return `users/${uid}/avatar.jpg`;
  }

  materialPath(classId: string, fileName: string): string {
    return `materials/${classId}/${fileName}`;
  }

  galleryPath(eventId: string, fileName: string): string {
    return `gallery/${eventId}/${fileName}`;
  }

  admissionDocPath(applicationId: string, fileName: string): string {
    return `admissions/${applicationId}/${fileName}`;
  }

  submissionPath(assignmentId: string, studentId: string, fileName: string): string {
    return `submissions/${assignmentId}/${studentId}/${fileName}`;
  }

  uniqueFileName(file: File): string {
    const ext = file.name.split('.').pop();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  }
}
