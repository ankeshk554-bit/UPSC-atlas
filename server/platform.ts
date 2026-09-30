import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { RequestHandler } from 'express';

const context = new AsyncLocalStorage<string>();
export function database() {
  if (!process.env.FIREBASE_PROJECT_ID) throw new Error('FIREBASE_PROJECT_ID is required');
  const app = getApps()[0] || initializeApp({
    credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID,
  });
  return getFirestore(app, process.env.FIRESTORE_DATABASE_ID || '(default)');
}
export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    database();
    const token = req.header('X-Firebase-Token');
    if (!token) { res.status(401).json({ error: 'Sign in with Google to continue.' }); return; }
    const identity = await getAuth().verifyIdToken(token, true);
    if (!identity.email_verified || identity.firebase.sign_in_provider !== 'google.com') {
      res.status(403).json({ error: 'A verified Google account is required.' }); return;
    }
    res.locals.uid = identity.uid;
    context.run(identity.uid, next);
  } catch {
    res.status(401).json({ error: 'Your session could not be verified. Please sign in again.' });
  }
};

export class UsageError extends Error {}
export async function reserveGeneration() {
  const uid = context.getStore();
  if (!uid) throw new UsageError('Authentication required.');
  return reserveForUser(uid);
}
export async function reserveForUser(uid: string, db = database()) {
  const day = new Date().toISOString().slice(0, 10);
  const userRef = db.doc('users/' + uid + '/usage/' + day);
  const globalRef = db.doc('platformUsage/' + day);
  const planRef = db.doc('entitlements/' + uid);
  const lease = randomUUID();
  const reserve = Number(process.env.AI_RESERVATION_MICRO_USD || 1000000);
  const globalLimit = Number(process.env.AI_DAILY_BUDGET_MICRO_USD || 10000000);
  if (!Number.isSafeInteger(reserve) || reserve <= 0 || !Number.isSafeInteger(globalLimit) || globalLimit <= 0) {
    throw new UsageError('AI budget configuration is invalid.');
  }
  await db.runTransaction(async tx => {
    const [u, g, p] = await Promise.all([tx.get(userRef), tx.get(globalRef), tx.get(planRef)]);
    const user = u.data() || {};
    const global = g.data() || {};
    const plan = p.data();
    const paid = plan?.status === 'active' && plan?.expiresAtMs > Date.now();
    const limit = paid ? 100 : 5;
    const leases = Object.fromEntries(Object.entries(user.leases || {}).filter(([, end]) => Number(end) > Date.now()));
    if (Object.keys(leases).length >= 2) throw new UsageError('Two AI requests are already running. Please wait.');
    if ((user.calls || 0) >= limit) throw new UsageError('Your daily AI allowance has been reached.');
    if ((global.reservedMicroUsd || 0) + reserve > globalLimit) throw new UsageError('The daily AI budget has been reached.');
    tx.set(userRef, { ...user, calls: (user.calls || 0) + 1, leases: { ...leases, [lease]: Date.now() + 180000 } });
    tx.set(globalRef, { reservedMicroUsd: (global.reservedMicroUsd || 0) + reserve }, { merge: true });
  });
  return async (usage?: { prompt_tokens?: number; completion_tokens?: number }) => {
    await db.runTransaction(async tx => {
      const snapshot = await tx.get(userRef);
      const data = snapshot.data() || {};
      const leases = { ...data.leases };
      delete leases[lease];
      tx.set(userRef, {
        ...data, leases,
        inputTokens: (data.inputTokens || 0) + (usage?.prompt_tokens || 0),
        outputTokens: (data.outputTokens || 0) + (usage?.completion_tokens || 0),
      });
    });
  };
}
