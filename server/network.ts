import { lookup } from 'node:dns';
import { Agent, request } from 'undici';
import ipaddr from 'ipaddr.js';

export function publicAddress(address: string) {
  try { return ipaddr.process(address).range() === 'unicast'; } catch { return false; }
}
export function publicUrl(input: string | URL) {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) {
    throw new Error('Only public HTTPS URLs are supported.');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || (ipaddr.isValid(host) && !publicAddress(host))) {
    throw new Error('Private network destinations are not allowed.');
  }
  return url;
}

const dispatcher = new Agent({
  connect: {
    lookup(hostname, options, callback) {
      lookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
        if (error) return callback(error, '', 4);
        if (!addresses.length || addresses.some(item => !publicAddress(item.address))) {
          return callback(new Error('Private network destinations are not allowed.'), '', 4);
        }
        if ((options as any).all) (callback as any)(null, addresses);
        else callback(null, addresses[0].address, addresses[0].family);
      });
    },
  },
});

export async function safeFetch(input: string | URL, init: RequestInit = {}): Promise<Response> {
  let url = publicUrl(input);
  const signal = init.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000);
  const headers = Object.fromEntries(new Headers(init.headers).entries());
  for (let redirect = 0; redirect <= 4; redirect++) {
    const response = await request(url, {
      dispatcher, method: (init.method || 'GET') as any, headers,
      body: init.body as any, signal,
      headersTimeout: 12000, bodyTimeout: 12000,
    });
    if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
      response.body.destroy();
      if (headers.authorization || init.method && init.method !== 'GET') throw new Error('Redirects are not allowed for authenticated requests.');
      url = publicUrl(new URL(String(response.headers.location), url));
      continue;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 6 * 1024 * 1024) {
        response.body.destroy();
        throw new Error('Remote response exceeds the size limit.');
      }
      chunks.push(Buffer.from(chunk));
    }
    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(response.headers)) {
      if (value) responseHeaders.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    return new Response([204, 205, 304].includes(response.statusCode) ? null : Buffer.concat(chunks), {
      status: response.statusCode, headers: responseHeaders,
    });
  }
  throw new Error('Too many redirects.');
}

export function googleUrl(input: string) {
  const url = publicUrl(input);
  if (url.hostname !== 'www.googleapis.com' ||
      !(/^\/(?:upload\/)?drive\/v3\/files(?:\/[^/]+)?$/.test(url.pathname) ||
        /^\/calendar\/v3\/calendars\/primary\/events(?:\/[^/]+)?$/.test(url.pathname))) {
    throw new Error('Only Google Drive file operations are supported.');
  }
  return url;
}
