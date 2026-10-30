import { useState } from "react";
import FileDropzone from "../components/FileDropzone";
import ProvenanceCard from "../components/ProvenanceCard";
import AIScoreCard from "../components/AIScoreCard";
import { api, type VerifyResult } from "../api/client";
import { sha256File } from "../lib/sha256";
import { phashFile } from "../lib/phash";

export default function VerifySection() {
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
        <section id="verify" className="landing-section alt-section">
            <div className="section-inner">
                <div className="section-header">
                    <div className="section-tag">Verify</div>
                    <h2 className="section-title">Check a file's authenticity</h2>
                    <p className="section-lead">
                        Drop any file to see who registered it, when, and what the AI authenticity
                        check says. No account needed — the file never leaves your device.
                    </p>
                </div>
                <div className="section-body">
                    <FileDropzone onFile={handle} disabled={busy} />
                    {busy && <p className="note center-text">Checking…</p>}
                    {error && <p className="err">{error}</p>}
                    {result && result.match === "none" && (
                        <div className="card result-card">
                            <div className="result-icon result-icon--none">?</div>
                            <h3>No record found</h3>
                            <p className="note">
                                This file, or anything visually close to it, hasn't been registered.
                                That doesn't mean it's fake — it may simply never have been registered.
                            </p>
                        </div>
                    )}
                    {result && result.match !== "none" && (
                        <div className="results-stack">
                            <ProvenanceCard result={result} />
                            <AIScoreCard result={result} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
