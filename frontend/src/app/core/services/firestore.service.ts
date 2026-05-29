import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
  serverTimestamp,
  getDoc,
  getDocs,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private fs = inject(Firestore);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  col<T>(path: string): CollectionReference<T> {
    return collection(this.fs, path) as CollectionReference<T>;
  }

  docRef<T>(path: string): DocumentReference<T> {
    return doc(this.fs, path) as DocumentReference<T>;
  }

  serverTimestamp() {
    return serverTimestamp();
  }

  increment(n: number) {
    return increment(n);
  }

  arrayUnion(...items: unknown[]) {
    return arrayUnion(...items);
  }

  arrayRemove(...items: unknown[]) {
    return arrayRemove(...items);
  }

  // ─── Real-time streams ────────────────────────────────────────────────────

  collection$<T>(
    path: string,
    ...constraints: QueryConstraint[]
  ): Observable<T[]> {
    const ref = collection(this.fs, path);
    const q = constraints.length ? query(ref, ...constraints) : ref;
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  doc$<T>(path: string): Observable<T | undefined> {
    return docData(doc(this.fs, path), { idField: 'id' }) as Observable<
      T | undefined
    >;
  }

  // ─── One-time reads ───────────────────────────────────────────────────────

  getDoc<T>(path: string): Observable<T | null> {
    return from(getDoc(doc(this.fs, path))).pipe(
      map((snap) => (snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null))
    );
  }

  getDocs<T>(
    path: string,
    ...constraints: QueryConstraint[]
  ): Observable<T[]> {
    const ref = collection(this.fs, path);
    const q = constraints.length ? query(ref, ...constraints) : ref;
    return from(getDocs(q)).pipe(
      map((snap) =>
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as T))
      )
    );
  }

  // ─── Writes ───────────────────────────────────────────────────────────────

  add<T>(path: string, data: Partial<T>): Observable<string> {
    return from(
      addDoc(collection(this.fs, path), {
        ...data,
        createdAt: serverTimestamp(),
      })
    ).pipe(map((ref) => ref.id));
  }

  set<T>(path: string, data: Partial<T>, merge = false): Observable<void> {
    return from(setDoc(doc(this.fs, path), data as object, { merge }));
  }

  update<T>(path: string, data: Partial<T>): Observable<void> {
    return from(updateDoc(doc(this.fs, path), data as object));
  }

  delete(path: string): Observable<void> {
    return from(deleteDoc(doc(this.fs, path)));
  }

  // ─── Batch writes ─────────────────────────────────────────────────────────

  batch() {
    return writeBatch(this.fs);
  }

  // ─── Query builders ───────────────────────────────────────────────────────

  where(field: string, op: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in', value: unknown) {
    return where(field, op, value);
  }

  orderBy(field: string, dir: 'asc' | 'desc' = 'asc') {
    return orderBy(field, dir);
  }

  limit(n: number) {
    return limit(n);
  }

  startAfter(snapshot: DocumentSnapshot) {
    return startAfter(snapshot);
  }

  // ─── Utility ──────────────────────────────────────────────────────────────

  timestampToDate(ts: Timestamp | null | undefined): Date | null {
    return ts ? ts.toDate() : null;
  }
}
