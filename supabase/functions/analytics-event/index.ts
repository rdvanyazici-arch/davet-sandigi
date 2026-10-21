const EVENT_TYPES = new Set([
  'product_view', 'add_to_cart', 'whatsapp_request',
  'instagram_click', 'page_view'
]);
const DEVICES = new Set(['mobile', 'desktop']);
const encoder = new TextEncoder();

function allowedOrigins() {
  return new Set((Deno.env.get('ANALYTICS_ALLOWED_ORIGINS') || '')
    .split(',').map(value => value.trim()).filter(Boolean));
}

function cors(origin: string) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'Origin'
  };
}

function json(origin: string, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'content-type': 'application/json; charset=utf-8' }
  });
}

function classifySource(referrer: unknown) {
  if (!referrer) return 'direct';
  try {
    const host = new URL(String(referrer).slice(0, 2048)).hostname.toLowerCase();
    if (host === 'instagram.com' || host.endsWith('.instagram.com') || host === 'l.instagram.com') return 'instagram';
    if (host === 'google.com' || host.endsWith('.google.com') || /(^|\.)google\.[a-z.]+$/.test(host)) return 'google';
    return 'other';
  } catch {
    return 'other';
  }
}

async function rateKey(request: Request) {
  const secret = Deno.env.get('ANALYTICS_HMAC_SECRET');
  if (!secret || secret.length < 32) throw new Error('Analytics rate-limit secret is missing.');
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown';
  const ip = forwarded.split(',')[0].trim().slice(0, 64);
  const window = Math.floor(Date.now() / 600000);
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${window}:${ip}`));
  return Array.from(new Uint8Array(signature)).map(value => value.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async request => {
  const origin = request.headers.get('origin') || '';
  const origins = allowedOrigins();
  if (!origin || !origins.has(origin)) return json(origin || 'null', 403, { error: 'origin_not_allowed' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (request.method !== 'POST') return json(origin, 405, { error: 'method_not_allowed' });
  if (Number(request.headers.get('content-length') || 0) > 4096) return json(origin, 413, { error: 'payload_too_large' });

  let payload: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 4096) return json(origin, 413, { error: 'payload_too_large' });
    payload = JSON.parse(text);
  } catch {
    return json(origin, 400, { error: 'invalid_json' });
  }

  const eventType = String(payload.event_type || '');
  const device = String(payload.device || '');
  const productId = payload.product_id == null ? null : Number(payload.product_id);
  if (!EVENT_TYPES.has(eventType) || !DEVICES.has(device)) return json(origin, 400, { error: 'invalid_event' });
  if (productId !== null && (!Number.isSafeInteger(productId) || productId < 1)) return json(origin, 400, { error: 'invalid_product' });

  try {
    const projectUrl = Deno.env.get('SUPABASE_URL');
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!projectUrl || !serviceRole) throw new Error('Supabase server configuration is missing.');
    const response = await fetch(`${projectUrl}/rest/v1/rpc/record_analytics_event`, {
      method: 'POST',
      headers: {
        apikey: serviceRole,
        authorization: `Bearer ${serviceRole}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        p_event_type: eventType,
        p_product_id: productId,
        p_source: classifySource(payload.referrer),
        p_device: device,
        p_rate_key: await rateKey(request)
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return json(origin, response.status === 400 ? 400 : 503, { error: 'event_rejected' });
    if (result && result.accepted === false) return json(origin, 429, { error: 'rate_limited' });
    return json(origin, 202, { accepted: true });
  } catch {
    return json(origin, 503, { error: 'temporarily_unavailable' });
  }
});
