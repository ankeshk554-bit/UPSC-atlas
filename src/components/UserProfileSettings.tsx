import { exportWorkspace, snapshot, saveWorkspace } from '../lib/cloud';
import { WORKSPACE_KEYS } from '../../shared/workspace';
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  User, 
  Trash2, 
  LogOut, 
  X, 
  AlertTriangle,
  FileDown
} from "lucide-react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, googleSignIn, logout } from "../lib/auth";

export function UserProfileSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Guest/Offline settings tracked in localStorage for live synchronization
  const [profileName, setProfileName] = useState(() => localStorage.getItem("library_profile_name") || "Scholar");
  const [profileAvatar, setProfileAvatar] = useState(() => localStorage.getItem("library_profile_avatar") || "🧠");

  // Interaction logs / state confirmations
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);
  const [wipeStatus, setWipeStatus] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync state when Firebase authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // If signed in, update profileName and profileAvatar to match Google account details
      if (user) {
        if (user.displayName) {
          setProfileName(user.displayName);
          localStorage.setItem("library_profile_name", user.displayName);
        }
        // Dispatch event for components like VirtualStudyRoom to refresh
        window.dispatchEvent(new Event("storage"));
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync profile data to localized variables and broadcast storage alerts
  const handleSaveProfile = (name: string, avatar: string) => {
    setProfileName(name);
    setProfileAvatar(avatar);
    localStorage.setItem("library_profile_name", name);
    localStorage.setItem("library_profile_avatar", avatar);
    window.dispatchEvent(new Event("storage"));
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        if (result.user.displayName) {
          handleSaveProfile(result.user.displayName, "🧠");
        }
      }
    } catch (err: any) {
      console.error("Sign-in failed in profile settings popup:", err);
      setLoginError("Login popup was closed or blocked. Try opening in a new tab if issues persist.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);

    } catch (e) {
      console.error(e);
    }
  };

  const handleExportAllData = () => exportWorkspace();
  const handleWipeDatabase = async () => {
    setWipeStatus('Resetting study progress...');
    const previous = snapshot();
    exportWorkspace(previous);
    try {
      WORKSPACE_KEYS.forEach(key => localStorage.removeItem(key));
      await saveWorkspace();
      window.location.reload();
    } catch (error) {
      Object.entries(previous).forEach(([key, value]) => localStorage.setItem(key, value));
      setWipeStatus(error instanceof Error ? error.message : 'Reset failed. Progress was preserved.');
    }
  };

  // Simple array of companion emoji selections
  const EMOJI_OPTIONS = ["🧠", "👩‍🎓", "👨‍💻", "☕", "📕", "🎯", "⚡", "🌟"];

  return (
    <>
      {/* Profile Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 p-1 px-2 hover:bg-input border border-panel-border/60 rounded-full transition-all cursor-pointer relative shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
        title="My Profile, Security & Privacy"
        aria-label="User Profile"
        id="user-profile-header-trigger"
      >
        {currentUser && currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Profile Avatar"
            className="w-6 h-6 rounded-full object-cover border border-panel-border"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[11px] font-black shadow-inner">
            {profileAvatar}
          </div>
        )}
        <div className="hidden sm:block text-left pr-1">
          <span className="text-[11px] font-black tracking-tight text-main block max-w-[90px] truncate">
            {currentUser ? currentUser.displayName || "Authorized User" : profileName}
          </span>
        </div>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-panel border border-panel-border rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header section */}
            <div className="flex items-center justify-between p-5 border-b border-panel-border/80 bg-panel/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                <div>
                  <h2 className="text-base font-black text-main uppercase tracking-wider">User Profile</h2>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Account & Settings</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-input/50 border border-panel-border text-muted hover:text-main hover:bg-input rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title="Close Window (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 custom-scrollbar">
              
              {/* Module 1: Identity & Authentication Node */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black tracking-widest text-[#94a3b8] uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent" /> Authentication Status
                </h3>
                <div className="bg-input/30 border border-panel-border/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {currentUser ? (
                     <div className="flex items-center gap-3">
                       <img 
                          src={currentUser.photoURL || ""} 
                          alt="Google Profile" 
                          className="w-10 h-10 rounded-full border border-panel-border/50 shadow-sm"
                          referrerPolicy="no-referrer"
                       />
                       <div>
                         <div className="text-[13px] font-black text-main">{currentUser.displayName || "Google User"}</div>
                         <div className="text-[10px] text-muted font-mono mt-0.5">{currentUser.email}</div>
                         <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Cloud Sync
                         </div>
                       </div>
                     </div>
                  ) : (
                     <div className="space-y-1">
                        <div className="text-[11px] font-bold text-main">Local Offline Mode</div>
                        <p className="text-[10px] text-muted max-w-[220px]">
                           Your progress is currently saved only to this browser.
                        </p>
                     </div>
                  )}

                  <div className="shrink-0 flex items-center gap-2">
                     {currentUser ? (
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 bg-panel border border-panel-border text-muted hover:text-red-500 hover:border-red-500/30 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                     ) : (
                        <button
                          onClick={handleLogin}
                          disabled={isLoggingIn}
                          className="px-4 py-2 bg-white text-black hover:bg-gray-100 border border-transparent text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isLoggingIn ? "Authenticating..." : "Sign in with Google"}
                        </button>
                     )}
                  </div>
                </div>
                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold rounded-xl animate-in slide-in-from-top-1">
                    {loginError}
                  </div>
                )}
              </section>

              {/* Module 2: Local Persona Config */}
              {!currentUser && (
                <section className="space-y-3">
                  <h3 className="text-[11px] font-black tracking-widest text-[#94a3b8] uppercase flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" /> Offline Persona
                  </h3>
                  <div className="bg-input/30 border border-panel-border/60 rounded-2xl p-4 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Display Name</label>
                      <input 
                        type="text"
                        value={profileName}
                        onChange={(e) => handleSaveProfile(e.target.value, profileAvatar)}
                        maxLength={24}
                        className="w-full bg-panel border border-panel-border rounded-xl px-3 py-2 text-[11px] font-bold text-main outline-none focus:border-accent transition-colors"
                        placeholder="e.g. IAS Aspirant"
                      />
                    </div>
                    
                    <div className="space-y-2 pt-1">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Profile Icon</label>
                      <div className="grid grid-cols-8 gap-2">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleSaveProfile(profileName, emoji)}
                            className={`p-2 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                              profileAvatar === emoji 
                                ? "bg-accent/20 border border-accent/40 scale-110" 
                                : "bg-panel border border-panel-border hover:bg-accent/5 hover:border-accent/20"
                            }`}
                          >
                            <span className="leading-none">{emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Module 3: Secure Clean Up & Backup Operations */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black tracking-widest text-[#94a3b8] uppercase flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5 text-accent" /> Data & Backups
                </h3>
                <div className="bg-input/30 border border-panel-border/60 rounded-2xl p-4 space-y-3">
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Manual Export */}
                    <button
                      onClick={handleExportAllData}
                      className="flex-1 px-3 py-2 bg-accent/10 hover:bg-accent border border-accent/25 hover:border-accent text-accent hover:text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Download full database as JSON"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Export Data Backup (JSON)
                    </button>

                    {/* Wipe trigger */}
                    <button
                      onClick={() => setShowConfirmWipe(true)}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Reset this account's study progress"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Reset Study Progress
                    </button>
                  </div>

                  {showConfirmWipe && (
                    <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl mt-2.5 animate-in slide-in-from-top-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-black uppercase text-red-500 tracking-wider">Are you absolutely sure?</h5>
                          <p className="text-[10px] text-muted">This resets this account's current progress on all devices. A copy will be downloaded first. Existing Drive backups and recovery snapshots remain available.</p>
                          
                          {wipeStatus ? (
                            <div className="text-[10px] text-red-500 font-bold animate-pulse">{wipeStatus}</div>
                          ) : (
                            <div className="flex gap-2 pt-1.5">
                              <button
                                onClick={handleWipeDatabase}
                                className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                              >
                                Purge Everything
                              </button>
                              <button
                                onClick={() => setShowConfirmWipe(false)}
                                className="px-3 py-1 bg-panel border border-panel-border text-[11px] rounded-lg text-muted hover:text-main cursor-pointer"
                              >
                                Abort
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </section>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
