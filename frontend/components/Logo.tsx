export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: compact ? 10 : 14 }}
      aria-label="DocuMind logo"
    >
      <div
        style={{
          width: compact ? 42 : 72,
          height: compact ? 42 : 72,
          borderRadius: compact ? 14 : 24,
          background: light
            ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,214,153,0.78))"
            : "linear-gradient(135deg, #ff8f5a, #ffb347)",
          display: "grid",
          placeItems: "center",
          boxShadow: light ? "0 12px 24px rgba(0,0,0,0.16)" : "0 16px 30px rgba(255, 143, 90, 0.28)"
        }}
      >
        <svg width={compact ? "22" : "38"} height={compact ? "22" : "38"} viewBox="0 0 64 64" fill="none">
          <path
            d="M18 16C18 12.6863 20.6863 10 24 10H35.5L46 20.5V48C46 51.3137 43.3137 54 40 54H24C20.6863 54 18 51.3137 18 48V16Z"
            fill={light ? "#1f2437" : "#fff7ef"}
            opacity="0.96"
          />
          <path d="M35 10V18C35 20.2091 36.7909 22 39 22H46" fill={light ? "#1f2437" : "#fff7ef"} opacity="0.78" />
          <path
            d="M26 29C26 26.7909 27.7909 25 30 25H34C39.5228 25 44 29.4772 44 35C44 40.5228 39.5228 45 34 45H30C27.7909 45 26 43.2091 26 41V29Z"
            fill={light ? "#ffb347" : "#ff8f5a"}
          />
          <path
            d="M31 30H34C36.7614 30 39 32.2386 39 35C39 37.7614 36.7614 40 34 40H31V30Z"
            fill={light ? "#fff7ef" : "#1d2333"}
          />
        </svg>
      </div>
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontSize: compact ? "1.1rem" : "2.15rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: light ? "#fff7ef" : "var(--text)"
          }}
        >
          DocuMind
        </div>
        {!compact ? (
          <div style={{ fontSize: "0.98rem", color: light ? "rgba(255,247,239,0.72)" : "var(--muted)" }}>
            Document intelligence suite
          </div>
        ) : null}
      </div>
    </div>
  );
}
