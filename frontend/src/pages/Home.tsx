import heroBg from "../assets/hero-bg.png";

export default function Home() {
    return (
        <section id="home" className="landing-section hero-section">
            <div className="hero-content">
                <div className="hero-badge">Blockchain-powered content authentication</div>
                <h1 className="hero-title">
                    Own your content.<br />
                    <span className="hero-accent">Prove it on-chain.</span>
                </h1>
                <p className="hero-lead">
                    GENEX fingerprints your files in the browser, timestamps them with RFC 3161,
                    and anchors a Merkle root on Polygon — giving you tamper-proof provenance
                    without uploading a single byte.
                </p>
                <div className="hero-actions">
                    <a href="#verify" className="btn btn-primary">Verify a file</a>
                    <a href="#register" className="btn btn-outline">Register content</a>
                </div>
                <div className="hero-stats">
                    <div className="stat">
                        <span className="stat-value">0 bytes</span>
                        <span className="stat-label">uploaded from your device</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat">
                        <span className="stat-value">RFC 3161</span>
                        <span className="stat-label">trusted timestamping</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat">
                        <span className="stat-value">Polygon</span>
                        <span className="stat-label">blockchain anchoring</span>
                    </div>
                </div>
            </div>

            {/* 3-D orbiting circle with image */}
            <div className="hero-visual" aria-hidden>
                {/* Outer glow ring — keeps its pulse animation */}
                <div className="glow-ring" />

                {/* Orbiting dot that travels the circumference */}
                <div className="orbit-dot-track">
                    <div className="orbit-dot" />
                </div>

                {/* Circle image frame */}
                <div className="hero-img-frame">
                    <img
                        src={heroBg}
                        alt="GENEX security illustration"
                        className="hero-img"
                    />
                </div>
            </div>
        </section>
    );
}
