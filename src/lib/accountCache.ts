import type { Workspace } from '../../shared/workspace';
function openCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('upsc-private-workspaces', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('accounts');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
export async function readAccountCache(uid: string): Promise<Workspace> {
  const db = await openCache();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('accounts').objectStore('accounts').get(uid);
      request.onsuccess = () => resolve(request.result || {});
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function writeAccountCache(uid: string, data: Workspace): Promise<void> {
  const db = await openCache();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('accounts', 'readwrite');
      transaction.objectStore('accounts').put(data, uid);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Could not preserve local progress.'));
    });
  } finally { db.close(); }
}
