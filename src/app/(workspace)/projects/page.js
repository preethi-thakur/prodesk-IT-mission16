"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getDashboardStats } from "@/lib/taskUtils";

export default function Projects() {
  const tasks = useSelector((state) => state.tasks.items);
  const stats = useMemo(() => getDashboardStats(tasks), [tasks]);

  return (
    <main className="simple-page">
      <Link href="/">← Back to workspace</Link>
      <p className="eyebrow">PROJECTS</p>
      <h1>Your workspace</h1>
      <div className="project-grid">
        <article>
          <span className="project-icon p0">W</span>
          <h2>Workspace</h2>
          <p>{stats.openTaskCount} open tasks · {stats.completedTasks} completed</p>
          <progress value={stats.completionPercent} max="100" />
        </article>
      </div>
    </main>
  );
}
