import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/Verify";

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="nav">
        <Link to="/" className="brand">Provenance</Link>
        <nav>
          <Link to="/verify">Verify a file</Link>
          {user ? (
            <>
              <Link to="/register">Register content</Link>
              <Link to="/dashboard">My content</Link>
              <button className="linklike" onClick={logout}>Sign out</button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </nav>
      </header>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Navigate to="/verify" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/register" element={<Protected><Register /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        </Routes>
      </main>
    </>
  );
}
