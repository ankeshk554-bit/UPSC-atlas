import test from 'node:test';
import assert from 'node:assert/strict';
import { handleCloudflareRequest } from '../shared/cloudflareProxy';
import { requireApiJson } from '../shared/apiResponse';

const ASSETS = { fetch: async () => new Response('frontend') };
const base = 'https://upsc-atlas.ankeshk554.workers.dev';

test('Cloudflare serves the SPA but never falls back to HTML for API paths', async () => {
  assert.equal(await (await handleCloudflareRequest(new Request(base + '/notes'), { ASSETS })).text(), 'frontend');
  for (const pathname of ['/api', '/api/health', '/api/workspace']) {
    const response = await handleCloudflareRequest(new Request(base + pathname), { ASSETS });
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /API_ORIGIN/);
  }
});

test('invalid backend origins cannot receive authentication tokens', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not fetch'); });
  for (const API_ORIGIN of ['http://backend.example', base, 'https://user:password@backend.example', 'https://backend.example/api', 'https://backend.example?x=1', 'not-a-url']) {
    const response = await handleCloudflareRequest(new Request(base + '/api/workspace'), { ASSETS, API_ORIGIN });
    assert.equal(response.status, 503);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('Cloudflare forwards API path, query, method, body and authentication and disables caching', async t => {
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), 'https://backend.example/api/workspace?device=1');
    assert.equal(init?.method, 'PUT');
    assert.equal(init?.redirect, 'manual');
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('x-firebase-token'), 'firebase-test-token');
    assert.equal(headers.get('authorization'), 'Bearer google-test-token');
    assert.equal(headers.get('cookie'), null);
    assert.equal(headers.get('x-forwarded-host'), null);
    assert.deepEqual(JSON.parse(await new Response(init?.body).text()), { revision: 0, data: {} });
    return Response.json({ revision: 1 }, { headers: { 'Cache-Control': 'public', 'Set-Cookie': 'backend=1' } });
  });
  const request = new Request(base + '/api/workspace?device=1', {
    method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Firebase-Token': 'firebase-test-token', Authorization: 'Bearer google-test-token', Cookie: 'browser=1', 'X-Forwarded-Host': 'evil.example' },
    body: JSON.stringify({ revision: 0, data: {} }),
  });
  const response = await handleCloudflareRequest(request, { ASSETS, API_ORIGIN: 'https://backend.example' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { revision: 1 });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('set-cookie'), null);
});

test('backend errors survive proxying; redirects, HTML and connection failures produce JSON errors', async t => {
  const mock = t.mock.method(globalThis, 'fetch');
  const request = () => new Request(base + '/api/workspace');
  const env = { ASSETS, API_ORIGIN: 'https://backend.example' };
  mock.mock.mockImplementation(async () => Response.json({ error: 'Session expired' }, { status: 401 }));
  let response = await handleCloudflareRequest(request(), env);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, 'Session expired');
  for (const upstream of [new Response(null, { status: 302, headers: { Location: 'https://evil.example' } }), new Response('<html/>', { headers: { 'Content-Type': 'text/html' } })]) {
    mock.mock.mockImplementation(async () => upstream);
    response = await handleCloudflareRequest(request(), env);
    assert.equal(response.status, 502);
    assert.equal(typeof (await response.json()).error, 'string');
  }
  mock.mock.mockImplementation(async () => { throw new Error('Connection failed'); });
  response = await handleCloudflareRequest(request(), env);
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /could not be reached/);
});

test('Google media and empty delete responses are preserved', async t => {
  const mock = t.mock.method(globalThis, 'fetch');
  for (const upstream of [new Response('markdown notes', { headers: { 'Content-Type': 'text/markdown' } }), new Response(null, { status: 204 })]) {
    mock.mock.mockImplementation(async () => upstream);
    const response = await handleCloudflareRequest(new Request(base + '/api/google-proxy?url=media'), { ASSETS, API_ORIGIN: 'https://backend.example' });
    assert.equal(response.status, upstream.status);
    assert.equal(await response.text(), upstream.status === 204 ? '' : 'markdown notes');
  }
});

test('browser reports static HTML and malformed JSON as deployment errors without hiding server errors', async () => {
  for (const input of [new Response('<html/>', { headers: { 'Content-Type': 'text/html' } }), new Response('{broken', { headers: { 'Content-Type': 'application/json' } })]) {
    const response = await requireApiJson(input);
    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /Node backend/);
  }
  const original = Response.json({ error: 'Cloud progress is unavailable.' }, { status: 503 });
  const response = await requireApiJson(original);
  assert.equal(response, original);
  assert.equal((await response.json()).error, 'Cloud progress is unavailable.');
});
