"use client";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function Calendar() {
  const tasks = useSelector((state) => state.tasks.items);
  const scheduledTasks = tasks.filter((task) => task.due?.trim());

  return (
    <main className="simple-page">
      <Link href="/">← Back to workspace</Link>
      <p className="eyebrow">CALENDAR</p>
      <h1>Schedule</h1>
      {scheduledTasks.length ? (
        <div className="project-grid">
          {scheduledTasks.map((task) => (
            <article key={task.id}>
              <h2>{task.title || "Untitled task"}</h2>
              <p>{task.due} · {task.status}</p>
            </article>
          ))}
        </div>
      ) : (
        <section className="setting-card"><h2>No scheduled tasks</h2><p>Add due dates to the tasks to see them here.</p></section>
      )}
    </main>
  );
}
