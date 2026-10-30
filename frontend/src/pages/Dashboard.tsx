import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { api, type ContentRecord } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentRecord[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => api.myContent().then(setItems).catch((e) => setError(e.message));
    load();
    const t = setInterval(load, 15000); // refresh statuses while batches run
    return () => clearInterval(t);
  }, []);

  return (
    <div className="dash-wrap">
      <h1>My content</h1>
      <p className="note mono">{user?.did}</p>
      {error && <p className="err">{error}</p>}
      <div className="card">
        {items === null ? (
          <p className="note">Loading…</p>
        ) : items.length === 0 ? (
          <p>You haven't registered anything yet. <Link to="/register">Register your first file</Link>.</p>
        ) : (
          items.map((c) => (
            <div className="row" key={c.id}>
              <div>
                <strong>{c.filename}</strong>
                <div className="note mono">{c.sha256.slice(0, 20)}…</div>
                <div className="note">{new Date(c.registered_at).toLocaleString()}</div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
