import type { VerifyResult } from "../api/client";

const POLYGON_SCAN = "https://amoy.polygonscan.com/tx/";

export default function ProvenanceCard({ result }: { result: VerifyResult }) {
  const p = result.provenance;
  if (!p) return null;
  return (
    <section className="card">
      <h2>Provenance</h2>
      <p className="note">
        {result.match === "exact"
          ? "Exact match: this file is byte-for-byte the registered content."
          : `Similar match (difference ${result.distance} of 64 bits): this looks like an edited or re-encoded copy of registered content.`}
      </p>
      <dl className="kv">
        <dt>Creator</dt><dd className="mono">{p.creator_did}</dd>
        <dt>Wallet</dt><dd className="mono">{p.wallet_address}</dd>
        <dt>Registered</dt><dd>{new Date(p.registered_at).toLocaleString()}</dd>
        <dt>Blockchain proof</dt>
        <dd>{p.merkle_verified ? "Merkle proof verified on Polygon" : "Not yet anchored"}</dd>
        {p.rfc_timestamp_url && (<><dt>RFC 3161</dt><dd><a href={p.rfc_timestamp_url} target="_blank" rel="noreferrer">Timestamp token</a></dd></>)}
        {p.polygon_tx_hash && (<><dt>Polygon tx</dt><dd><a href={POLYGON_SCAN + p.polygon_tx_hash} target="_blank" rel="noreferrer" className="mono">{p.polygon_tx_hash.slice(0, 18)}…</a></dd></>)}
        {p.irys_url && (<><dt>IRYS record</dt><dd><a href={p.irys_url} target="_blank" rel="noreferrer">Open permanent record</a></dd></>)}
      </dl>
    </section>
  );
}
