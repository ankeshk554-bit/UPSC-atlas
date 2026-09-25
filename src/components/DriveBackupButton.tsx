import React, { useState } from "react";
import {
  Loader2,
  DownloadCloud,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getAccessToken } from "../lib/auth";

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

export const DriveBackupButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const LOCAL_STORAGE_KEYS = [
    "upsc_chat_sessions",
    "upsc_chat_history",
    "upsc_saved_evals",
    "upsc_saved_notes",
    "upsc_saved_pyqs",
    "upsc_sessions_count",
    "upsc_syllabus_v2",
    "upsc_affairs_v2",
    "upsc_rss_feeds",
    "upsc_rss_ai_summaries",
    "upsc_saved_rss_notes",
    "upsc_read_rss_items",
    "upsc_saved_blueprints",
    "app_theme",
  ];

  const handleBackup = async () => {
    const token = await getAccessToken();
    if (!token) {
      setErrorMsg("Sign in required.");
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }

    setIsProcessing(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // Gather data
      const dataToBackup: Record<string, string | null> = {};
      LOCAL_STORAGE_KEYS.forEach((key) => {
        dataToBackup[key] = localStorage.getItem(key);
      });

      const backupString = JSON.stringify(dataToBackup, null, 2);

      const metadata = {
        name: `UPSC_App_Backup_${new Date().toISOString().split("T")[0]}.json`,
        mimeType: "application/json",
      };

      const boundary = "foo_bar_baz";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        `--${boundary}\r\n` +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        backupString +
        closeDelimiter;

      const rawUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
      const res = await fetch(
        `/api/google-proxy?url=${encodeURIComponent(rawUrl)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        },
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("google_access_token");
          throw new Error("Session expired. Please sign in again.");
        }
        const errText = await res.text();
        console.error("Drive API Error:", errText);
        throw new Error(`Upload Failed: ${errText.substring(0, 50)}`);
      }

      setSuccessMsg("Backup saved!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    const token = await getAccessToken();
    if (!token) {
      setErrorMsg("Sign in required.");
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }

    setIsProcessing(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const q =
        "(name = 'UPSC_App_AutoBackup.json' or name contains 'UPSC_App_Backup_') and mimeType='application/json' and trashed=false";
      const rawUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&orderBy=modifiedTime desc&pageSize=1`;
      const searchRes = await fetch(
        `/api/google-proxy?url=${encodeURIComponent(rawUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      if (!searchRes.ok) {
        if (searchRes.status === 401) {
          localStorage.removeItem("google_access_token");
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error("Failed to search backup files on Google Drive.");
      }
      
      const searchData = await safeParseJson(searchRes);

      if (!searchData.files || searchData.files.length === 0) {
        throw new Error("No backup file found.");
      }

      const fileId = searchData.files[0].id;

      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const fileRes = await fetch(
        `/api/google-proxy?url=${encodeURIComponent(downloadUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!fileRes.ok) {
        if (fileRes.status === 401) {
          localStorage.removeItem("google_access_token");
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error("Failed to download backup");
      }

      const backupData = await safeParseJson(fileRes);

      if (typeof backupData === "object" && backupData !== null) {
        LOCAL_STORAGE_KEYS.forEach((key) => {
          if (backupData[key] !== undefined && backupData[key] !== null) {
            localStorage.setItem(key, backupData[key]);
          } else if (backupData[key] === null) {
            localStorage.removeItem(key);
          }
        });

        setSuccessMsg("Restored! Reloading...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error("Invalid backup format");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
      <button
        onClick={handleBackup}
        disabled={isProcessing}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/15 border border-accent/25 text-accent text-[11px] font-bold rounded-xl transition-all disabled:opacity-50 h-10 w-full sm:w-auto cursor-pointer shadow-sm shrink-0"
        title="Backup your app progress to Google Drive"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          <UploadCloud className="w-4 h-4 shrink-0" />
        )}
        <span className="text-[11px]">Backup Workspace</span>
      </button>
      
      <button
        onClick={handleRestore}
        disabled={isProcessing}
        className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-input border border-panel-border bg-panel text-main text-[11px] font-bold rounded-xl transition-all disabled:opacity-50 h-10 w-full sm:w-auto cursor-pointer shadow-sm shrink-0"
        title="Restore your app progress from Google Drive"
      >
        <DownloadCloud className="w-4 h-4 shrink-0" />
        <span className="text-[11px]">Restore Latest</span>
      </button>

      {(successMsg || errorMsg) && (
        <div
          className={`absolute bottom-full right-0 mb-3 p-2.5 text-[10.5px] font-bold rounded-xl shadow-lg border flex items-center gap-1.5 z-50 animate-fadeIn ${successMsg ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400" : "bg-red-500/15 border-red-500/35 text-red-400"}`}
        >
          {successMsg ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 animate-pulse" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{successMsg || errorMsg}</span>
        </div>
      )}
    </div>
  );
};
