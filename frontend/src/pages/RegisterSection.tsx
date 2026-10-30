import { useState } from "react";
import { Link } from "react-router-dom";
import FileDropzone from "../components/FileDropzone";
import StatusBadge from "../components/StatusBadge";
import { api, type ContentRecord } from "../api/client";
import { sha256File } from "../lib/sha256";
import { phashFile } from "../lib/phash";
import { useAuth } from "../hooks/useAuth";

export default function RegisterSection() {
    const { user } = useAuth();
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
        <section id="register" className="landing-section">
            <div className="section-inner">
                <div className="section-header">
                    <div className="section-tag">Register</div>
                    <h2 className="section-title">Claim ownership of your content</h2>
                    <p className="section-lead">
                        Your file is fingerprinted right here in the browser and never uploaded.
                        We timestamp the fingerprint immediately and anchor it on the blockchain
                        in the next hourly batch.
                    </p>
                </div>

                <div className="section-body">
                    {!user ? (
                        <div className="auth-gate card">
                            <div className="auth-gate-icon">🔒</div>
                            <h3>Sign in to register content</h3>
                            <p className="note">You need an account to claim ownership of files.</p>
                            <a href="#login" className="btn btn-primary">Sign in</a>
                        </div>
                    ) : (
                        <>
                            <FileDropzone onFile={handle} disabled={busy} />
                            {busy && <p className="note center-text">Fingerprinting and registering…</p>}
                            {error && <p className="err">{error}</p>}
                            {record && (
                                <div className="card result-card">
                                    <div className="result-icon result-icon--ok">✓</div>
                                    <h3>Registered</h3>
                                    <dl className="kv">
                                        <dt>File</dt><dd>{record.filename}</dd>
                                        <dt>SHA-256</dt><dd className="mono">{record.sha256}</dd>
                                        {record.phash && (<><dt>pHash</dt><dd className="mono">{record.phash}</dd></>)}
                                        <dt>Status</dt><dd><StatusBadge status={record.status} /></dd>
                                    </dl>
                                    <p className="note">
                                        <Link to="/dashboard">Track progress in My content →</Link>
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="how-it-works">
                    <h3 className="hiw-title">How it works</h3>
                    <div className="hiw-steps">
                        <div className="hiw-step">
                            <div className="hiw-num">1</div>
                            <div>
                                <strong>Fingerprint</strong>
                                <p className="note">SHA-256 + perceptual hash computed in your browser</p>
                            </div>
                        </div>
                        <div className="hiw-step">
                            <div className="hiw-num">2</div>
                            <div>
                                <strong>Timestamp</strong>
                                <p className="note">RFC 3161 trusted timestamp issued immediately</p>
                            </div>
                        </div>
                        <div className="hiw-step">
                            <div className="hiw-num">3</div>
                            <div>
                                <strong>Anchor</strong>
                                <p className="note">Merkle root committed to Polygon in hourly batches</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
