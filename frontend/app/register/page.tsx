"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register, saveSession } from "../../lib/api";
import { Logo } from "../../components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
              <div className="pill auth-pill">Create your intelligence hub</div>
              <h1>Build a workspace where every document becomes searchable knowledge.</h1>
              <p>
                From onboarding packs to quarterly reviews, DocuMind helps teams upload faster, synthesize faster, and
                share insights faster.
              </p>
            </div>
            <div className="auth-metrics">
              <div className="metric-card">
                <strong>Structured reports</strong>
                <span>Export PDF and text reports with summaries, key insights, and table of contents.</span>
              </div>
              <div className="metric-card">
                <strong>Ask questions directly</strong>
                <span>Chat with your documents instead of hunting through pages manually.</span>
              </div>
            </div>
          </section>

          <div className="auth-card stack">
            <div>
              <div className="pill">Create workspace</div>
              <h1>Start using DocuMind</h1>
              <p className="muted">Create your account and begin organizing AI-ready document intelligence.</p>
            </div>
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
            <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
            {error ? <span style={{ color: "var(--danger)" }}>{error}</span> : null}
            <button
              className="button"
              onClick={async () => {
                try {
                  const response = await register({ name, email, password });
                  saveSession(response.token, response.user);
                  router.push("/dashboard");
                } catch (authError) {
                  setError(authError instanceof Error ? authError.message : "Registration failed.");
                }
              }}
            >
              Create account
            </button>
            <span className="muted">
              Already registered? <Link href="/login">Login</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
