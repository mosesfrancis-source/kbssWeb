import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

/**
 * Triggered on new user creation — sets custom role claim and creates /users doc.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const role = 'student'; // default role; admin upgrades via setUserRole

  try {
    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { role });

    // Create /users/{uid} document
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      role,
      photoURL: user.photoURL ?? '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });

    functions.logger.info(`User ${user.uid} created with role: ${role}`);
  } catch (err) {
    functions.logger.error('onUserCreated error', err);
  }
});

/**
 * Callable — admin changes a user's role.
 * Requires caller to have role === 'admin' in their token.
 */
export const setUserRole = functions.https.onCall(
  async (
    data: { uid: string; role: 'student' | 'teacher' | 'admin' },
    context
  ) => {
    // Auth check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated.'
      );
    }
    if (context.auth.token['role'] !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be an admin to change roles.'
      );
    }

    const { uid, role } = data;
    if (!uid || !['student', 'teacher', 'admin'].includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid uid or role.'
      );
    }

    try {
      await admin.auth().setCustomUserClaims(uid, { role });
      await db.collection('users').doc(uid).update({ role });

      functions.logger.info(`Role for ${uid} updated to ${role}`);
      return { success: true };
    } catch (err) {
      functions.logger.error('setUserRole error', err);
      throw new functions.https.HttpsError('internal', 'Failed to set role.');
    }
  }
);
