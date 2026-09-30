import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { installWorkspaceRoutes } from '../server/workspace';
import { authenticate } from '../server/platform';

function memoryDatabase() {
  const values = new Map<string, any>();
  const doc = (path: string): any => ({
    path,
    parent: { doc: (id: string) => doc(path.split('/').slice(0, -1).join('/') + '/' + id) },
    collection: (name: string) => ({ doc: (id: string) => doc(path + '/' + name + '/' + id) }),
  });
  const get = async (ref: any) => ({ data: () => values.get(ref.path) });
  return { doc, runTransaction: async (body: any) => {
    const writes: (() => void)[] = [];
    const result = await body({
      get, getAll: (...refs: any[]) => Promise.all(refs.map(get)),
      set: (ref: any, data: any) => writes.push(() => values.set(ref.path, data)),
      delete: (ref: any) => writes.push(() => values.delete(ref.path)),
    });
    writes.forEach(write => write());
    return result;
  } };
}
test('workspace routes isolate users, reject stale writes, and retain large notes', async () => {
  const app = express();
  const db = memoryDatabase();
  app.use(express.json({ limit: '6mb' }));
  // Only this test fixture injects an identity; production uses Firebase verification.
  app.use((req, res, next) => { res.locals.uid = req.header('test-user'); next(); });
  installWorkspaceRoutes(app, () => db as any);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = (server.address() as any).port;
  const call = async (uid: string, data?: any) => fetch('http://127.0.0.1:' + port + '/api/workspace', {
    method: data ? 'PUT' : 'GET',
    headers: { 'test-user': uid, 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  try {
    const notes = JSON.stringify([{ id: '1', content: 'Article 21 '.repeat(30000) }]);
    assert.equal((await call('alice', { revision: 0, data: { upsc_saved_notes: notes } })).status, 200);
    assert.deepEqual(await (await call('bob')).json(), { revision: 0, data: {} });
    assert.equal((await (await call('alice')).json()).data.upsc_saved_notes, notes);
    assert.equal((await call('alice', { revision: 0, data: {} })).status, 409);
    const edited = notes.replaceAll('Article 21', 'Article 32');
    assert.equal((await call('alice', { revision: 1, data: { upsc_saved_notes: edited } })).status, 200);
    assert.equal((await (await call('alice')).json()).data.upsc_saved_notes, edited);
    assert.equal((await call('alice', { revision: -1, data: {} })).status, 400);
    assert.equal((await call('alice', { revision: 2, data: { upsc_saved_notes: 'x'.repeat(5 * 1024 * 1024) } })).status, 413);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
test('anonymous API requests are rejected without starting AI work', async () => {
  const app = express();
  app.use(authenticate);
  app.get('/api/chat', (_req, res) => res.json({ shouldNeverRun: true }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const response = await fetch('http://127.0.0.1:' + (server.address() as any).port + '/api/chat');
    assert.equal(response.status, 401);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});

 
test('AI allowances enforce concurrency, per-user limits and a shared budget', async () => {
  const { reserveForUser } = await import('../server/platform');
  const db = memoryDatabase();
  const first = await reserveForUser('alice', db as any);
  const second = await reserveForUser('alice', db as any);
  await assert.rejects(reserveForUser('alice', db as any), /already running/);
  await first({ prompt_tokens: 12, completion_tokens: 8 });
  await second();
  for (let i = 0; i < 3; i++) await (await reserveForUser('alice', db as any))();
  await assert.rejects(reserveForUser('alice', db as any), /daily AI allowance/);
  for (let i = 0; i < 5; i++) await (await reserveForUser('bob', db as any))();
  await assert.rejects(reserveForUser('carol', db as any), /daily AI budget/);
});
