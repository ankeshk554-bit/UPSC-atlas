export function signInErrorMessage(error: unknown, hostname: string): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  switch (code) {
    case 'auth/unauthorized-domain':
      return `Google sign-in is not enabled for ${hostname}. The app owner must add this hostname in Firebase Authentication > Settings > Authorized domains. Opening another tab will not fix this configuration.`;
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup. Allow popups for this site, then try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled. Try again and keep the sign-in window open until it finishes.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled for this app. The app owner must enable Google in Firebase Authentication > Sign-in method.';
    case 'auth/network-request-failed':
      return 'Google sign-in could not connect. Check your internet connection and try again.';
    default:
      return 'Google sign-in failed. Please try again. If it continues, contact the app owner.';
  }
}
