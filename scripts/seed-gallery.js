/**
 * KBSS Gallery Seed Script
 * Adds real school photos to the Firestore gallery collection.
 *
 * Usage:
 *   node scripts/seed-gallery.js
 */

const { initializeApp }     = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey:            'AIzaSyBQcwWs1DTPpiaU6K8wl65lA3LtIU6z5cw',
  authDomain:        'kbss-5a255.firebaseapp.com',
  projectId:         'kbss-5a255',
  storageBucket:     'kbss-5a255.firebasestorage.app',
  messagingSenderId: '295022249103',
  appId:             '1:295022249103:web:c3ea48f963a208c80ddcfa',
};

const GALLERY_ITEMS = [
  {
    imageURL: 'assets/images/school-hero.jpg',
    caption:  'Students at Morning Assembly',
    category: 'General',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
  {
    imageURL: 'assets/images/gallery-award-1.jpg',
    caption:  'Prize Giving Day — Award Presentation',
    category: 'Events',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
  {
    imageURL: 'assets/images/gallery-award-2.jpg',
    caption:  'Principal Presenting Award to Outstanding Student',
    category: 'Events',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
  {
    imageURL: 'assets/images/gallery-award-3.jpg',
    caption:  'Student Recognition Ceremony',
    category: 'Events',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
  {
    imageURL: 'assets/images/gallery-award-4.jpg',
    caption:  'Prize Giving — Student & Guardian with School Officials',
    category: 'Events',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
  {
    imageURL: 'assets/images/gallery-ict-1.jpg',
    caption:  'Students in ICT Computer Lab',
    category: 'Academics',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
  {
    imageURL: 'assets/images/gallery-ict-2.jpg',
    caption:  'ICT Training Session',
    category: 'Academics',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
  {
    imageURL: 'assets/images/gallery-ict-3.jpg',
    caption:  'Modern Computer Lab with Projector',
    category: 'Academics',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
  {
    imageURL: 'assets/images/gallery-ict-4.jpg',
    caption:  'K.B.S.S ICT Lab — Equipped for the Future',
    category: 'Academics',
    uploadedAt: Timestamp.now(),
    uploadedBy: 'admin',
  },
];

async function main() {
  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  // Sign in with admin credentials
  console.log('Signing in...');
  await signInWithEmailAndPassword(auth, 'kbsswebadmin@gmail.com', 'Kbweb2026%');
  console.log('✔ Signed in');

  const col = collection(db, 'gallery');

  for (const item of GALLERY_ITEMS) {
    // Skip if an item with this imageURL already exists
    const existing = await getDocs(query(col, where('imageURL', '==', item.imageURL)));
    if (!existing.empty) {
      console.log(`  skip (exists): ${item.caption}`);
      continue;
    }
    await addDoc(col, item);
    console.log(`  ✔ added: ${item.caption}`);
  }

  console.log('\nGallery seed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
