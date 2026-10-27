import { useState } from "react";
import { Link } from "react-router-dom";
import FileDropzone from "../components/FileDropzone";
import StatusBadge from "../components/StatusBadge";
import { api, type ContentRecord } from "../api/client";
import { sha256File } from "../lib/sha256";
import { phashFile } from "../lib/phash";

export default function Register() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<ContentRecord | null>(null);

  async function handle(file: File) {
    setBusy(true);
    setError("");
    setRecord(null);
    try {
      const [sha256, phash] = await Promise.all([sha256File(file), phashFile(file)]);
      const rec = await api.registerContent({
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        sha256,
        phash,
      });
      setRecord(rec);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Register content</h1>
      <p className="lead">
        Your file is fingerprinted in this browser and never uploaded. We timestamp the fingerprint
        right away and anchor it on the blockchain in the next hourly batch.
      </p>
      <FileDropzone onFile={handle} disabled={busy} />
      {busy && <p className="note">Fingerprinting and registering…</p>}
      {error && <p className="err">{error}</p>}
      {record && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h2>Registered</h2>
          <dl className="kv">
            <dt>File</dt><dd>{record.filename}</dd>
            <dt>SHA-256</dt><dd className="mono">{record.sha256}</dd>
            {record.phash && (<><dt>pHash</dt><dd className="mono">{record.phash}</dd></>)}
            <dt>Status</dt><dd><StatusBadge status={record.status} /></dd>
          </dl>
          <p className="note"><Link to="/dashboard">Track progress in My content</Link></p>
        </section>
      )}
    </>
  );
}
