import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAddress, publicUrl, googleUrl } from '../server/network';
import { sanitizeArticle } from '../server/reader';
import { validateWorkspace } from '../shared/workspace';

test('rejects private, mapped and reserved network destinations', () => {
  for (const address of ['127.0.0.1', '10.2.3.4', '169.254.169.254', '192.168.1.1', '::1', '::ffff:127.0.0.1', 'fc00::1', '224.0.0.1']) {
    assert.equal(publicAddress(address), false, address);
  }
  assert.equal(publicAddress('1.1.1.1'), true);
  for (const url of ['http://example.com', 'https://localhost', 'https://127.1', 'https://[::1]', 'https://user:pass@example.com', 'https://example.com:8443']) {
    assert.throws(() => publicUrl(url), undefined, url);
  }
});
test('Google proxy validates host and operation, not a substring', () => {
  for (const url of [
    'https://example.com/.googleapis.com/',
    'https://www.googleapis.com.evil.example/drive/v3/files',
    'https://www.googleapis.com/compute/v1/projects',
    'https://www.googleapis.com/drive/v3/permissions',
  ]) assert.throws(() => googleUrl(url));
  assert.equal(googleUrl('https://www.googleapis.com/upload/drive/v3/files/123?uploadType=multipart').hostname, 'www.googleapis.com');
  assert.doesNotThrow(() => googleUrl('https://www.googleapis.com/calendar/v3/calendars/primary/events'));
});
test('article extraction removes active content and unsafe links', () => {
  const result = sanitizeArticle('<script>steal()</script><iframe src="https://evil.example"></iframe><form><input></form><img onerror="steal()" src="/image.jpg"><a href="javascript:steal()">bad</a><a href="/story">good</a>', 'https://example.com/news');
  assert.doesNotMatch(result, /<script|<iframe|<form|onerror|javascript:/i);
  assert.match(result, /https:\/\/example.com\/image.jpg/);
  assert.match(result, /noopener noreferrer/);
});
test('workspace import cannot inject OAuth tokens or unknown keys', () => {
  assert.deepEqual(validateWorkspace({ google_access_token: 'secret', upsc_saved_notes: '[]', unknown: 'x' }), { upsc_saved_notes: '[]' });
  assert.throws(() => validateWorkspace({ upsc_saved_notes: {} }));
  assert.throws(() => validateWorkspace([]));
});
