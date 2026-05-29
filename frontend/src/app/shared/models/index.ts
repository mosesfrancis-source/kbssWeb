import { Timestamp } from '@angular/fire/firestore';

// ─── User / Auth ──────────────────────────────────────────────────────────────
export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  photoURL: string;
  createdAt: Timestamp;
  isActive: boolean;
}

// ─── Student ──────────────────────────────────────────────────────────────────
export interface Student {
  id?: string;
  uid: string;
  studentId: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  classId: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  enrollmentYear: number;
  photoURL?: string;
}

// ─── Teacher ──────────────────────────────────────────────────────────────────
export interface Teacher {
  id?: string;
  uid: string;
  teacherId: string;
  fullName: string;
  gender: 'Male' | 'Female';
  phone: string;
  email: string;
  subjectIds: string[];
  classIds: string[];
  qualification: string;
  joinDate: string;
  photoURL?: string;
}

// ─── Class ────────────────────────────────────────────────────────────────────
export interface SchoolClass {
  id?: string;
  classId: string;
  name: string;
  level: 'JSS' | 'SSS';
  teacherId: string;
  academicYear: string;
  subjectIds: string[];
}

// ─── Subject ──────────────────────────────────────────────────────────────────
export interface Subject {
  id?: string;
  subjectId: string;
  name: string;
  code: string;
  division: 'Science' | 'Arts' | 'Commercial' | 'Core';
  level: 'JSS' | 'SSS' | 'Both';
}

// ─── Result ───────────────────────────────────────────────────────────────────
export interface Result {
  id?: string;
  studentId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  term: 1 | 2 | 3;
  academicYear: string;
  score: number;
  grade: string;
  remarks: string;
  createdAt: Timestamp;
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id?: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  recordedBy: string;
}

// ─── Assignment ───────────────────────────────────────────────────────────────
export interface Assignment {
  id?: string;
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dueDate: string;
  attachmentURL?: string;
  createdAt: Timestamp;
}

// ─── Submission ───────────────────────────────────────────────────────────────
export interface Submission {
  id?: string;
  assignmentId: string;
  studentId: string;
  submittedAt: Timestamp;
  fileURL: string;
  grade?: string;
  feedback?: string;
  status: 'pending' | 'graded' | 'late';
}

// ─── Announcement ─────────────────────────────────────────────────────────────
export interface Announcement {
  id?: string;
  title: string;
  body: string;
  authorId: string;
  authorName?: string;
  targetRoles: ('student' | 'teacher' | 'admin')[];
  createdAt: Timestamp;
  isPinned: boolean;
}

// ─── Event ────────────────────────────────────────────────────────────────────
export interface SchoolEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: 'Academic' | 'Sports' | 'Cultural' | 'Graduation' | 'Other';
  imageURL?: string;
}

// ─── Admission ────────────────────────────────────────────────────────────────
export interface Admission {
  id?: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  formerSchool: string;
  preferredClass: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  documentsURL: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  reviewedBy?: string;
  notes?: string;
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
export interface GalleryImage {
  id?: string;
  imageURL: string;
  thumbnailURL?: string;
  caption: string;
  category: 'Sports' | 'Graduation' | 'Events' | 'Academics' | 'General';
  uploadedBy: string;
  uploadedAt: Timestamp;
}

// ─── Resource ─────────────────────────────────────────────────────────────────
export interface Resource {
  id?: string;
  title: string;
  description: string;
  fileURL: string;
  fileType: string;
  classId: string;
  subjectId: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'announcement' | 'assignment' | 'result' | 'admission' | 'general';
  isRead: boolean;
  createdAt: Timestamp;
  link?: string;
}

// ─── School Settings ──────────────────────────────────────────────────────────
export interface SchoolConfig {
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  adminEmail: string;
  currentAcademicYear: string;
  currentTerm: 1 | 2 | 3;
  logoURL: string;
}

// ─── Grade helpers ────────────────────────────────────────────────────────────
export function scoreToGrade(score: number): string {
  if (score >= 75) return 'A1';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B3';
  if (score >= 60) return 'C4';
  if (score >= 55) return 'C5';
  if (score >= 50) return 'C6';
  if (score >= 45) return 'D7';
  if (score >= 40) return 'E8';
  return 'F9';
}

export function gradeColor(grade: string): string {
  const g = grade.toUpperCase();
  if (['A1', 'B2', 'B3'].includes(g)) return 'success';
  if (['C4', 'C5', 'C6'].includes(g)) return 'warning';
  return 'error';
}
