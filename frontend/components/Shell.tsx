"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getStoredUser } from "../lib/api";
import { Logo } from "./Logo";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Documents" },
  { href: "/insights", label: "AI Insights" },
  { href: "/search", label: "Search" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="pill">AI Document Intelligence</div>
          <Logo light />
          <p>Upload, summarize, search, compare, and export insights from your PDFs.</p>
        </div>
        <nav className="nav">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="brand-note">
          <strong>Live workflow</strong>
          <span>Upload PDFs, extract knowledge, then turn findings into reports in minutes.</span>
        </div>
        <div style={{ marginTop: 28 }} className="panel">
          <div className="stack">
            <strong>{user?.name ?? "Demo User"}</strong>
            <span className="muted">{user?.email ?? "demo@documind.ai"}</span>
            <button
              className="button secondary"
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="content">
        <div className="topbar">
          <div className="muted">Workspace overview</div>
          <button
            className="button secondary"
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
