// Verifies the Cloudflare Access token on each request, so the page stays shut even if Access is
// switched off or the Worker is reached some other way.

interface AccessJwk extends JsonWebKey {
  kid: string;
}

interface AccessClaims {
  aud?: string | string[];
  exp?: number;
  iss?: string;
  email?: string;
}

function base64UrlBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlBytes(value))) as T;
}

/** Returns the signed-in email, or null when the request isn't a valid Access session for this app. */
export async function verifyAccess(request: Request, teamDomain: string, audience: string): Promise<string | null> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  const issuer = teamDomain.replace(/\/+$/, "");
  if (!token || !issuer.startsWith("https://") || !audience) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = decodeJson<{ alg?: string; kid?: string }>(parts[0]);
    const claims = decodeJson<AccessClaims>(parts[1]);
    if (header.alg !== "RS256" || !header.kid) return null;
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(audience) || claims.iss !== issuer) return null;
    if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) return null;

    const certs = await fetch(`${issuer}/cdn-cgi/access/certs`);
    const { keys } = await certs.json() as { keys?: AccessJwk[] };
    const jwk = keys?.find((key) => key.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, base64UrlBytes(parts[2]), signed);
    return valid ? claims.email ?? "signed in" : null;
  } catch (error) {
    console.error("Access token check failed", error);
    return null;
  }
}
