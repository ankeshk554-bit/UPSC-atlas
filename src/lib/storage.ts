/**
 * Safe local storage utilities to prevent app crashes on malformed data or restricted storage access
 */

export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return safeJsonParse<T>(raw, fallback);
  } catch {
    return fallback;
  }
}

export function safeLocalStorageSet(key: string, value: any): boolean {
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, str);
    return true;
  } catch (e) {
    console.error(`Failed to write key "${key}" to localStorage:`, e);
    return false;
  }
}
