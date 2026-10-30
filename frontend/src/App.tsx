import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import VerifySection from "./pages/VerifySection";
import RegisterSection from "./pages/RegisterSection";
import LoginSection from "./pages/LoginSection";

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

const SLIDES = [
  { id: "home", label: "Home" },
  { id: "verify", label: "Verify" },
  { id: "register", label: "Register" },
  { id: "login", label: "Sign in" },
];

function LandingPage({ current, goTo }: { current: number; goTo: (i: number) => void }) {
  const total = SLIDES.length;

  // Keyboard arrows (ignored while typing in a field)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goTo]);

  // Horizontal swipe (ignored for mostly-vertical gestures)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = startX - e.changedTouches[0].clientX;
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx > 0 ? 1 : -1));
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [current, goTo]);

  return (
    <div className="slider-root">
      <div className="slider-track" style={{ transform: `translateX(-${current * 100}vw)` }}>
        <div className="slide" id="home"><Home /></div>
        <div className="slide" id="verify"><VerifySection /></div>
        <div className="slide" id="register"><RegisterSection /></div>
        <div className="slide" id="login"><LoginSection /></div>
      </div>

      <button
        className="slider-arrow slider-arrow--left"
        onClick={() => goTo(current - 1)}
        disabled={current === 0}
        aria-label="Previous slide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        className="slider-arrow slider-arrow--right"
        onClick={() => goTo(current + 1)}
        disabled={current === total - 1}
        aria-label="Next slide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="slider-dots" role="tablist" aria-label="Slides">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to ${s.label}`}
            className={`slider-dot${i === current ? " active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState(0);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const goTo = (idx: number) => setCurrent(Math.max(0, Math.min(SLIDES.length - 1, idx)));

  // Navbar shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Make links like <a href="#login"> or <Link to="/#register"> move the slider
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href") ?? "";
      const m = href.match(/^\/?#(\w+)$/);
      if (!m) return;
      const idx = SLIDES.findIndex((s) => s.id === m[1]);
      if (idx < 0) return;
      if (href.startsWith("#")) e.preventDefault(); // plain anchors; "/#x" links are handled by the router
      goTo(idx);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <header className={`navbar${scrolled || !isLanding ? " navbar--scrolled" : ""}`}>
        <Link to="/" className="brand" onClick={() => goTo(0)}>
          <span className="brand-dot" />
          GENEX
        </Link>

        {isLanding && (
          <nav className="navbar-links" aria-label="Main navigation">
            {SLIDES.map(({ id, label }, idx) => {
              if (id === "login" && user) return null; // signed in: show Dashboard instead
              return (
                <button
                  key={id}
                  className={`nav-link${current === idx ? " active" : ""}${id === "login" ? " nav-link--cta" : ""}`}
                  onClick={() => goTo(idx)}
                >
                  {label}
                </button>
              );
            })}
            {user && (
              <span className="navbar-user">
                <span className="user-dot">{user.email[0].toUpperCase()}</span>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <button className="nav-link linklike" onClick={logout}>Sign out</button>
              </span>
            )}
          </nav>
        )}

        {!isLanding && (
          <nav className="navbar-links">
            <Link to="/" className="nav-link">← Back</Link>
            {user && (
              <>
                <Link to="/dashboard" className="nav-link">My content</Link>
                <button className="nav-link linklike" onClick={logout}>Sign out</button>
              </>
            )}
          </nav>
        )}

        <button
          className="hamburger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-drawer" onClick={() => setMenuOpen(false)}>
          {isLanding &&
            SLIDES.map(({ id, label }, idx) =>
              id === "login" && user ? null : (
                <button
                  key={id}
                  className="drawer-link"
                  onClick={() => { goTo(idx); setMenuOpen(false); }}
                >
                  {label}
                </button>
              )
            )}
          {user && (
            <>
              <Link to="/dashboard" className="drawer-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button className="drawer-link linklike" onClick={() => { logout(); setMenuOpen(false); }}>Sign out</button>
            </>
          )}
        </div>
      )}

      <main>
        <Routes>
          <Route path="/" element={<LandingPage current={current} goTo={goTo} />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}