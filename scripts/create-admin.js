/**
 * KBSS Admin User Setup Script
 * Creates kbsswebadmin@gmail.com with admin role in Firebase Auth + Firestore.
 *
 * Usage:
 *   node scripts/create-admin.js
 *
 * This script uses the Firebase client SDK (no service account required).
 * The Cloud Function onUserCreated will automatically set the admin custom claim
 * because kbsswebadmin@gmail.com is in the ADMIN_EMAILS list.
 */

const { initializeApp }                         = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc }     = require('firebase/firestore');

const firebaseConfig = {
  apiKey:            'AIzaSyBQcwWs1DTPpiaU6K8wl65lA3LtIU6z5cw',
  authDomain:        'kbss-5a255.firebaseapp.com',
  projectId:         'kbss-5a255',
  storageBucket:     'kbss-5a255.firebasestorage.app',
  messagingSenderId: '295022249103',
  appId:             '1:295022249103:web:c3ea48f963a208c80ddcfa',
};

const ADMIN_EMAIL    = 'kbsswebadmin@gmail.com';
const ADMIN_PASSWORD = 'Kbweb2026%';
const ADMIN_NAME     = 'KBSS Web Admin';

async function main() {
  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  let uid;

  // Try to create the user; if they already exist, sign in instead
  try {
    console.log(`Creating admin account: ${ADMIN_EMAIL} ...`);
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    uid = cred.user.uid;
    await updateProfile(cred.user, { displayName: ADMIN_NAME });
    console.log(`✔ Auth account created (uid: ${uid})`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('Account already exists — signing in to verify...');
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      uid = cred.user.uid;
      console.log(`✔ Signed in (uid: ${uid})`);
    } else {
      throw err;
    }
  }

  // Write / overwrite the Firestore user document with admin role.
  // The Cloud Function onUserCreated also sets this, but this ensures consistency
  // even if the function hasn't run yet or if the account pre-existed.
  await setDoc(doc(db, 'users', uid), {
    uid,
    email:       ADMIN_EMAIL,
    displayName: ADMIN_NAME,
    role:        'admin',
    photoURL:    '',
    isActive:    true,
  }, { merge: true });

  console.log('✔ Firestore /users doc set with role: admin');
  console.log('');
  console.log('Done! Admin account is ready:');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  UID:      ${uid}`);
  console.log('');
  console.log('Note: The Firebase Cloud Function will set the admin custom claim');
  console.log('automatically. If it has not run yet, the app falls back to the');
  console.log('Firestore role field (already set to "admin" above).');

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
