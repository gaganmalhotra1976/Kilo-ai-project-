export async function verifyJWT(token: string, secretKey: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64] = parts;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    if (!payload.sub || !payload.sid) return false;

    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBase64 = parts[2].replace(/-/g, "+").replace(/_/g, "/");
    const signatureArray = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify("HMAC", key, signatureArray, data);
    return isValid;
  } catch {
    return false;
  }
}

export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payloadB64));
  } catch {
    return null;
  }
}