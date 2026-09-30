import { auth } from './auth';
import { cachedArticle, cacheArticle } from './readerCache';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : String(input), window.location.origin);
  if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) return fetch(input, init);
  await auth.authStateReady();
  if (!auth.currentUser) return new Response(JSON.stringify({ error: 'Sign in with Google to continue.' }), {
    status: 401, headers: { 'Content-Type': 'application/json' },
  });
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  const user = auth.currentUser;
  const articleUrl = url.pathname === '/api/fetch-article' ? url.searchParams.get('url') : null;
  const fallback = () => {
    const cached = articleUrl && cachedArticle(articleUrl);
    return cached ? new Response(JSON.stringify({ ...cached, offline: true }), { headers: { 'Content-Type': 'application/json' } }) : null;
  };
  try {
    headers.set('X-Firebase-Token', await user.getIdToken());
    const response = await fetch(input, { ...init, headers });
    if (auth.currentUser?.uid !== user.uid) throw new Error('Account changed.');
    if (articleUrl && response.ok) {
      const data = await response.clone().json();
      cacheArticle(articleUrl, data);
    } else if (articleUrl && response.status >= 500) {
      return fallback() || response;
    }
    return response;
  } catch (error) {
    if (auth.currentUser?.uid === user.uid) {
      const cached = fallback();
      if (cached) return cached;
    }
    throw error;
  }
}
