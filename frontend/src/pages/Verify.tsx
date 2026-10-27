import { useState } from "react";
import FileDropzone from "../components/FileDropzone";
import ProvenanceCard from "../components/ProvenanceCard";
import AIScoreCard from "../components/AIScoreCard";
import { api, type VerifyResult } from "../api/client";
import { sha256File } from "../lib/sha256";
import { phashFile } from "../lib/phash";

export default function Verify() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function handle(file: File) {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const [sha256, phash] = await Promise.all([sha256File(file), phashFile(file)]);
      setResult(await api.verifyHashes({ sha256, phash }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Verify a file</h1>
      <p className="lead">
        Check who registered a file and when, and what the AI check said. No account needed. The
        file stays on your device.
      </p>
      <FileDropzone onFile={handle} disabled={busy} />
      {busy && <p className="note">Checking…</p>}
      {error && <p className="err">{error}</p>}
      {result && result.match === "none" && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h2>No record found</h2>
          <p className="note">
            This file, or anything visually close to it, hasn't been registered. That doesn't mean
            it's fake; it may simply never have been registered.
          </p>
        </section>
      )}
      {result && result.match !== "none" && (
        <div style={{ marginTop: "1rem" }}>
          <ProvenanceCard result={result} />
          <AIScoreCard result={result} />
        </div>
      )}
    </>
  );
}
