/**
 * K.B.S.S Firestore Seed Script
 * Run with: node seed.js
 * Requires Firebase emulators running on default ports.
 * To seed production: remove FIRESTORE_EMULATOR_HOST before running.
 */

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  Timestamp,
  connectFirestoreEmulator,
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey:            'AIzaSyBQcwWs1DTPpiaU6K8wl65lA3LtIU6z5cw',
  authDomain:        'kbss-5a255.firebaseapp.com',
  projectId:         'kbss-5a255',
  storageBucket:     'kbss-5a255.firebasestorage.app',
  messagingSenderId: '295022249103',
  appId:             '1:295022249103:web:c3ea48f963a208c80ddcfa',
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);

// ─── Sierra Leonean names ─────────────────────────────────────────────────────
const maleNames = [
  'Amara Koroma', 'Mohamed Sesay', 'Ibrahim Kamara', 'Foday Conteh', 'Alieu Bangura',
  'Sorie Mansaray', 'Lahai Fofanah', 'Mariama Koroma', 'Brima Turay', 'Santigie Jalloh',
  'Abdul Kallon', 'Alhaji Bah', 'Saidu Fofanah', 'Sylvanus Musa', 'Emmanuel Koroma',
  'Patrick Gborie', 'Mustapha Sow', 'Issa Kamara', 'Alusine Conteh', 'Yahaya Kamara',
  'Musa Sesay', 'Sulaimanu Bangura', 'Gibril Fofanah', 'Komba Koroma', 'Ansumana Jalloh',
];

const femaleNames = [
  'Fatmata Sesay', 'Mariama Kamara', 'Hawa Conteh', 'Adama Bangura', 'Isata Koroma',
  'Aminata Turay', 'Fanta Jalloh', 'Sia Fofanah', 'Kadi Mansaray', 'Ramatu Bah',
  'Zainab Sesay', 'Tenneh Kallon', 'Memuna Koroma', 'Kumba Turay', 'Baindu Fofanah',
  'Abie Kamara', 'Kadie Conteh', 'Fatou Bangura', 'Mabinty Koroma', 'Sata Kamara',
  'Haja Sesay', 'Nanah Fofanah', 'Jeneba Jalloh', 'Massah Mansaray', 'Bintu Turay',
];

const guardianSurnames = ['Koroma', 'Sesay', 'Kamara', 'Conteh', 'Bangura', 'Mansaray', 'Fofanah', 'Turay', 'Jalloh', 'Kallon'];

function randEl(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n) { return String(n).padStart(2, '0'); }
function randDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function scoreToGrade(score) {
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

// ─── Seed data ────────────────────────────────────────────────────────────────

const CLASSES = [
  { classId: 'jss-1a', name: 'JSS 1A', level: 'JSS', teacherId: 'teacher-001', academicYear: '2024/2025', subjectIds: ['math','english','science','social','french','rme','pe'] },
  { classId: 'jss-1b', name: 'JSS 1B', level: 'JSS', teacherId: 'teacher-002', academicYear: '2024/2025', subjectIds: ['math','english','science','social','french','rme','pe'] },
  { classId: 'jss-2a', name: 'JSS 2A', level: 'JSS', teacherId: 'teacher-003', academicYear: '2024/2025', subjectIds: ['math','english','science','social','french','rme','pe'] },
  { classId: 'jss-2b', name: 'JSS 2B', level: 'JSS', teacherId: 'teacher-004', academicYear: '2024/2025', subjectIds: ['math','english','science','social','french','rme','pe'] },
  { classId: 'jss-3a', name: 'JSS 3A', level: 'JSS', teacherId: 'teacher-001', academicYear: '2024/2025', subjectIds: ['math','english','science','social','french','rme','pe'] },
  { classId: 'sss-1-sci', name: 'SSS 1 Science', level: 'SSS', teacherId: 'teacher-002', academicYear: '2024/2025', subjectIds: ['math','english','biology','chemistry','physics','f-math'] },
  { classId: 'sss-1-arts', name: 'SSS 1 Arts', level: 'SSS', teacherId: 'teacher-003', academicYear: '2024/2025', subjectIds: ['math','english','history','geography','literature','french'] },
  { classId: 'sss-2-sci', name: 'SSS 2 Science', level: 'SSS', teacherId: 'teacher-004', academicYear: '2024/2025', subjectIds: ['math','english','biology','chemistry','physics','f-math'] },
  { classId: 'sss-2-com', name: 'SSS 2 Commercial', level: 'SSS', teacherId: 'teacher-001', academicYear: '2024/2025', subjectIds: ['math','english','economics','commerce','accounts','typewriting'] },
  { classId: 'sss-3-sci', name: 'SSS 3 Science', level: 'SSS', teacherId: 'teacher-002', academicYear: '2024/2025', subjectIds: ['math','english','biology','chemistry','physics','f-math'] },
];

const SUBJECTS = [
  { subjectId: 'math',       name: 'Mathematics',             code: 'MATH',  division: 'Core',       level: 'Both' },
  { subjectId: 'english',    name: 'English Language',        code: 'ENG',   division: 'Core',       level: 'Both' },
  { subjectId: 'science',    name: 'Integrated Science',      code: 'ISCI',  division: 'Core',       level: 'JSS'  },
  { subjectId: 'social',     name: 'Social Studies',          code: 'SOCS',  division: 'Core',       level: 'JSS'  },
  { subjectId: 'french',     name: 'French',                  code: 'FRE',   division: 'Core',       level: 'Both' },
  { subjectId: 'rme',        name: 'Religious & Moral Edu',   code: 'RME',   division: 'Core',       level: 'JSS'  },
  { subjectId: 'pe',         name: 'Physical Education',      code: 'PE',    division: 'Core',       level: 'Both' },
  { subjectId: 'biology',    name: 'Biology',                 code: 'BIO',   division: 'Science',    level: 'SSS'  },
  { subjectId: 'chemistry',  name: 'Chemistry',               code: 'CHEM',  division: 'Science',    level: 'SSS'  },
  { subjectId: 'physics',    name: 'Physics',                 code: 'PHY',   division: 'Science',    level: 'SSS'  },
  { subjectId: 'f-math',     name: 'Further Mathematics',     code: 'FMAT',  division: 'Science',    level: 'SSS'  },
  { subjectId: 'history',    name: 'History',                 code: 'HIST',  division: 'Arts',       level: 'SSS'  },
  { subjectId: 'geography',  name: 'Geography',               code: 'GEO',   division: 'Arts',       level: 'SSS'  },
  { subjectId: 'literature', name: 'Literature in English',   code: 'LIT',   division: 'Arts',       level: 'SSS'  },
  { subjectId: 'economics',  name: 'Economics',               code: 'ECON',  division: 'Commercial', level: 'SSS'  },
  { subjectId: 'commerce',   name: 'Commerce',                code: 'COM',   division: 'Commercial', level: 'SSS'  },
  { subjectId: 'accounts',   name: 'Accounts',                code: 'ACC',   division: 'Commercial', level: 'SSS'  },
  { subjectId: 'typewriting', name: 'Typewriting',             code: 'TYPE',  division: 'Commercial', level: 'SSS'  },
];

const TEACHERS = [
  { uid: 'teacher-001', teacherId: 'TCH-001', fullName: 'Mr. Sorie Koroma',    gender: 'Male',   email: 'koroma@kbss.edu.sl',    phone: '+23276100001', qualification: 'B.Ed Mathematics',    joinDate: '2015-09-01', subjectIds: ['math','f-math'],   classIds: ['jss-1a','sss-2-com','sss-3-sci'] },
  { uid: 'teacher-002', teacherId: 'TCH-002', fullName: 'Mrs. Adama Kamara',   gender: 'Female', email: 'kamara@kbss.edu.sl',    phone: '+23276100002', qualification: 'B.A. English',        joinDate: '2016-09-01', subjectIds: ['english','literature'], classIds: ['jss-1b','sss-1-sci','sss-3-sci'] },
  { uid: 'teacher-003', teacherId: 'TCH-003', fullName: 'Mr. Foday Bangura',   gender: 'Male',   email: 'bangura@kbss.edu.sl',   phone: '+23276100003', qualification: 'B.Sc Chemistry',      joinDate: '2017-09-01', subjectIds: ['chemistry','science'], classIds: ['jss-2a','sss-1-arts'] },
  { uid: 'teacher-004', teacherId: 'TCH-004', fullName: 'Mrs. Hawa Fofanah',   gender: 'Female', email: 'fofanah@kbss.edu.sl',   phone: '+23276100004', qualification: 'B.Sc Biology',        joinDate: '2018-01-01', subjectIds: ['biology','science'],   classIds: ['jss-2b','sss-2-sci'] },
  { uid: 'teacher-005', teacherId: 'TCH-005', fullName: 'Mr. Ibrahim Conteh',  gender: 'Male',   email: 'conteh@kbss.edu.sl',    phone: '+23276100005', qualification: 'B.Sc Physics',        joinDate: '2019-09-01', subjectIds: ['physics'],             classIds: ['sss-1-sci','sss-2-sci'] },
  { uid: 'teacher-006', teacherId: 'TCH-006', fullName: 'Mrs. Fatmata Sesay',  gender: 'Female', email: 'sesay@kbss.edu.sl',     phone: '+23276100006', qualification: 'B.A. History',        joinDate: '2014-09-01', subjectIds: ['history','social'],    classIds: ['sss-1-arts'] },
  { uid: 'teacher-007', teacherId: 'TCH-007', fullName: 'Mr. Alieu Mansaray',  gender: 'Male',   email: 'mansaray@kbss.edu.sl',  phone: '+23276100007', qualification: 'B.A. Geography',      joinDate: '2020-01-01', subjectIds: ['geography'],            classIds: ['sss-1-arts','sss-2-com'] },
  { uid: 'teacher-008', teacherId: 'TCH-008', fullName: 'Mr. Mohamed Jalloh',  gender: 'Male',   email: 'jalloh@kbss.edu.sl',    phone: '+23276100008', qualification: 'B.Sc Economics',      joinDate: '2021-09-01', subjectIds: ['economics','accounts','commerce'], classIds: ['sss-2-com'] },
];

function generateStudents() {
  const students = [];
  CLASSES.forEach((cls, ci) => {
    const count = randInt(18, 32);
    for (let i = 0; i < count; i++) {
      const isMale = Math.random() > 0.48;
      const nameArr = isMale ? maleNames : femaleNames;
      const fullName = randEl(nameArr);
      const uid = `student-${cls.classId}-${String(i + 1).padStart(3, '0')}`;
      students.push({
        uid,
        studentId: `KBSS-${new Date().getFullYear()}-${String(students.length + 1).padStart(4, '0')}`,
        fullName,
        dateOfBirth: randDate(new Date('2005-01-01'), new Date('2012-12-31')),
        gender: isMale ? 'Male' : 'Female',
        classId: cls.classId,
        guardianName: `${isMale ? 'Mr.' : 'Mrs.'} ${randEl(guardianSurnames)}`,
        guardianPhone: `+2327${randInt(6, 9)}${randInt(100000, 999999)}`,
        guardianEmail: `guardian${students.length + 1}@gmail.com`,
        address: `${randEl(['12', '45', '7', '23', '89'])} ${randEl(['Main Street', 'School Road', 'Market Area', 'Mission Hill', 'Koindu Lane'])}, Koindu`,
        enrollmentYear: randInt(2020, 2024),
      });
    }
  });
  return students;
}

function generateResults(students) {
  const results = [];
  students.forEach((student) => {
    const cls = CLASSES.find((c) => c.classId === student.classId);
    if (!cls) return;
    const subjects = cls.subjectIds.slice(0, 6);
    subjects.forEach((subjectId) => {
      [1, 2, 3].forEach((term) => {
        const score = randInt(35, 98);
        results.push({
          studentId: student.uid,
          classId:   student.classId,
          subjectId,
          teacherId: cls.teacherId,
          term,
          academicYear: '2024/2025',
          score,
          grade:   scoreToGrade(score),
          remarks: score >= 75 ? 'Excellent' : score >= 60 ? 'Good' : score >= 50 ? 'Satisfactory' : 'Needs improvement',
        });
      });
    });
  });
  return results;
}

function generateAttendance(students) {
  const records = [];
  const today = new Date();
  students.slice(0, 60).forEach((student) => {
    for (let day = 1; day <= 30; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() - day);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const roll = Math.random();
      const status = roll < 0.88 ? 'present' : roll < 0.95 ? 'late' : 'absent';
      records.push({
        studentId: student.uid,
        classId:   student.classId,
        date:      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        status,
        recordedBy: CLASSES.find((c) => c.classId === student.classId)?.teacherId ?? 'teacher-001',
      });
    }
  });
  return records;
}

const ANNOUNCEMENTS = [
  { title: 'End of Term Examinations — Schedule Released', body: 'The timetable for End of Term 2 examinations has been released. All students are advised to collect their copies from the school office. Exams begin on Monday 15th April. Students must arrive at least 30 minutes before their scheduled exam. Good luck to all!', targetRoles: ['student', 'teacher'], isPinned: true },
  { title: 'WAEC Registration Deadline — SSS 3 Students', body: 'All SSS 3 students are reminded that the deadline for WAEC registration is 28th February 2025. Students who have not completed their registration should visit the school office immediately. Required documents: birth certificate, passport photo, and registration fee receipt.', targetRoles: ['student'], isPinned: true },
  { title: 'Parents & Teachers Meeting — Saturday 8th February', body: 'All parents and guardians are invited to the termly Parents & Teachers Meeting to be held on Saturday 8th February 2025 at 10:00 AM in the school hall. Topics include: Term 1 performance review, upcoming calendar, and school development updates.', targetRoles: ['student', 'teacher', 'admin'], isPinned: false },
  { title: 'Inter-House Sports Day — March 2025', body: 'The annual K.B.S.S Inter-House Sports Day is scheduled for Friday 14th March 2025. All students are expected to participate in their respective house events. Team captains should submit their final rosters to the Sports Master by 7th March.', targetRoles: ['student', 'teacher'], isPinned: false },
  { title: 'New Library Books Donated', body: 'The school is pleased to announce a generous donation of over 200 textbooks and reference materials from the Kailahun District Education Office. These books are now available in the school library for student use during school hours.', targetRoles: ['student', 'teacher'], isPinned: false },
  { title: 'School Fees — Second Term Reminder', body: 'Parents are kindly reminded that second term school fees are due by 31st January 2025. Students with outstanding fees will not be permitted to sit for mid-term assessments. Please visit the school bursar office for payment.', targetRoles: ['student'], isPinned: false },
];

const EVENTS = [
  { title: 'End of Term Examinations', description: 'Second term examinations for all classes', date: '2025-04-15', location: 'School Premises', category: 'Academic' },
  { title: 'Inter-House Sports Day', description: 'Annual sports competition between school houses', date: '2025-03-14', location: 'School Sports Field', category: 'Sports' },
  { title: 'Graduation Ceremony 2025', description: 'Graduation ceremony for SSS 3 class of 2025', date: '2025-07-18', location: 'School Hall', category: 'Graduation' },
  { title: 'Parents & Teachers Meeting', description: 'Termly PT meeting for all parents and guardians', date: '2025-02-08', location: 'School Hall', category: 'Academic' },
  { title: 'Cultural Day Celebration', description: 'Celebration of Sierra Leonean cultural heritage', date: '2025-04-27', location: 'School Compound', category: 'Cultural' },
];

const ADMISSIONS = [
  { fullName: 'Abubakarr Koroma', dateOfBirth: '2011-03-15', gender: 'Male', formerSchool: 'Koindu Primary School', preferredClass: 'JSS 1', guardianName: 'Mr. Alimamy Koroma', guardianPhone: '+23276234567', guardianEmail: 'alimamy.k@gmail.com', documentsURL: [], status: 'pending' },
  { fullName: 'Jenneh Sesay', dateOfBirth: '2010-08-22', gender: 'Female', formerSchool: 'Buedu RC Primary', preferredClass: 'JSS 2', guardianName: 'Mrs. Mariama Sesay', guardianPhone: '+23278345678', guardianEmail: '', documentsURL: [], status: 'approved' },
  { fullName: 'Mohamed Fofanah', dateOfBirth: '2009-12-10', gender: 'Male', formerSchool: 'Kailahun Town Secondary', preferredClass: 'SSS 1 (Science)', guardianName: 'Mr. Sorie Fofanah', guardianPhone: '+23276456789', guardianEmail: 'sfofanah@gmail.com', documentsURL: [], status: 'pending' },
  { fullName: 'Hawa Bangura', dateOfBirth: '2011-05-03', gender: 'Female', formerSchool: 'Pendembu Primary', preferredClass: 'JSS 1', guardianName: 'Mr. Ibrahim Bangura', guardianPhone: '+23277567890', guardianEmail: '', documentsURL: [], status: 'pending' },
  { fullName: 'Lansana Conteh', dateOfBirth: '2008-07-19', gender: 'Male', formerSchool: 'Daru Secondary School', preferredClass: 'SSS 1 (Arts)', guardianName: 'Mrs. Kadiatu Conteh', guardianPhone: '+23276678901', guardianEmail: '', documentsURL: [], status: 'rejected' },
];

const SETTINGS = {
  schoolName:          'Kissi Bendu Secondary School',
  motto:               'PRODEO ET PROPATRIA',
  address:             'Koindu Town, Kailahun District, Eastern Province, Sierra Leone',
  phone:               '+232 76 000 000',
  email:               'info@kbss.edu.sl',
  adminEmail:          'admin@kbss.edu.sl',
  currentAcademicYear: '2024/2025',
  currentTerm:         2,
  logoURL:             'assets/images/kbss-badge.png',
};

// ─── Seed function ────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱  K.B.S.S Firestore Seeder\n', '─'.repeat(40));

  // Settings
  console.log('⚙️  Seeding school settings...');
  await setDoc(doc(db, 'settings', 'schoolConfig'), SETTINGS);

  // Classes
  console.log('🏫  Seeding classes...');
  for (const cls of CLASSES) {
    await setDoc(doc(db, 'classes', cls.classId), cls);
  }

  // Subjects
  console.log('📚  Seeding subjects...');
  for (const subj of SUBJECTS) {
    await setDoc(doc(db, 'subjects', subj.subjectId), subj);
  }

  // Teachers
  console.log('👨‍🏫  Seeding teachers...');
  for (const teacher of TEACHERS) {
    await setDoc(doc(db, 'teachers', teacher.uid), teacher);
    await setDoc(doc(db, 'users', teacher.uid), {
      uid:          teacher.uid,
      email:        teacher.email,
      displayName:  teacher.fullName,
      role:         'teacher',
      photoURL:     '',
      createdAt:    Timestamp.now(),
      isActive:     true,
    });
  }

  // Students
  console.log('🎓  Generating and seeding students...');
  const students = generateStudents();
  let sCount = 0;
  for (const student of students) {
    await setDoc(doc(db, 'students', student.uid), student);
    await setDoc(doc(db, 'users', student.uid), {
      uid:         student.uid,
      email:       `${student.uid}@kbss.edu.sl`,
      displayName: student.fullName,
      role:        'student',
      photoURL:    '',
      createdAt:   Timestamp.now(),
      isActive:    true,
    });
    sCount++;
    if (sCount % 20 === 0) process.stdout.write(`\r   ${sCount}/${students.length} students...`);
  }
  console.log(`\n   ✓ ${sCount} students seeded`);

  // Admin user
  console.log('🔐  Seeding admin user...');
  await setDoc(doc(db, 'users', 'admin-001'), {
    uid: 'admin-001', email: 'admin@kbss.edu.sl', displayName: 'School Admin',
    role: 'admin', photoURL: '', createdAt: Timestamp.now(), isActive: true,
  });

  // Results
  console.log('📊  Generating and seeding results...');
  const results = generateResults(students);
  let rCount = 0;
  for (const result of results.slice(0, 500)) {
    await addDoc(collection(db, 'results'), { ...result, createdAt: Timestamp.now() });
    rCount++;
  }
  console.log(`   ✓ ${rCount} result records seeded`);

  // Attendance
  console.log('📋  Generating and seeding attendance...');
  const attendance = generateAttendance(students);
  for (const record of attendance.slice(0, 300)) {
    await addDoc(collection(db, 'attendance'), record);
  }
  console.log(`   ✓ ${Math.min(300, attendance.length)} attendance records seeded`);

  // Announcements
  console.log('📢  Seeding announcements...');
  for (const ann of ANNOUNCEMENTS) {
    await addDoc(collection(db, 'announcements'), {
      ...ann,
      authorId:   'admin-001',
      authorName: 'School Admin',
      createdAt:  Timestamp.now(),
    });
  }

  // Events
  console.log('🗓️  Seeding events...');
  for (const event of EVENTS) {
    await addDoc(collection(db, 'events'), event);
  }

  // Admissions
  console.log('📝  Seeding admissions...');
  for (const admission of ADMISSIONS) {
    await addDoc(collection(db, 'admissions'), { ...admission, submittedAt: Timestamp.now() });
  }

  console.log('\n' + '─'.repeat(40));
  console.log('✅  Seed complete!\n');
  console.log(`   Students:    ${students.length}`);
  console.log(`   Teachers:    ${TEACHERS.length}`);
  console.log(`   Classes:     ${CLASSES.length}`);
  console.log(`   Subjects:    ${SUBJECTS.length}`);
  console.log(`   Results:     ${Math.min(500, results.length)}`);
  console.log(`   Admissions:  ${ADMISSIONS.length}`);
  console.log('\n   Admin login: admin@kbss.edu.sl / Admin@KBSS2024');
  console.log('─'.repeat(40) + '\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err);
  process.exit(1);
});
