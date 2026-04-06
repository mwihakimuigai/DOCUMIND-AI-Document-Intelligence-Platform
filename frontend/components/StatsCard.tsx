export function StatsCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="panel">
      <div className="stack">
        <span className="muted">{label}</span>
        <strong style={{ fontSize: "2rem" }}>{value}</strong>
        <span className="muted">{detail}</span>
      </div>
    </div>
  );
}
