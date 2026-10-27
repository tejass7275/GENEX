import type { ContentStatus } from "../api/client";

const LABEL: Record<ContentStatus, string> = {
  pending_ai: "AI check running",
  pending_anchor: "Waiting for blockchain batch",
  anchored: "Anchored on Polygon",
  failed: "Failed",
};

export default function StatusBadge({ status }: { status: ContentStatus }) {
  return <span className={`badge b-${status}`}>{LABEL[status]}</span>;
}
