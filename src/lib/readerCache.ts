const KEY = 'upsc_offline_articles';
const LIMIT = 1024 * 1024;
function read(): Record<string, any> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
export function cachedArticle(url: string) { return read()[url]; }
export function cacheArticle(url: string, article: any) {
  if (!article?.html || !article?.content) return;
  const data = read();
  delete data[url];
  data[url] = { ...article, savedAt: Date.now() };
  while (Object.keys(data).length > 20 || new Blob([JSON.stringify(data)]).size > LIMIT) {
    delete data[Object.keys(data)[0]];
  }
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* Reading still works when local storage is full. */ }
}
