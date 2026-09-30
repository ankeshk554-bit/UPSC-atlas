import { useEffect, useState } from 'react';
import { saveWorkspace, lastSyncTimeKey } from './cloud';
export { lastSyncTimeKey } from './cloud';
export const performBackup = async (_token?: string, _silent = true) => saveWorkspace();
export const useAutoSync = () => {
  const [lastSync, setLastSync] = useState(() => localStorage.getItem(lastSyncTimeKey));
  useEffect(() => {
    const sync = () => saveWorkspace().then(() => {
      setLastSync(localStorage.getItem(lastSyncTimeKey));
      window.dispatchEvent(new CustomEvent('atlas-sync-status', { detail: '' }));
    }).catch(error => window.dispatchEvent(new CustomEvent('atlas-sync-status', { detail: error.message })));
    const timer = setInterval(sync, 15000);
    const onVisibility = () => { if (document.visibilityState === 'hidden') void sync(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  return lastSync;
};
