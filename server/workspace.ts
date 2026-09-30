import type { Express } from 'express';
import { database } from './platform';
import { validateWorkspace } from '../shared/workspace';

export function installWorkspaceRoutes(app: Express, getDatabase = database) {
  app.get('/api/workspace', async (_req, res) => {
    try {
      const ref = getDatabase().doc('users/' + res.locals.uid + '/workspace/current');
      const result = await getDatabase().runTransaction(async tx => {
        const snapshot = await tx.get(ref);
        const manifest = snapshot.data();
        if (!manifest) return { revision: 0, data: {} };
        const chunks = await tx.getAll(...Array.from({ length: manifest.chunks }, (_, i) =>
          ref.collection('chunks').doc(String(i))));
        return { revision: manifest.revision, data: JSON.parse(chunks.map(c => c.data()?.text || '').join('')) };
      });
      res.json(result);
    } catch { res.status(503).json({ error: 'Cloud progress is unavailable. Your local copy has been preserved.' }); }
  });
  app.put('/api/workspace', async (req, res) => {
    try {
      const data = validateWorkspace(req.body.data);
      const expected = req.body.revision;
      if (!Number.isSafeInteger(expected) || expected < 0) {
        res.status(400).json({ error: 'A valid workspace revision is required.' }); return;
      }
      const json = JSON.stringify(data);
      if (Buffer.byteLength(json) > 4 * 1024 * 1024) {
        res.status(413).json({ error: 'Workspace exceeds 4 MB. Export older content before continuing.' }); return;
      }
      const characters = Array.from(json);
      const parts = Array.from({ length: Math.ceil(characters.length / 64000) }, (_, i) =>
        characters.slice(i * 64000, (i + 1) * 64000).join(''));
      const ref = getDatabase().doc('users/' + res.locals.uid + '/workspace/current');
      const revision = await getDatabase().runTransaction(async tx => {
        const old = await tx.get(ref);
        const previous = old.data();
        if ((previous?.revision || 0) !== expected) throw new Error('CONFLICT');
        const next = expected + 1;
        // Five rotating snapshots retain recent versions without unbounded storage growth.
        const history = ref.parent.doc('history-' + (next % 5));
        const oldHistory = await tx.get(history);
        tx.set(history, { revision: next, chunks: parts.length, updatedAtMs: Date.now() });
        tx.set(ref, { revision: next, chunks: parts.length, updatedAtMs: Date.now() });
        parts.forEach((text, i) => {
          tx.set(ref.collection('chunks').doc(String(i)), { text });
          tx.set(history.collection('chunks').doc(String(i)), { text });
        });
        for (let i = parts.length; i < (previous?.chunks || 0); i++) tx.delete(ref.collection('chunks').doc(String(i)));
        for (let i = parts.length; i < (oldHistory.data()?.chunks || 0); i++) tx.delete(history.collection('chunks').doc(String(i)));
        return next;
      });
      res.json({ revision });
    } catch (error) {
      const conflict = error instanceof Error && error.message === 'CONFLICT';
      res.status(conflict ? 409 : 503).json({ error: conflict
        ? 'Progress changed on another device. Resolve the conflict before syncing.'
        : 'Could not save progress. Your local copy has been preserved.' });
    }
  });
}
