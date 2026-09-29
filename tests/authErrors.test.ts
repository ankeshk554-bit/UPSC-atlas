import test from 'node:test';
import assert from 'node:assert/strict';
import { signInErrorMessage } from '../shared/authErrors';

test('unauthorized domains report the hostname and configuration fix', () => {
  const message = signInErrorMessage({ code: 'auth/unauthorized-domain' }, '127.0.0.1');
  assert.match(message, /127\.0\.0\.1/);
  assert.match(message, /Authorized domains/);
  assert.match(message, /Opening another tab will not fix/);
});
test('popup, network and provider errors have distinct recovery messages', () => {
  for (const [code, expected] of [
    ['auth/popup-blocked', /Allow popups/],
    ['auth/popup-closed-by-user', /cancelled/],
    ['auth/cancelled-popup-request', /cancelled/],
    ['auth/network-request-failed', /internet connection/],
    ['auth/operation-not-allowed', /enable Google/],
  ] as const) assert.match(signInErrorMessage({ code }, 'localhost'), expected);
  for (const error of [null, undefined, 'secret', { message: 'secret' }]) {
    assert.doesNotMatch(signInErrorMessage(error, 'localhost'), /secret/);
  }
});
