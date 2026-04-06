"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProtectedPage({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("documind_token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
