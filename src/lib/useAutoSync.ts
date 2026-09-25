import { useEffect, useState } from 'react';
import { getAccessToken } from './auth';

const LOCAL_STORAGE_KEYS = [
  'upsc_chat_sessions',
  'upsc_chat_history',
  'upsc_saved_evals',
  'upsc_saved_notes',
  'upsc_saved_pyqs',
  'upsc_sessions_count',
  'upsc_syllabus_v2',
  'upsc_affairs_v2',
  'upsc_rss_feeds',
  'upsc_rss_ai_summaries',
  'upsc_saved_rss_notes',
  'upsc_read_rss_items',
  'upsc_saved_blueprints',
  'app_theme'
];

let isSyncing = false;
let pendingSync = false;
export const lastSyncTimeKey = 'upsc_last_sync_time';

// Cache to prevent duplicate folder creation across re-renders/sync cycles
const driveFolderCache: Record<string, string> = {};
const syncedNotesCache: Record<string, string> = {}; // noteId -> hash

async function safeParseJson(res: Response): Promise<any> {
    const text = await res.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch (err: any) {
        console.error("JSON parsing failed. Response text prefix:", text.substring(0, 300));
        throw new Error(`Parse failed: Response is not valid JSON. Status: ${res.status}. Preview: ${text.substring(0, 100)}`);
    }
}

async function getOrCreateDriveFolder(token: string, folderName: string, parentId?: string): Promise<string> {
    const sanitizedName = folderName.replace(/'/g, "\\'").trim();
    
    // Check-before-create logic to prevent duplicate folders
    const qParams = [
        `name='${sanitizedName}'`,
        `mimeType='application/vnd.google-apps.folder'`,
        `trashed=false`
    ];
    if (parentId) {
        qParams.push(`'${parentId}' in parents`);
    } else {
        qParams.push(`'root' in parents`);
    }
    
    const q = qParams.join(' and ');
    const targetUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`;
    const searchRes = await fetch(`/api/google-proxy?url=${encodeURIComponent(targetUrl)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (searchRes.ok) {
        const data = await safeParseJson(searchRes);
        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        }
    }
    
    // Create new folder
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createRes = await fetch(`/api/google-proxy?url=${encodeURIComponent(createUrl)}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined
        })
    });
    
    if (!createRes.ok) {
        throw new Error("Failed to create folder " + folderName);
    }
    
    const data = await safeParseJson(createRes);
    return data.id;
}

async function syncNotesToFolders(token: string) {
    const rawNotes = localStorage.getItem('upsc_saved_notes');
    if (!rawNotes) return;
    try {
        const notes = JSON.parse(rawNotes);
        if (!Array.isArray(notes) || notes.length === 0) return;
        
        // Root hierarchical folder tracking
        const rootCacheKey = "UPSC_Mains_Vault";
        if (!driveFolderCache[rootCacheKey]) {
            driveFolderCache[rootCacheKey] = await getOrCreateDriveFolder(token, "UPSC Mains Vault");
        }
        const rootId = driveFolderCache[rootCacheKey];
        
        for (const note of notes) {
            // Hash note to avoid re-uploading if unmodified
            const noteHash = `${note.id}-${note.content?.length || 0}`;
            if (syncedNotesCache[note.id] === noteHash) continue;
            
            const folderPath = note.folderPath && note.folderPath.length > 0 ? note.folderPath : [note.subject || "Uncategorized"];
            
            let currentParent = rootId;
            let currentPath = "UPSC_Mains_Vault";
            
            // Strictly follow the hierarchy
            for (const folder of folderPath) {
                const safeFolder = (folder || "Unknown").trim().replace(/[\/\\]/g, '-');
                currentPath += "/" + safeFolder;
                
                if (!driveFolderCache[currentPath]) {
                    driveFolderCache[currentPath] = await getOrCreateDriveFolder(token, safeFolder, currentParent);
                }
                currentParent = driveFolderCache[currentPath];
            }
            
            // Upload Note Markdown inside the target folder
            const noteFileName = `${(note.topic || "Note").replace(/[\/\\]/g, '-')} - ${note.id}.md`;
            
            // Check if note markdown exists
            const fileQ = `name='${noteFileName.replace(/'/g, "\\'")}' and '${currentParent}' in parents and trashed=false`;
            const targetUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fileQ)}&fields=files(id)`;
            const fileSearchRes = await fetch(`/api/google-proxy?url=${encodeURIComponent(targetUrl)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let existingFileId = null;
            if (fileSearchRes.ok) {
                const fData = await safeParseJson(fileSearchRes);
                if (fData.files && fData.files.length > 0) {
                    existingFileId = fData.files[0].id;
                }
            }
            
            const metadata = {
                name: noteFileName,
                mimeType: 'text/markdown',
                parents: existingFileId ? undefined : [currentParent]
            };

            const boundary = 'foo_bar_baz';
            const delimiter = `\r\n--${boundary}\r\n`;
            const closeDelimiter = `\r\n--${boundary}--`;

            const multipartRequestBody =
                `--${boundary}\r\n` +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
                (note.content || "") +
                closeDelimiter;

            const rawUrl = existingFileId 
                ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
                : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            const url = `/api/google-proxy?url=${encodeURIComponent(rawUrl)}`;
                
            const uploadRes = await fetch(url, {
                method: existingFileId ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': `multipart/related; boundary=${boundary}`
                },
                body: multipartRequestBody
            });
            
            if (uploadRes.ok) {
                syncedNotesCache[note.id] = noteHash; // Update cache
            }
        }
    } catch (e) {
        console.error("Error syncing notes to structured folders:", e);
    }
}

export const performBackup = async (token: string, silent = true) => {
  if (isSyncing) {
    if (silent) pendingSync = true;
    return;
  }
  isSyncing = true;
  pendingSync = false;

  try {
    const dataToBackup: Record<string, string | null> = {};
    LOCAL_STORAGE_KEYS.forEach(key => {
      dataToBackup[key] = localStorage.getItem(key);
    });

    const backupString = JSON.stringify(dataToBackup, null, 2);
    
    const q = "name = 'UPSC_App_AutoBackup.json' and trashed=false";
    const targetUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&spaces=drive`;
    const searchRes = await fetch(`/api/google-proxy?url=${encodeURIComponent(targetUrl)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    let fileIdToUpdate = null;
    if (!searchRes.ok) {
      if (searchRes.status === 401) {
        localStorage.removeItem("google_access_token");
        console.warn("Auto-sync: Session expired. User needs to sign in again.");
      } else {
        const errorText = await searchRes.text().catch(() => "");
        console.warn(`Auto-sync search failed with status ${searchRes.status}. Details: ${errorText.substring(0, 100)}`);
      }
      return;
    }

    const searchData = await safeParseJson(searchRes);
    if (searchData.files && searchData.files.length > 0) {
      fileIdToUpdate = searchData.files[0].id;
    }

    const metadata = {
      name: `UPSC_App_AutoBackup.json`,
      mimeType: 'application/json'
    };
    
    const boundary = 'foo_bar_baz';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      `--${boundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      backupString +
      closeDelimiter;

    const rawUrl = fileIdToUpdate 
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileIdToUpdate}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const url = `/api/google-proxy?url=${encodeURIComponent(rawUrl)}`;
      
    const method = fileIdToUpdate ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (res.ok) {
      localStorage.setItem(lastSyncTimeKey, Date.now().toString());
    } else {
      if (res.status === 401) {
         localStorage.removeItem("google_access_token");
      }
      const errText = await res.text();
      console.error("Drive upload error in AutoSync json:", errText);
    }
    
    // Perform hierarchical folder sync for notes
    await syncNotesToFolders(token);
    
  } catch (err: any) {
    console.error('Auto backup failed', err);
  } finally {
    isSyncing = false;
    if (pendingSync) {
      performBackup(token, true);
    }
  }
};

export const useAutoSync = () => {
  const [lastSync, setLastSync] = useState(() => localStorage.getItem(lastSyncTimeKey));
  
  useEffect(() => {
    // Check every 2 minutes
    const interval = setInterval(async () => {
      const token = await getAccessToken();
      if (token) {
        await performBackup(token);
        setLastSync(Date.now().toString());
      }
    }, 120000);

    // Also wrap setItem to trigger a delayed sync on change (debounced)
    const originalSetItem = localStorage.setItem;
    
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (LOCAL_STORAGE_KEYS.includes(key)) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          const token = await getAccessToken();
          if (token) {
            await performBackup(token);
            setLastSync(Date.now().toString());
          }
        }, 15000); // Wait 15 seconds after last change to sync
      }
    };

    return () => {
      clearInterval(interval);
      if (debounceTimer) clearTimeout(debounceTimer);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  return lastSync;
};
