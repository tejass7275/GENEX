import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import VerifySection from "./pages/VerifySection";
import RegisterSection from "./pages/RegisterSection";

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

const SLIDES = [
  { id: "home", label: "Home" },
  { id: "verify", label: "Verify" },
  { id: "register", label: "Register" },
];

function LandingPage() {
  const [current, setCurrent] = useState(0);
  const total = SLIDES.length;

  const goTo = (idx: number) => {
    setCurrent(Math.max(0, Math.min(total - 1, idx)));
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current]);

  // Touch/swipe support
  useEffect(() => {
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [current]);

  return (
    <div className="slider-root">
      {/* Slide track */}
      <div
        className="slider-track"
        style={{ transform: `translateX(-${current * 100}vw)` }}
      >
        <div className="slide" id="home">     <Home />         </div>
        <div className="slide" id="verify">   <VerifySection /></div>
        <div className="slide" id="register"> <RegisterSection /></div>
      </div>

      {/* Left arrow */}
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

      {/* Right arrow */}
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

      {/* Dot indicators */}
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

  // Navbar shadow on scroll (dashboard page only)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Expose a way for nav links to jump to a slide
  const jumpTo = (idx: number) => {
    setCurrent(idx);
    // dispatch a custom event so LandingPage can also respond
    window.dispatchEvent(new CustomEvent("slider:goto", { detail: idx }));
  };

  return (
    <>
      <header className={`navbar${scrolled || !isLanding ? " navbar--scrolled" : ""}`}>
        <a href="/" className="brand" onClick={() => jumpTo(0)}>
          <span className="brand-dot" />
          GENEX
        </a>

        {isLanding && (
          <nav className="navbar-links" aria-label="Main navigation">
            {SLIDES.map(({ id, label }, idx) => {
              if (id === "register" && user) return null; // keep nav clean when logged in
              return (
                <button
                  key={id}
                  className={`nav-link${current === idx ? " active" : ""}${id === "register" ? " nav-link--cta" : ""}`}
                  onClick={() => jumpTo(idx)}
                >
                  {label}
                </button>
              );
            })}
            {user ? (
              <span className="navbar-user">
                <span className="user-dot">{user.email[0].toUpperCase()}</span>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <button className="nav-link linklike" onClick={logout}>Sign out</button>
              </span>
            ) : null}
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
          {isLanding && SLIDES.map(({ id, label }, idx) => (
            <button key={id} className="drawer-link" onClick={() => { jumpTo(idx); setMenuOpen(false); }}>
              {label}
            </button>
          ))}
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
          <Route path="/" element={<LandingPageWrapper onSlideChange={setCurrent} current={current} />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

// Wrapper so App can sync its nav highlight with slider state
function LandingPageWrapper({
  onSlideChange,
  current: externalCurrent,
}: {
  onSlideChange: (i: number) => void;
  current: number;
}) {
  const [current, setCurrent] = useState(externalCurrent);
  const total = SLIDES.length;

  const goTo = (idx: number) => {
    const next = Math.max(0, Math.min(total - 1, idx));
    setCurrent(next);
    onSlideChange(next);
  };

  // Listen for nav-triggered jumps
  useEffect(() => {
    const handler = (e: Event) => goTo((e as CustomEvent<number>).detail);
    window.addEventListener("slider:goto", handler);
    return () => window.removeEventListener("slider:goto", handler);
  }, []);

  // Keep in sync if parent changes (e.g. nav click)
  useEffect(() => {
    setCurrent(externalCurrent);
  }, [externalCurrent]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current]);

  // Touch/swipe
  useEffect(() => {
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [current]);

  return (
    <div className="slider-root">
      {/* Track */}
      <div
        className="slider-track"
        style={{ transform: `translateX(-${current * 100}vw)` }}
      >
        <div className="slide"><Home /></div>
        <div className="slide"><VerifySection /></div>
        <div className="slide"><RegisterSection /></div>
      </div>

      {/* Left arrow */}
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

      {/* Right arrow */}
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

      {/* Dots */}
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
