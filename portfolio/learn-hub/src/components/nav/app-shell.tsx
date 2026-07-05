"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((data: { summary?: { percent: number } }) => {
        setProgressPercent(data.summary?.percent ?? 0);
      })
      .catch(() => setProgressPercent(0));
  }, []);

  return (
    <>
      <Sidebar progressPercent={progressPercent} />
      <main className="flex-1 overflow-auto">{children}</main>
    </>
  );
}
