import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, reauthenticateWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
let access: { uid: string; token: string; expires: number } | null = null;
localStorage.removeItem('google_access_token');

export const initAuth = (success?: (user: User, token: string) => void, failure?: () => void) =>
  onAuthStateChanged(auth, user => {
    if (access?.uid !== user?.uid) access = null;
    if (user) success?.(user, access?.token || '');
    else failure?.();
  });

export async function googleSignIn() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return { user: result.user, accessToken: '' };
}
export async function connectGoogleDrive(): Promise<string> {
  if (!auth.currentUser) throw new Error('Sign in with Google first.');
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.setCustomParameters({ prompt: 'consent', login_hint: auth.currentUser.email || '' });
  const result = await reauthenticateWithPopup(auth.currentUser, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) throw new Error('Google did not grant Drive access.');
  access = { uid: result.user.uid, token: credential.accessToken, expires: Date.now() + 50 * 60000 };
  return access.token;
}
export async function getAccessToken(): Promise<string | null> {
  return access?.uid === auth.currentUser?.uid && access.expires > Date.now() ? access.token : null;
}
export function invalidateGoogleAccess() { access = null; }
export async function logout() {
  access = null;
  await auth.signOut();
}
