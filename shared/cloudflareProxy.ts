export interface CloudflareBindings {
  ASSETS: { fetch(request: Request): Promise<Response> };
  API_ORIGIN?: string;
}

function unavailable(message: string, status = 503) {
  return Response.json({ error: message }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
}

// Keep browser requests on the app origin. Authentication and ownership checks
// remain the responsibility of the existing Node backend.
export async function handleCloudflareRequest(request: Request, env: CloudflareBindings): Promise<Response> {
  const incoming = new URL(request.url);
  if (incoming.pathname !== '/api' && !incoming.pathname.startsWith('/api/')) {
    return env.ASSETS.fetch(request);
  }
  let origin: URL;
  try {
    origin = new URL(env.API_ORIGIN || '');
    if (origin.protocol !== 'https:' || origin.username || origin.password ||
        origin.pathname !== '/' || origin.search || origin.hash || origin.origin === incoming.origin) {
      throw new Error('Invalid backend origin');
    }
  } catch {
    return unavailable('The cloud backend is not configured. The app owner must deploy the Node server and set API_ORIGIN in Cloudflare.');
  }
  const target = new URL(incoming.pathname + incoming.search, origin);
  const headers = new Headers(request.headers);
  // Do not forward browser cookies or spoofed proxy metadata to the backend.
  for (const name of ['host', 'cookie', 'forwarded', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto']) headers.delete(name);
  try {
    const upstream = await fetch(target, {
      method: request.method, headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });
    // A redirect must never forward Firebase/Google credentials to another host.
    if (upstream.status >= 300 && upstream.status < 400) {
      return unavailable('The cloud backend redirected the API request. The app owner must configure its final HTTPS origin.', 502);
    }
    const contentType = upstream.headers.get('content-type') || '';
    const googleMedia = incoming.pathname === '/api/google-proxy' && !/\btext\/html\b/i.test(contentType);
    if (!googleMedia && !/\bapplication\/(?:[\w.-]+\+)?json\b/i.test(contentType)) {
      return unavailable('The cloud backend returned a webpage instead of API data. The app owner must check API_ORIGIN and the Node server deployment.', 502);
    }
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.delete('set-cookie');
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
  } catch {
    return unavailable('The cloud backend could not be reached. Please retry later; the app owner should check the Node server deployment.', 502);
  }
}
