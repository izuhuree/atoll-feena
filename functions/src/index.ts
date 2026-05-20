import express from 'express';
import cors from 'cors';
import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

setGlobalOptions({ region: 'us-central1', memory: '512MiB', timeoutSeconds: 300 });
admin.initializeApp();
const db = getFirestore(admin.app(), 'atollfeena');
const bucket = admin.storage().bucket();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

type AuthedRequest = express.Request & { uid?: string; roles?: string[] };
app.get(['/health', '/api/health'], (_req, res) => res.json({ ok: true, app: 'AtollFeeNa', time: new Date().toISOString() }));

app.use(['/api/kb', '/api/admin'], async (req: AuthedRequest, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Firebase ID token required' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    const adminSnap = await db.collection('admins').doc(decoded.uid).get();
    req.roles = Array.isArray(adminSnap.data()?.roles) ? adminSnap.data()?.roles : [];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
});

app.use('/api/kb', (req: AuthedRequest, res, next) => {
  if (req.roles?.some((r) => ['admin', 'kb_uploader', 'kb_reviewer'].includes(r))) return next();
  res.status(403).json({ error: 'Knowledge Base role required' });
});

app.use('/api/admin', (req: AuthedRequest, res, next) => {
  if (req.roles?.includes('admin')) return next();
  res.status(403).json({ error: 'Admin role required' });
});

app.post('/api/kb/documents/initiate', async (req: AuthedRequest, res) => {
  const { fileName, contentType, size } = req.body;
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/webp', 'image/tiff'];
  if (!fileName || !allowed.includes(contentType) || Number(size) > 20 * 1024 * 1024) return res.status(400).json({ error: 'Unsupported file or size' });
  const id = randomUUID();
  const path = `knowledge-documents/${req.uid}/${id}/1/${fileName}`;
  const [uploadUrl] = await bucket.file(path).getSignedUrl({ action: 'write', expires: Date.now() + 15 * 60 * 1000, contentType });
  await db.collection('knowledge_documents').doc(id).set({ id, name: fileName, contentType, size, path, status: 'uploading', uploadedBy: req.uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  await audit(req.uid, 'document_initiated', { id, fileName });
  res.json({ id, uploadUrl, path });
});

app.post('/api/kb/documents/:id/upload-complete', async (req: AuthedRequest, res) => {
  const jobId = randomUUID();
  await db.collection('knowledge_documents').doc(req.params.id).set({ status: 'queued', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  await db.collection('knowledge_processing_jobs').doc(jobId).set({ id: jobId, documentId: req.params.id, status: 'queued', createdAt: admin.firestore.FieldValue.serverTimestamp() });
  await audit(req.uid, 'document_upload_complete', { id: req.params.id, jobId });
  res.json({ ok: true, jobId });
});

app.get('/api/kb/documents', async (_req, res) => {
  const snap = await db.collection('knowledge_documents').orderBy('createdAt', 'desc').limit(50).get();
  res.json(snap.docs.map((d) => d.data()));
});

app.get('/api/kb/documents/:id', async (req, res) => getDoc('knowledge_documents', req.params.id, res));
app.get('/api/kb/documents/:id/status', async (req, res) => getDoc('knowledge_documents', req.params.id, res));
app.post('/api/kb/documents/:id/reprocess', async (req: AuthedRequest, res) => {
  const jobId = randomUUID();
  await db.collection('knowledge_processing_jobs').doc(jobId).set({ id: jobId, documentId: req.params.id, status: 'queued', reprocess: true, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  await db.collection('knowledge_documents').doc(req.params.id).set({ status: 'queued', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  await audit(req.uid, 'document_reprocess', { id: req.params.id, jobId });
  res.json({ ok: true, jobId });
});
app.get('/api/kb/jobs/:id', async (req, res) => getDoc('knowledge_processing_jobs', req.params.id, res));

app.post('/api/kb/search', async (req, res) => {
  const q = String(req.body.query || '').toLowerCase();
  const snap = await db.collection('knowledge_document_chunks').limit(100).get();
  res.json(snap.docs.map((d) => d.data()).filter((d) => String(d.text || '').toLowerCase().includes(q)).slice(0, 10));
});

app.get('/api/kb/proposed-updates', async (_req, res) => {
  const snap = await db.collection('proposed_data_updates').where('status', '==', 'pending').limit(50).get();
  res.json(snap.docs.map((d) => d.data()));
});
app.post('/api/kb/proposed-updates/:id/approve', async (req: AuthedRequest, res) => review(req, res, 'approved'));
app.post('/api/kb/proposed-updates/:id/reject', async (req: AuthedRequest, res) => review(req, res, 'rejected'));

app.get('/api/kb/ai-access/status', (_req, res) => res.json({ personalKeyConfigured: false, dailyLimit: 50 }));
app.post('/api/kb/ai-access/personal-key', async (req: AuthedRequest, res) => { await audit(req.uid, 'personal_key_changed', {}); res.json({ ok: true }); });
app.delete('/api/kb/ai-access/personal-key', async (req: AuthedRequest, res) => { await audit(req.uid, 'personal_key_deleted', {}); res.json({ ok: true }); });
app.get('/api/kb/admin/shared-key/status', (_req, res) => res.json({ sharedKeyConfigured: Boolean(process.env.GEMINI_API_KEY), dailyLimit: 500 }));
app.post('/api/kb/admin/shared-key', async (req: AuthedRequest, res) => { await audit(req.uid, 'shared_key_changed', {}); res.json({ ok: true }); });

app.post('/api/admin/sync-reference-data', async (req: AuthedRequest, res) => {
  const [sites, life] = await Promise.all([readJson('reference-data/dive-sites.json'), readJson('reference-data/marine-life.json')]);
  if (!Array.isArray(sites) || !Array.isArray(life)) return res.status(400).json({ error: 'Reference files must be JSON arrays' });
  await batchWrite('diveSites', sites);
  await batchWrite('marineLife', life);
  await audit(req.uid, 'reference_data_sync', { sites: sites.length, marineLife: life.length });
  res.json({ ok: true, sites: sites.length, marineLife: life.length });
});

async function getDoc(collection: string, id: string, res: express.Response) {
  const snap = await db.collection(collection).doc(id).get();
  if (!snap.exists) return res.status(404).json({ error: 'Not found' });
  res.json(snap.data());
}
async function review(req: AuthedRequest, res: express.Response, status: 'approved' | 'rejected') {
  await db.collection('proposed_data_updates').doc(req.params.id).set({ status, reviewedBy: req.uid, reviewedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  await db.collection('review_decisions').add({ updateId: req.params.id, status, reviewerId: req.uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  await audit(req.uid, `proposed_update_${status}`, { id: req.params.id });
  res.json({ ok: true });
}
async function readJson(path: string) {
  const [buf] = await bucket.file(path).download();
  return JSON.parse(buf.toString('utf8'));
}
async function batchWrite(collection: string, rows: Record<string, unknown>[]) {
  for (let i = 0; i < rows.length; i += 450) {
    const batch = db.batch();
    rows.slice(i, i + 450).forEach((row) => {
      const id = String(row.id || randomUUID());
      batch.set(db.collection(collection).doc(id), { ...row, id, createdBy: 'system', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    });
    await batch.commit();
  }
}
async function audit(uid: string | undefined, action: string, data: Record<string, unknown>) {
  await db.collection('knowledge_audit_events').add({ uid, action, data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
}

export const api = onRequest(app);
