"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, saveSession } from "../../lib/api";
import { Logo } from "../../components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@documind.ai");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="auth-wrap">
      <div className="auth-stage">
        <div className="auth-backdrop" />
        <div className="auth-scene" />
        <div className="auth-overlay" />
        <div className="auth-grid">
          <section className="auth-story">
            <div className="auth-brand">
              <Logo light />
            </div>
            <div className="auth-copy">
              <div className="pill auth-pill">Intelligent document workspace</div>
              <h1>Turn dense PDFs into clear answers, summaries, and decisions.</h1>
              <p>
                Search across reports, highlight the most important sentences, generate exportable briefs, and keep
                your entire review workflow in one place.
              </p>
            </div>
            <div className="auth-metrics">
              <div className="metric-card">
                <strong>Multi-file AI summaries</strong>
                <span>Merge insights from proposals, contracts, and reviews into one digestible brief.</span>
              </div>
              <div className="metric-card">
                <strong>Search with context</strong>
                <span>Find terms instantly and jump into highlighted snippets instead of reading everything.</span>
              </div>
            </div>
          </section>

          <div className="auth-card stack">
            <div>
              <div className="pill">Welcome back</div>
              <h1>Sign in to DocuMind</h1>
              <p className="muted">Use the demo account or your own workspace credentials.</p>
            </div>
            <div className="stack" style={{ gap: 12 }}>
              <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
              <input
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
              />
            </div>
            <div className="auth-helper">
              <span>Demo login prefilled</span>
              <span>demo@documind.ai</span>
            </div>
            {error ? <span style={{ color: "var(--danger)" }}>{error}</span> : null}
            <button
              className="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError("");
                try {
                  const response = await login({ email, password });
                  saveSession(response.token, response.user);
                  router.push("/dashboard");
                } catch (authError) {
                  setError(authError instanceof Error ? authError.message : "Login failed.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Signing in..." : "Enter workspace"}
            </button>
            <span className="muted">
              Need an account? <Link href="/register">Register</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
