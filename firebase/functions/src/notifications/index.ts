import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

const db = admin.firestore();

function getTransporter() {
  const config = functions.config();
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email?.user ?? process.env.EMAIL_USER ?? '',
      pass: config.email?.pass ?? process.env.EMAIL_PASS ?? '',
    },
  });
}

/**
 * Firestore trigger — sends email to all teachers/students when a new
 * announcement is created.
 */
export const sendAnnouncementEmail = functions.firestore
  .document('announcements/{announcementId}')
  .onCreate(async (snap) => {
    const announcement = snap.data();
    if (!announcement) return;

    const { title, body, targetRoles } = announcement;

    try {
      // Fetch users with matching roles
      const usersSnap = await db.collection('users').get();
      const emails: string[] = [];

      usersSnap.forEach((doc) => {
        const user = doc.data();
        if (
          user.email &&
          user.isActive &&
          (targetRoles as string[]).includes(user.role)
        ) {
          emails.push(user.email);
        }
      });

      if (emails.length === 0) return;

      const transporter = getTransporter();
      await transporter.sendMail({
        from: '"K.B.S.S Portal" <notifications@kbss.edu.sl>',
        bcc: emails,
        subject: `[K.B.S.S] ${title}`,
        html: `
          <div style="font-family: DM Sans, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #1565C0; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Kissi Bendu Secondary School</h1>
              <p style="color: #90CAF9; margin: 4px 0 0;">Koindu Town, Kailahun District, Sierra Leone</p>
            </div>
            <div style="background: #f8faff; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e3e8f0;">
              <h2 style="color: #1A237E; margin: 0 0 16px;">${title}</h2>
              <div style="color: #37474F; line-height: 1.6;">${body}</div>
              <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e3e8f0;">
                <p style="color: #78909C; font-size: 12px; margin: 0;">
                  This email was sent from the K.B.S.S Academic Portal.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        `,
      });

      functions.logger.info(
        `Announcement email sent to ${emails.length} recipients`
      );
    } catch (err) {
      functions.logger.error('sendAnnouncementEmail error', err);
    }
  });

/**
 * Firestore trigger — notifies admin when a new admission application is submitted.
 */
export const onAdmissionSubmitted = functions.firestore
  .document('admissions/{applicationId}')
  .onCreate(async (snap) => {
    const application = snap.data();
    if (!application) return;

    try {
      // Get admin email from settings
      const settingsDoc = await db
        .collection('settings')
        .doc('schoolConfig')
        .get();
      const adminEmail =
        settingsDoc.data()?.adminEmail ??
        functions.config().email?.admin ??
        process.env.EMAIL_ADMIN ??
        '';

      if (!adminEmail) return;

      const transporter = getTransporter();
      await transporter.sendMail({
        from: '"K.B.S.S Portal" <notifications@kbss.edu.sl>',
        to: adminEmail,
        subject: `[K.B.S.S] New Admission Application — ${application.fullName}`,
        html: `
          <div style="font-family: DM Sans, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #1565C0; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">New Admission Application</h1>
            </div>
            <div style="background: #f8faff; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e3e8f0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #78909C; width: 40%;">Applicant:</td>
                    <td style="color: #1A237E; font-weight: 600;">${application.fullName}</td></tr>
                <tr><td style="padding: 8px 0; color: #78909C;">Preferred Class:</td>
                    <td style="color: #37474F;">${application.preferredClass}</td></tr>
                <tr><td style="padding: 8px 0; color: #78909C;">Guardian:</td>
                    <td style="color: #37474F;">${application.guardianName}</td></tr>
                <tr><td style="padding: 8px 0; color: #78909C;">Contact:</td>
                    <td style="color: #37474F;">${application.guardianPhone}</td></tr>
                <tr><td style="padding: 8px 0; color: #78909C;">Former School:</td>
                    <td style="color: #37474F;">${application.formerSchool}</td></tr>
              </table>
              <a href="https://kbss-5a255.web.app/admin/admissions"
                 style="display: inline-block; margin-top: 24px; padding: 12px 24px;
                        background: #1565C0; color: white; border-radius: 6px;
                        text-decoration: none; font-weight: 600;">
                Review Application
              </a>
            </div>
          </div>
        `,
      });

      // Create notification doc for all admins
      const adminsSnap = await db
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const batch = db.batch();
      adminsSnap.forEach((doc) => {
        const notifRef = db.collection('notifications').doc();
        batch.set(notifRef, {
          userId: doc.id,
          title: 'New Admission Application',
          message: `${application.fullName} has submitted an application for ${application.preferredClass}.`,
          type: 'admission',
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          link: '/admin/admissions',
        });
      });
      await batch.commit();

      functions.logger.info(
        `Admission notification sent for ${application.fullName}`
      );
    } catch (err) {
      functions.logger.error('onAdmissionSubmitted error', err);
    }
  });
