export async function requireApiJson(response: Response): Promise<Response> {
  const type = response.headers.get('content-type') || '';
  try {
    if (!/\bapplication\/(?:[\w.-]+\+)?json\b/i.test(type)) throw new Error('Not JSON');
    await response.clone().json();
    return response;
  } catch {
    return Response.json({
      error: 'The cloud service returned an invalid response. The app owner must check that /api requests reach the Node backend rather than the static website.',
    }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
