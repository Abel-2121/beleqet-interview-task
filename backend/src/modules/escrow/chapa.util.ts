/** Read the Chapa secret key from config, trying test key first then live key */
export function getChapaSecret(env: { get: (key: string) => string | undefined }): string {
  return (
    env.get('CHAPA_TEST_SECRET_KEY') ||
    env.get('CHAPA_SECRET_KEY') ||
    ''
  );
}

/** Build a Chapa transaction reference in the format BLQ-<shortId>-<timestamp> */
export function buildTxRef(escrowId: string): string {
  const shortId = escrowId.replace(/-/g, '').slice(0, 10);
  return `BLQ-${shortId}-${Date.now()}`;
}

/** Extract an escrow ID from a legacy BELEQET- prefixed tx_ref or return null for BLQ- format */
export function parseEscrowIdFromTxRef(txRef: string): string | null {
  const prefixed = txRef.match(/^BLQ-([0-9a-f]{10})-/i);
  if (prefixed) {
    const prefix = prefixed[1].toLowerCase();
    return null; // resolved via gatewayRef lookup instead
  }
  const legacy = txRef.match(/^BELEQET-([0-9a-f-]{36})-/i);
  if (legacy) return legacy[1];
  if (/^[0-9a-f-]{36}$/i.test(txRef)) return txRef;
  return null;
}

/** Normalize an Ethiopian phone number to the +251 format expected by Chapa */
export function formatPhoneForChapa(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('251')) return `+${digits}`;
  if (digits.startsWith('0')) return `+251${digits.slice(1)}`;
  if (digits.length === 9) return `+251${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

/** Verify a Chapa transaction status using the Chapa verify API endpoint */
export async function verifyChapaTransaction(
  txRef: string,
  secret: string,
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secret}` },
    cache: 'no-store',
  });
  const data = await res.json();
  const ok =
    data?.status === 'success' &&
    (data?.data?.status === 'success' || data?.data?.status === 'successful');
  return { ok, data };
}

/** Initialize a Chapa checkout session and return the checkout URL or error message */
export async function initializeChapaCheckout(
  secret: string,
  payload: Record<string, unknown>,
): Promise<{ checkoutUrl?: string; message?: string }> {
  const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.status === 'success' && data.data?.checkout_url) {
    return { checkoutUrl: data.data.checkout_url };
  }
  const message =
    typeof data.message === 'string'
      ? data.message
      : JSON.stringify(data.message ?? data);
  return { message };
}
