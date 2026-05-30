const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBQcwWs1DTPpiaU6K8wl65lA3LtIU6z5cw',
  authDomain: 'kbss-5a255.firebaseapp.com',
  projectId: 'kbss-5a255',
  storageBucket: 'kbss-5a255.firebasestorage.app',
  messagingSenderId: '295022249103',
  appId: '1:295022249103:web:c3ea48f963a208c80ddcfa',
};

const BODY = 'The ongoing West African Senior School Certificate Examination (WASSCE) at Kissi Bendu Secondary School (KBSS) continues to progress smoothly and peacefully. Candidates have been sitting their examinations in a well-organized environment, with school authorities, teachers, and invigilators working together to ensure that all examination procedures are properly followed.\n\n'
  + 'Reports from the school indicate that students have remained disciplined, punctual, and focused throughout the examination period. Teachers have expressed satisfaction with the commitment and determination shown by the candidates as they work toward achieving excellent results.\n\n'
  + 'While the WASSCE examinations are underway, students in other classes continue their academic activities as normal. Lessons and school programs have been adjusted to provide a conducive environment for the examination candidates while ensuring that learning continues for all students.\n\n'
  + 'Meanwhile, preparations for the upcoming Basic Education Certificate Examination (BECE) are also ongoing. JSS3 pupils are actively engaged in revision classes, practice exercises, and additional lessons aimed at strengthening their readiness for the national examination.\n\n'
  + 'The administration of Kissi Bendu Secondary School has thanked parents, teachers, and community stakeholders for their continued support during this important period. The school remains committed to maintaining high academic standards and providing students with the best possible environment for success.\n\n'
  + 'Written by: Moses Francis | Kissi Bendu Secondary School News Desk | Koindu Town, Kailahun District, Sierra Leone';

const article = {
  title:      'WASSCE Examinations Progressing Smoothly at K.B.S.S',
  body:       BODY,
  authorId:   'vDtQXHnLalgw12OgqXhHP0iCOSf2',
  authorName: 'Moses Francis',
  targetRoles: ['student', 'teacher', 'admin'],
  createdAt: Timestamp.now(),
  isPinned: true,
  category: 'Academic',
  location: 'Koindu Town, Kailahun District',
};

async function main() {
  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  await signInWithEmailAndPassword(auth, 'kbsswebadmin@gmail.com', 'Kbweb2026%');
  console.log('Signed in.');

  const ref = await addDoc(collection(db, 'announcements'), article);
  console.log('News article added! ID:', ref.id);
  console.log('Title:', article.title);
  console.log('Pinned: true (will show as featured on home + news pages)');
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
