import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { performBackup, lastSyncTimeKey } from '../lib/useAutoSync';
import { auth } from '../lib/auth';

export const SyncStatusIndicator = () => {
  const [lastSync, setLastSync] = useState(() => localStorage.getItem(lastSyncTimeKey));
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(localStorage.getItem(lastSyncTimeKey));
    }, 5000);
    const status = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      setFeedbackMsg(message ? { text: message, isError: true } : null);
      setLastSync(localStorage.getItem(lastSyncTimeKey));
    };
    window.addEventListener('atlas-sync-status', status);
    return () => { clearInterval(interval); window.removeEventListener('atlas-sync-status', status); };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setFeedbackMsg(null);
    try {
      if (auth.currentUser) {
        await performBackup(undefined, false);
        setLastSync(localStorage.getItem(lastSyncTimeKey));
        setFeedbackMsg({ text: "Synced successfully!", isError: false });
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        setFeedbackMsg({ text: "Sign in with Google to enable sync.", isError: true });
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (e: any) {
      console.error(e);
      setFeedbackMsg({ text: e?.message || "Sync failed. Check console.", isError: true });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const formattedTime = lastSync 
    ? new Date(parseInt(lastSync)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'Never';

  return (
    <div className="flex bg-sidebar-hover shadow-sm border border-sidebar-border rounded-xl p-3 flex-col">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sidebar-text/40 uppercase tracking-widest text-[9px] font-black mb-1">Cloud Sync</span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-sidebar-text/80">
            {lastSync ? <Cloud className="w-3.5 h-3.5 text-accent" /> : <CloudOff className="w-3.5 h-3.5 text-red-400" />}
            <span>{lastSync ? `Synced: ${formattedTime}` : 'Not synced'}</span>
          </div>
        </div>
        <button 
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sidebar-bg hover:bg-accent/10 border border-sidebar-border hover:border-accent/30 rounded-lg text-[10px] uppercase font-bold text-sidebar-text/90 hover:text-accent transition-all disabled:opacity-50 group"
          title="Manual Cloud Backup"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : 'group-hover:-rotate-180 transition-transform duration-500'}`} />
          <span>Sync Now</span>
        </button>
      </div>
      {feedbackMsg && (
        <div className={`mt-2 text-[10px] font-medium px-2 py-1 rounded ${feedbackMsg.isError ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
          {feedbackMsg.text}
        </div>
      )}
    </div>
  );
};
