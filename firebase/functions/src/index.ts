import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

export { onUserCreated, setUserRole } from './auth';
export { sendAnnouncementEmail, onAdmissionSubmitted } from './notifications';
export { generateResultsPDF } from './reports';

// Health check callable
export const ping = functions.https.onCall(async () => {
  return { status: 'ok', timestamp: admin.firestore.FieldValue.serverTimestamp() };
});
