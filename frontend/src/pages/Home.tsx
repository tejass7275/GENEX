import heroBg from "../assets/hero-bg.png";

export default function Home() {
    return (
        <section id="home" className="landing-section hero-section">
            <div className="hero-content">
                <div className="hero-badge">Blockchain-powered content authentication</div>
                <h1 className="hero-title hero-statement">
                    Verify What's Real.
                </h1>
                <p className="hero-lead">
                    Combat deepfakes with cryptographic truth.
                </p>
                <div className="hero-actions">
                    <a href="#verify" className="btn btn-primary">Verify a file</a>
                    <a href="#register" className="btn btn-outline">Register content</a>
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
