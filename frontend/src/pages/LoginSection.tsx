import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginSection() {
    const { user, loginWithGoogle, logout } = useAuth();
    const nav = useNavigate();
    const [error, setError] = useState("");

    if (user) {
        return (
            <section id="login" className="landing-section alt-section">
                <div className="section-inner section-inner--narrow">
                    <div className="section-header">
                        <div className="section-tag">Account</div>
                        <h2 className="section-title">You're signed in</h2>
                    </div>
                    <div className="card login-card">
                        <div className="user-avatar">{user.email[0].toUpperCase()}</div>
                        <p className="user-email">{user.email}</p>
                        <p className="note mono">{user.did}</p>
                        <div className="login-actions">
                            <button className="btn btn-primary" onClick={() => nav("/dashboard")}>
                                My content
                            </button>
                            <button className="btn btn-outline" onClick={logout}>
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="login" className="landing-section alt-section">
            <div className="section-inner section-inner--narrow">
                <div className="section-header">
                    <div className="section-tag">Sign in</div>
                    <h2 className="section-title">Get started with GENEX</h2>
                    <p className="section-lead">
                        Sign in with Google to register and manage your content. We create a
                        non-custodial wallet for you automatically — no MetaMask or crypto needed.
                    </p>
                </div>
                <div className="card login-card">
                    <div className="login-perks">
                        <div className="perk">
                            <span className="perk-icon">🔑</span>
                            <span>Automatic blockchain wallet</span>
                        </div>
                        <div className="perk">
                            <span className="perk-icon">📁</span>
                            <span>Track all your registered files</span>
                        </div>
                        <div className="perk">
                            <span className="perk-icon">⛓️</span>
                            <span>On-chain proof of ownership</span>
                        </div>
                    </div>
                    <div className="google-btn-wrap">
                        <GoogleLogin
                            onSuccess={async (res) => {
                                try {
                                    if (!res.credential) throw new Error("Google did not return a credential.");
                                    await loginWithGoogle(res.credential);
                                    nav("/dashboard");
                                } catch (e) {
                                    setError((e as Error).message);
                                }
                            }}
                            onError={() => setError("Google sign-in failed. Try again.")}
                            width="300"
                        />
                    </div>
                    {error && <p className="err center-text">{error}</p>}
                    <p className="note center-text" style={{ marginTop: "1rem" }}>
                        By signing in you agree to our terms. Your files are never uploaded.
                    </p>
                </div>
            </div>
        </section>
    );
}
