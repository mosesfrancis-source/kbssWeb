import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const db = admin.firestore();
const storage = admin.storage();

interface ResultsPDFRequest {
  studentId: string;
  term: 1 | 2 | 3;
  academicYear: string;
}

/**
 * Callable — generates a student result sheet PDF and returns a download URL.
 */
export const generateResultsPDF = functions.https.onCall(
  async (data: ResultsPDFRequest, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.');
    }

    const { studentId, term, academicYear } = data;
    const callerRole = context.auth.token['role'];
    const callerUid = context.auth.uid;

    // Students can only generate their own reports
    if (
      callerRole === 'student' &&
      callerUid !== studentId
    ) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied.');
    }

    try {
      // Fetch student data
      const studentDoc = await db.collection('students').doc(studentId).get();
      if (!studentDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Student not found.');
      }
      const student = studentDoc.data()!;

      // Fetch class data
      const classDoc = await db.collection('classes').doc(student.classId).get();
      const classData = classDoc.data() ?? {};

      // Fetch results for this student/term/year
      const resultsSnap = await db
        .collection('results')
        .where('studentId', '==', studentId)
        .where('term', '==', term)
        .where('academicYear', '==', academicYear)
        .get();

      const results: Array<{
        subject: string;
        score: number;
        grade: string;
        remarks: string;
      }> = [];

      await Promise.all(
        resultsSnap.docs.map(async (doc) => {
          const r = doc.data();
          const subjectDoc = await db.collection('subjects').doc(r.subjectId).get();
          results.push({
            subject: subjectDoc.data()?.name ?? r.subjectId,
            score: r.score,
            grade: r.grade,
            remarks: r.remarks ?? '',
          });
        })
      );

      // Sort by subject name
      results.sort((a, b) => a.subject.localeCompare(b.subject));

      // Calculate aggregate
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const average = results.length > 0 ? (totalScore / results.length).toFixed(1) : '0';

      // Generate PDF
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header
      doc.setFillColor(21, 101, 192);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('KISSI BENDU SECONDARY SCHOOL', 105, 14, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Koindu Town, Kailahun District, Sierra Leone', 105, 22, { align: 'center' });
      doc.text('STUDENT ACADEMIC RESULT SHEET', 105, 32, { align: 'center' });

      // Student info
      doc.setTextColor(26, 35, 126);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT INFORMATION', 14, 52);
      doc.setDrawColor(21, 101, 192);
      doc.line(14, 54, 196, 54);

      doc.setTextColor(55, 71, 79);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${student.fullName}`, 14, 62);
      doc.text(`Student ID: ${student.studentId}`, 14, 69);
      doc.text(`Class: ${classData.name ?? student.classId}`, 14, 76);
      doc.text(`Academic Year: ${academicYear}`, 110, 62);
      doc.text(`Term: ${term}`, 110, 69);
      doc.text(`Gender: ${student.gender}`, 110, 76);

      // Results table
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 35, 126);
      doc.text('ACADEMIC RESULTS', 14, 90);
      doc.line(14, 92, 196, 92);

      const tableData = results.map((r, i) => [
        i + 1,
        r.subject,
        r.score,
        r.grade,
        r.remarks,
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).autoTable({
        startY: 96,
        head: [['#', 'Subject', 'Score (%)', 'Grade', 'Remarks']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [232, 240, 254] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          2: { halign: 'center', cellWidth: 25 },
          3: { halign: 'center', cellWidth: 20 },
        },
      });

      // Summary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFillColor(232, 240, 254);
      doc.rect(14, finalY, 182, 22, 'F');
      doc.setTextColor(26, 35, 126);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Total Score: ${totalScore}`, 20, finalY + 8);
      doc.text(`Average: ${average}%`, 80, finalY + 8);
      doc.text(`Subjects: ${results.length}`, 140, finalY + 8);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(120, 144, 156);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated by K.B.S.S Academic Portal — ${new Date().toLocaleDateString()}`,
        105,
        285,
        { align: 'center' }
      );

      // Save to Firebase Storage
      const pdfBytes = doc.output('arraybuffer');
      const fileName = `reports/${studentId}_term${term}_${academicYear.replace('/', '-')}.pdf`;
      const file = storage.bucket().file(fileName);

      await file.save(Buffer.from(pdfBytes), {
        metadata: { contentType: 'application/pdf' },
      });

      const [downloadURL] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { downloadURL, fileName };
    } catch (err) {
      functions.logger.error('generateResultsPDF error', err);
      throw new functions.https.HttpsError('internal', 'Failed to generate PDF.');
    }
  }
);
