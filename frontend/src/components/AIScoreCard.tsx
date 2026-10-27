import type { VerifyResult } from "../api/client";

function bucket(score: number) {
  if (score < 0.3) return { label: "Authentic", color: "var(--ok)" };
  if (score < 0.6) return { label: "Uncertain", color: "var(--warn)" };
  if (score < 0.8) return { label: "Possibly manipulated", color: "var(--manip)" };
  return { label: "AI-generated", color: "var(--bad)" };
}

export default function AIScoreCard({ result }: { result: VerifyResult }) {
  if (!result.ai) return null;
  const { score, scored_at } = result.ai;
  const b = bucket(score);
  return (
    <section className="card">
      <h2>AI authenticity check</h2>
      <strong style={{ color: b.color }}>{b.label}</strong>{" "}
      <span className="note">(score {score.toFixed(2)})</span>
      <div className="score-bar" aria-hidden>
        <span style={{ width: `${Math.round(score * 100)}%`, background: b.color }} />
      </div>
      <p className="note">
        Scored {new Date(scored_at).toLocaleString()}. This is a probabilistic estimate from a
        detection service, not proof. A low score does not guarantee a file is genuine, and a high
        score does not guarantee it is fake.
      </p>
    </section>
  );
}
