import admin from 'firebase-admin';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

const SWIPE_API_BASE = process.env.SWIPE_API_BASE || 'https://merchant-api.swipeapp.dev';
const SWIPE_CLIENT_ID = process.env.SWIPE_CLIENT_ID || '';
const SWIPE_CLIENT_SECRET = process.env.SWIPE_CLIENT_SECRET || '';
const SWIPE_AUTH_SCOPE = process.env.SWIPE_AUTH_SCOPE || '';
const APP_URL = process.env.APP_URL || 'https://atollfeena.web.app';

const PRO_PRICES = {
  'individual-diver-pro': 150,
  'dive-centre-pro': 750,
};

function assertSwipeConfigured() {
  if (!SWIPE_CLIENT_ID || !SWIPE_CLIENT_SECRET) {
    throw new HttpsError('failed-precondition', 'BML Swipe credentials are not configured.');
  }
}

function requireUid(request) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in before upgrading to Pro.');
  return uid;
}

function normalizeTier(tier) {
  if (!Object.hasOwn(PRO_PRICES, tier)) {
    throw new HttpsError('invalid-argument', 'Unsupported Pro tier.');
  }
  return tier;
}

async function fetchSwipeToken() {
  assertSwipeConfigured();
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: SWIPE_CLIENT_ID,
    client_secret: SWIPE_CLIENT_SECRET,
  });
  if (SWIPE_AUTH_SCOPE) body.set('scope', SWIPE_AUTH_SCOPE);

  const response = await fetch(`${SWIPE_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new HttpsError('unavailable', 'Unable to authenticate with BML Swipe.');
  }
  return payload.access_token;
}

function paymentPath(path) {
  return `${SWIPE_API_BASE}/api/v1${path}`;
}

async function createSwipeLink({ token, tier, amountMvr }) {
  const body = {
    amount: amountMvr,
    currency: 'MVR',
    type: 'LINK',
    description: `AtollFeeNa ${tier === 'dive-centre-pro' ? 'Dive Centre Pro' : 'Individual Diver Pro'}`,
  };

  const response = await fetch(paymentPath('/payments'), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpsError('unavailable', payload.message || 'Unable to create BML Swipe payment.');
  }
  return payload;
}

function extractPaymentId(payload) {
  return payload.id || payload.paymentId || payload.payment_id || payload.data?.id || payload.data?.paymentId;
}

function extractPaymentUrl(payload) {
  return payload.url || payload.paymentUrl || payload.payment_url || payload.redirectUrl || payload.data?.url || payload.data?.payment_url || payload.data?.paymentUrl;
}

function extractReference(payload) {
  return payload.reference || payload.data?.reference;
}

function normalizeSwipeStatus(status) {
  const value = String(status || '').toLowerCase();
  if (['paid', 'success', 'successful', 'completed', 'captured'].includes(value)) return 'successful';
  if (['cancelled', 'canceled'].includes(value)) return 'cancelled';
  if (['failed', 'expired', 'declined'].includes(value)) return 'failed';
  return 'pending';
}

export const createSwipeProPayment = onCall({ region: 'us-central1' }, async (request) => {
  const uid = requireUid(request);
  const tier = normalizeTier(request.data?.tier);
  const amountMvr = PRO_PRICES[tier];
  const now = new Date().toISOString();
  const transactionRef = db.collection('paymentTransactions').doc();
  const localReference = `atollfeena-${uid.slice(0, 10)}-${transactionRef.id}`;

  const token = await fetchSwipeToken();
  const swipePayment = await createSwipeLink({
    token,
    tier,
    amountMvr,
  });
  const externalPaymentId = extractPaymentId(swipePayment);
  const externalPaymentUrl = extractPaymentUrl(swipePayment);
  const externalReference = extractReference(swipePayment) || localReference;

  await transactionRef.set({
    id: transactionRef.id,
    userId: uid,
    provider: 'bml-swipe',
    tier,
    status: 'pending',
    amountMvr,
    currency: 'MVR',
    paymentMode: 'payment-link',
    externalReference,
    localReference,
    externalPaymentId: externalPaymentId || null,
    externalPaymentUrl: externalPaymentUrl || null,
    externalStatus: swipePayment.status || null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    transactionId: transactionRef.id,
    externalReference,
    paymentUrl: externalPaymentUrl,
  };
});

export const verifySwipeProPayment = onCall({ region: 'us-central1' }, async (request) => {
  const uid = requireUid(request);
  const transactionId = String(request.data?.transactionId || '');
  if (!transactionId) throw new HttpsError('invalid-argument', 'Missing transaction ID.');

  const transactionRef = db.collection('paymentTransactions').doc(transactionId);
  const transactionSnap = await transactionRef.get();
  if (!transactionSnap.exists) throw new HttpsError('not-found', 'Payment transaction not found.');

  const transaction = transactionSnap.data();
  if (transaction.userId !== uid) throw new HttpsError('permission-denied', 'This payment belongs to another user.');
  if (!transaction.externalPaymentId) throw new HttpsError('failed-precondition', 'Payment ID is not available yet.');

  const token = await fetchSwipeToken();
  const response = await fetch(paymentPath(`/payments/${transaction.externalPaymentId}`), {
    headers: { authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpsError('unavailable', 'Unable to verify BML Swipe payment.');

  const nextStatus = normalizeSwipeStatus(payload.status || payload.data?.status);
  const now = new Date().toISOString();
  await transactionRef.set({
    status: nextStatus,
    externalStatus: payload.status || payload.data?.status || null,
    verifiedAt: nextStatus === 'successful' ? now : transaction.verifiedAt || null,
    verifiedBy: nextStatus === 'successful' ? 'bml-swipe-status-check' : transaction.verifiedBy || null,
    updatedAt: now,
  }, { merge: true });

  if (nextStatus === 'successful') {
    await db.collection('proSubscriptions').doc(uid).set({
      id: uid,
      userId: uid,
      tier: transaction.tier,
      status: 'active',
      provider: 'bml-swipe',
      sourceTransactionId: transactionId,
      currentPeriodStart: now,
      verifiedAt: now,
      verifiedBy: 'bml-swipe-status-check',
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
  }

  return { status: nextStatus };
});
