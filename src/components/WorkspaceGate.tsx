import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Download, RefreshCw } from 'lucide-react';
import { auth, logout } from '../lib/auth';
import { readAccountCache } from '../lib/accountCache';
import { GoogleAuthButton } from './GoogleAuthButton';
import { openWorkspace, activateWorkspace, closeWorkspace, equalWorkspace, exportWorkspace } from '../lib/cloud';
const App = lazy(() => import('../App'));
type Choice = Awaited<ReturnType<typeof openWorkspace>>;

export function WorkspaceGate() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [choice, setChoice] = useState<Choice | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let sequence = 0;
    const unsubscribe = onAuthStateChanged(auth, async user => {
      const current = ++sequence;
      setReady(false); setChoice(null); setError(''); setSignedIn(!!user);
      if (!user) {
        // Preserve unclaimed legacy data until the first authenticated import.
        if (localStorage.getItem('atlas_workspace_owner')) await closeWorkspace();
        setLoading(false); return;
      }
      setLoading(true);
      try {
        const result = await openWorkspace(user.uid);
        if (cancelled || current !== sequence) return;
        const hasLocal = Object.keys(result.local).length > 0;
        if (hasLocal && !equalWorkspace(result.local, result.remote)) {
          setChoice(result);
        } else {
          activateWorkspace(user.uid, result.remote, result.remote);
          setReady(true);
        }
      } catch (e) {
        if (!cancelled && current === sequence) setError(e instanceof Error ? e.message : 'Could not load progress.');
      } finally { if (!cancelled && current === sequence) setLoading(false); }
    });
    const conflict = () => setAttempt(value => value + 1);
    window.addEventListener('atlas-workspace-conflict', conflict);
    return () => { cancelled = true; sequence++; unsubscribe(); window.removeEventListener('atlas-workspace-conflict', conflict); };
  }, [attempt]);
  if (ready) return <Suspense fallback={<p className="p-6">Loading workspace...</p>}><App /></Suspense>;
  const choose = (local: boolean) => {
    if (!choice) return;
    const data = local ? choice.local : choice.remote;
    // Export the displaced copy before replacing local data.
    exportWorkspace(local ? choice.remote : choice.local);
    activateWorkspace(choice.uid, data, choice.remote);
    setChoice(null); setReady(true);
  };
  return <main className="min-h-screen bg-panel text-main flex items-center justify-center p-6">
    <div className="w-full max-w-lg space-y-5">
      <h1 className="text-3xl font-bold">UPSC Atlas</h1>
      {loading ? <p role="status">Loading your progress...</p> : choice ? <>
        <h2 className="text-xl font-semibold">Choose your workspace</h2>
        <p>Cloud: {Object.keys(choice.remote).length} saved sections. This device: {Object.keys(choice.local).length} saved sections.</p>
        <p>The other copy will be downloaded before you continue.</p>
        <div className="flex flex-wrap gap-3">
          <button className="border rounded-md p-3" onClick={() => choose(false)}>Use cloud progress</button>
          <button className="border rounded-md p-3" onClick={() => choose(true)}>Import this device's progress</button>
        </div>
      </> : error ? <>
        <p role="alert">{error}</p>
        <button className="border rounded-md p-3 inline-flex gap-2" onClick={() => setAttempt(x => x + 1)}><RefreshCw size={18}/>Retry</button>
        <button className="border rounded-md p-3 inline-flex gap-2" onClick={async () => {
          if (auth.currentUser) exportWorkspace(await readAccountCache(auth.currentUser.uid));
        }}><Download size={18}/>Export local copy</button>
        <button className="border rounded-md p-3" onClick={() => void logout()}>Sign out</button>
      </> : !signedIn ? <GoogleAuthButton /> : null}
    </div>
  </main>;
}
