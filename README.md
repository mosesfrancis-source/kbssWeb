# Kissi Bendu Secondary School — Academic Web Portal

**K.B.S.S** | Koindu Town, Kailahun District, Sierra Leone

A production-ready, full-stack school management and academic portal built with Angular 17+ and Firebase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17+ (standalone), Angular Material, SCSS, RxJS |
| Auth | Firebase Authentication (email/password + custom claims) |
| Database | Cloud Firestore (real-time NoSQL) |
| Storage | Firebase Storage |
| Functions | Cloud Functions for Firebase (Node.js 20, TypeScript) |
| Hosting | Firebase Hosting (with Angular Universal SSR) |
| Dev | Firebase Emulator Suite |

---

## Prerequisites

- Node.js 20+
- npm 10+
- Angular CLI 17+: `npm install -g @angular/cli`
- Firebase CLI: `npm install -g firebase-tools`

---

## Project Structure

```
kbssWeb/
├── frontend/          # Angular 17+ app
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Services, guards, interceptors
│   │   │   ├── shared/      # Reusable components, models
│   │   │   ├── features/    # Public, auth, student, teacher, admin
│   │   │   └── layout/      # Navbar, footer, sidebar, shell
│   │   ├── environments/
│   │   └── styles/
├── firebase/
│   ├── functions/     # Cloud Functions (TypeScript)
│   ├── firestore.rules
│   ├── storage.rules
│   └── firestore.indexes.json
└── scripts/
    └── seed.js        # Firestore sample data seeder
```

---

## Quick Start — Local Development

### 1. Clone and install dependencies

```bash
# Frontend
cd frontend
npm install

# Cloud Functions
cd ../firebase/functions
npm install
```

### 2. Configure Firebase

The Firebase project is already configured. The `environment.ts` files contain the project credentials.

Firebase Project ID: `kbss-5a255`

### 3. Start Firebase Emulators

```bash
cd firebase
firebase emulators:start
```

Emulator UI: http://localhost:4000

| Emulator | Port |
|---|---|
| Auth | 9099 |
| Firestore | 8080 |
| Storage | 9199 |
| Functions | 5001 |
| Hosting | 5000 |

### 4. Seed sample data (optional)

```bash
# With emulators running
cd scripts
node seed.js
```

### 5. Run Angular dev server

```bash
cd frontend
ng serve
```

App: http://localhost:4200

---

## Firebase Project Setup

If setting up a new Firebase project:

```bash
# Login
firebase login

# Initialize (from /firebase directory)
cd firebase
firebase init

# Select: Firestore, Functions, Hosting, Storage, Emulators
# Use existing project: kbss-5a255
```

### Deploy Cloud Functions

```bash
cd firebase
firebase deploy --only functions
```

### Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore
```

### Build & Deploy Angular App

```bash
# Build for production
cd frontend
ng build --configuration production

# Deploy to Firebase Hosting
cd ../firebase
firebase deploy --only hosting
```

### Deploy Everything

```bash
firebase deploy
```

---

## User Roles

| Role | Access |
|---|---|
| `admin` | Full system access — manage students, teachers, admissions, analytics |
| `teacher` | Manage own classes — grades, attendance, assignments, announcements |
| `student` | View own data — results, assignments, timetable, resources |

Default admin credentials (after seeding):
- Email: `admin@kbss.edu.sl`
- Password: `Admin@KBSS2024`

---

## Environment Variables

Edit `frontend/src/environments/environment.ts` and `environment.prod.ts` with your Firebase config.

For Cloud Functions email notifications, set the following Firebase environment config:

```bash
firebase functions:config:set \
  email.user="notifications@kbss.edu.sl" \
  email.pass="your-app-password" \
  email.admin="admin@kbss.edu.sl"
```

---

## Portals

| Portal | Route | Role |
|---|---|---|
| Public Website | `/` | All (unauthenticated) |
| Login | `/auth/login` | All |
| Student Portal | `/student` | `student` |
| Teacher Portal | `/teacher` | `teacher` |
| Admin Portal | `/admin` | `admin` |

---

## Features

- Real-time Firestore data streams (AngularFire)
- Role-based access control (Firebase custom claims)
- File uploads with progress tracking (Firebase Storage)
- PDF report generation (Cloud Functions + jsPDF)
- Email notifications (Nodemailer via Cloud Functions)
- Dark/light mode with localStorage persistence
- Offline support (Firestore IndexedDB persistence)
- Skeleton loaders, toast notifications, micro-interactions
- Angular Universal SSR for public pages SEO
- Responsive: 320px → 1440px
- WCAG AA accessibility

---

## Architecture Notes

- All Firestore queries use AngularFire's `collectionData()` / `docData()` observables
- Custom claims are set server-side via Cloud Functions — never trust client-side role claims alone
- Security rules enforce role-based access at the database level
- Angular route guards (`AuthGuard`, `RoleGuard`) provide client-side route protection
- Loading state managed via `LoadingInterceptor` + `LoadingService`

---

## School Information

**Kissi Bendu Secondary School (K.B.S.S)**  
Koindu Town, Kailahun District, Eastern Province  
Sierra Leone, West Africa

---

*Built with Angular 17 + Firebase — Powered by Anthropic Claude*
