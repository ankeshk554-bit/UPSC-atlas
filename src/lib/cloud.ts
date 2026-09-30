import { apiFetch } from './api';
import { readAccountCache, writeAccountCache } from './accountCache';
import { WORKSPACE_KEYS, validateWorkspace, type Workspace } from '../../shared/workspace';

const OWNER = 'atlas_workspace_owner';
const LEGACY = 'atlas_legacy_workspace';
let revision = 0;
let committed = '';
let paused = true;
let pending: Promise<void> | null = null;
let session = 0;
export const lastSyncTimeKey = 'atlas_last_cloud_sync';

export function snapshot(): Workspace {
  return Object.fromEntries(WORKSPACE_KEYS.map(key => [key, localStorage.getItem(key)]).filter(([, value]) => value !== null)) as Workspace;
}
const canonical = (data: Workspace) => JSON.stringify(Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b))));
function clearActive() {
  for (const key of Object.keys(localStorage)) {
    if (/^(upsc_|app_|rss_reader_|library_profile_)/.test(key)) localStorage.removeItem(key);
  }
  localStorage.removeItem(lastSyncTimeKey);
}
export async function closeWorkspace() {
  const generation = ++session;
  paused = true;
  const owner = localStorage.getItem(OWNER);
  if (owner) await writeAccountCache(owner, snapshot());
  if (generation !== session) return generation;
  clearActive();
  localStorage.removeItem(OWNER);
  return generation;
}
export async function openWorkspace(uid: string) {
  const existingOwner = localStorage.getItem(OWNER);
  if (!existingOwner) {
    const legacy = snapshot();
    const previousLegacy = localStorage.getItem(LEGACY);
    const unclaimed = Object.keys(legacy).length ? legacy : validateWorkspace(JSON.parse(previousLegacy || '{}'));
    if (Object.keys(unclaimed).length) {
      await writeAccountCache(uid, unclaimed);
      localStorage.removeItem(LEGACY);
    }
  }
  const generation = await closeWorkspace();
  if (generation !== session) throw new Error('Account changed. Please retry.');
  const local = validateWorkspace(await readAccountCache(uid));
  const response = await apiFetch('/api/workspace');
  if (!response.ok) throw new Error((await response.json()).error);
  const remote = await response.json();
  if (generation !== session) throw new Error('Account changed. Please retry.');
  revision = remote.revision;
  return { uid, remote: validateWorkspace(remote.data), local };
}
export function activateWorkspace(uid: string, data: Workspace, remote: Workspace) {
  clearActive();
  Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, value));
  localStorage.setItem(OWNER, uid);
  committed = canonical(remote);
  paused = false;
}
export async function saveWorkspace() {
  if (paused) throw new Error('Resolve the workspace conflict before syncing.');
  if (pending) return pending;
  const generation = session;
  const data = snapshot();
  const json = canonical(data);
  if (json === committed) return;
  pending = (async () => {
    const response = await apiFetch('/api/workspace', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revision, data }),
    });
    if (generation !== session) return;
    if (response.status === 409) {
      paused = true;
      window.dispatchEvent(new Event('atlas-workspace-conflict'));
    }
    if (!response.ok) throw new Error((await response.json()).error);
    revision = (await response.json()).revision;
    committed = json;
    const owner = localStorage.getItem(OWNER);
    if (owner) await writeAccountCache(owner, data);
    localStorage.setItem(lastSyncTimeKey, String(Date.now()));
  })().finally(() => { pending = null; });
  return pending;
}
export function equalWorkspace(a: Workspace, b: Workspace) { return canonical(a) === canonical(b); }
export function exportWorkspace(data = snapshot()) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'UPSC-workspace-' + new Date().toISOString().slice(0, 10) + '.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
