import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { initAuth, googleSignIn, logout, getAccessToken } from "../lib/auth";
import type { User } from "firebase/auth";
import { signInErrorMessage } from "../../shared/authErrors";

export const GoogleAuthButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
      },
      () => {
        setUser(null);
        setToken(null);
      },
    );
    return () => {
      // it returns an unsubscribe function
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setLoginError(null);
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setLoginError(signInErrorMessage(err, window.location.hostname));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 w-full justify-between sm:justify-end">
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-panel-border shadow-sm pointer-events-none"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
              {user.displayName?.[0] || "U"}
            </div>
          )}
          <div className="text-left">
            <p className="text-[11px] font-bold text-main leading-none truncate max-w-[120px]">{user.displayName || 'Authorized User'}</p>
            <p className="text-[10px] text-muted truncate max-w-[120px] mt-0.5">{user.email || ''}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-500 text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
          title="Sign out of Google Account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-[11px]">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-end w-full sm:w-auto">
      <button
        onClick={handleLogin}
        disabled={isLoggingIn}
        className="px-4 py-2 hover:bg-input border border-panel-border bg-panel text-main rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 text-[11px] font-black shadow-sm"
        title="Sign in with Google"
      >
        {isLoggingIn ? (
          <div className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            ></path>
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            ></path>
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            ></path>
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            ></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        )}
        <span>Sign in with Google</span>
      </button>
      {loginError && (
        <div role="alert" className="mt-2 w-72 max-w-full break-words bg-panel border-2 border-red-500/20 text-red-500 text-[11px] p-3 rounded-lg shadow-lg">
          {loginError}
          <div className="mt-2 text-right">
            <button onClick={() => setLoginError(null)} className="text-red-500 hover:text-red-400 font-bold p-1">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

