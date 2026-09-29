import type { Express } from 'express';
import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import createDOMPurify from 'dompurify';
import { createHash } from 'node:crypto';
import { safeFetch, publicUrl } from './network';

const cache = new Map<string, { expires: number; value: any }>();
const pending = new Map<string, Promise<any>>();
let cacheBytes = 0;
async function cached(key: string, task: () => Promise<any>) {
  const found = cache.get(key);
  if (found && found.expires > Date.now()) return found.value;
  if (pending.has(key)) return pending.get(key);
  const promise = task().then(value => {
    const bytes = Buffer.byteLength(JSON.stringify(value));
    if (bytes < 2 * 1024 * 1024) {
      if (found) { cacheBytes -= Buffer.byteLength(JSON.stringify(found.value)); cache.delete(key); }
      while (cache.size && (cache.size >= 100 || cacheBytes + bytes > 20 * 1024 * 1024)) {
        const first = cache.keys().next().value!;
        cacheBytes -= Buffer.byteLength(JSON.stringify(cache.get(first)!.value));
        cache.delete(first);
      }
      cache.set(key, { expires: Date.now() + 5 * 60000, value });
      cacheBytes += bytes;
    }
    return value;
  }).finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
}
export function sanitizeArticle(html: string, sourceUrl: string) {
  const dom = new JSDOM('');
  const purifier = createDOMPurify(dom.window as any);
  const clean = purifier.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['iframe', 'form', 'input', 'button', 'style', 'link', 'meta', 'base'],
    FORBID_ATTR: ['style', 'srcset'],
  });
  const document = new JSDOM(clean).window.document;
  for (const element of Array.from(document.querySelectorAll('[href], [src]'))) {
    for (const attribute of ['href', 'src']) {
      if (!element.hasAttribute(attribute)) continue;
      try { element.setAttribute(attribute, publicUrl(new URL(element.getAttribute(attribute)!, sourceUrl)).href); }
      catch { element.removeAttribute(attribute); }
    }
    if (element.tagName === 'A') {
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    }
    if (element.tagName === 'IMG') { element.setAttribute('loading', 'lazy'); element.setAttribute('referrerpolicy', 'no-referrer'); }
  }
  const output = document.body.innerHTML;
  document.defaultView?.close();
  dom.window.close();
  return output;
}
export function installReaderRoutes(app: Express) {
  app.get('/api/webview-proxy', (_req, res) => {
    res.status(410).json({ error: 'Embedded publisher pages are disabled. Open the original article at its source.' });
  });
  app.get('/api/rss-proxy', async (req, res) => {
    try {
      const url = publicUrl(String(req.query.url || '')).href;
      const result = await cached('feed:' + url, async () => {
        const response = await safeFetch(url, { headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' } });
        if (!response.ok) throw new Error('Publisher returned HTTP ' + response.status);
        const parser = new Parser({ customFields: { item: ['content:encoded', 'description', 'creator', 'dc:creator', 'pubDate'] } });
        const feed = await parser.parseString(await response.text());
        const seen = new Set<string>();
        const items = feed.items.slice(0, 500).map((item: any) => {
          let link = '';
          try { link = publicUrl(new URL(item.link, url)).href; } catch {}
          return {
            id: link || item.guid || createHash('sha256').update(url + (item.title || '') + (item.pubDate || '')).digest('hex'),
            title: item.title?.trim() || 'Untitled', link,
            description: item.description || item.contentSnippet || '',
            content: item['content:encoded'] || item.content || item.description || '',
            pubDate: item.isoDate || item.pubDate || '',
            creator: item.creator || item['dc:creator'] || feed.title || '',
          };
        }).filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
        items.sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0));
        return { items, fetchedAt: new Date().toISOString() };
      });
      res.json(result);
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : 'Feed unavailable.', isError: true });
    }
  });
  app.get('/api/fetch-article', async (req, res) => {
    try {
      const url = publicUrl(String(req.query.url || '')).href;
      const result = await cached('article:' + url, async () => {
        const response = await safeFetch(url, { headers: { Accept: 'text/html' } });
        if (!response.ok) throw new Error('Publisher returned HTTP ' + response.status);
        if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('The source is not an HTML article.');
        const dom = new JSDOM(await response.text(), { url });
        try {
          const article = new Readability(dom.window.document).parse();
          if (!article?.content) throw new Error('Could not extract this article. Open the source to read it.');
          return {
            title: article.title, content: article.textContent,
            html: sanitizeArticle(article.content, url), excerpt: article.excerpt,
            sourceUrl: url, readingMinutes: Math.max(1, Math.ceil((article.textContent || '').split(/\s+/).length / 220)),
          };
        } finally { dom.window.close(); }
      });
      res.json(result);
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : 'Article unavailable.', title: null, content: null, html: null });
    }
  });
}
