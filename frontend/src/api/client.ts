const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type ContentStatus = "pending_ai" | "pending_anchor" | "anchored" | "failed";

export interface User {
  id: string;
  email: string;
  wallet_address: string;
  did: string;
}

export interface ContentRecord {
  id: string;
  filename: string;
  sha256: string;
  phash: string | null;
  status: ContentStatus;
  registered_at: string;
}

export interface VerifyResult {
  match: "exact" | "similar" | "none";
  distance?: number;
  provenance?: {
    creator_did: string;
    wallet_address: string;
    registered_at: string;
    rfc_timestamp_url?: string;
    polygon_tx_hash?: string;
    irys_url?: string;
    merkle_verified: boolean;
  };
  ai?: { score: number; label: string; scored_at: string };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = localStorage.getItem("dcas_token");
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  googleLogin: (credential: string) =>
    request<{ access_token: string; user: User }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  registerContent: (p: { filename: string; content_type: string; sha256: string; phash: string | null }) =>
    request<ContentRecord>("/content/register", { method: "POST", body: JSON.stringify(p) }),
  myContent: () => request<ContentRecord[]>("/content/mine"),
  verifyHashes: (p: { sha256: string; phash: string | null }) =>
    request<VerifyResult>("/verify", { method: "POST", body: JSON.stringify(p) }),
};
