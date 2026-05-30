const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBQcwWs1DTPpiaU6K8wl65lA3LtIU6z5cw',
  authDomain: 'kbss-5a255.firebaseapp.com',
  projectId: 'kbss-5a255',
  storageBucket: 'kbss-5a255.firebasestorage.app',
  messagingSenderId: '295022249103',
  appId: '1:295022249103:web:c3ea48f963a208c80ddcfa',
};

const SPORTS_ITEMS = [
  { imageURL: 'assets/images/gallery-sports-1.jpg', caption: 'Sports Day — House Teams March Past', category: 'Sports', uploadedAt: Timestamp.now(), uploadedBy: 'admin' },
  { imageURL: 'assets/images/gallery-sports-2.jpg', caption: 'Sports Day — Students Ready for Competition', category: 'Sports', uploadedAt: Timestamp.now(), uploadedBy: 'admin' },
  { imageURL: 'assets/images/gallery-sports-3.jpg', caption: 'Sports Day — Event Venue', category: 'Sports', uploadedAt: Timestamp.now(), uploadedBy: 'admin' },
  { imageURL: 'assets/images/gallery-sports-4.jpg', caption: 'Sports Day — Inter-House Athletics', category: 'Sports', uploadedAt: Timestamp.now(), uploadedBy: 'admin' },
];

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  await signInWithEmailAndPassword(auth, 'kbsswebadmin@gmail.com', 'Kbweb2026%');
  const col = collection(db, 'gallery');
  for (const item of SPORTS_ITEMS) {
    const existing = await getDocs(query(col, where('imageURL', '==', item.imageURL)));
    if (!existing.empty) { console.log('  skip:', item.caption); continue; }
    await addDoc(col, item);
    console.log('  added:', item.caption);
  }
  console.log('Sports gallery seeded!');
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
