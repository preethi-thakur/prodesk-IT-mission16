"use client";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function Settings() {
  const profile = useSelector((state) => state.profile);

  return (
    <main className="simple-page">
      <Link href="/">← Back to workspace</Link>
      <p className="eyebrow">SETTINGS</p>
      <h1>Workspace preferences</h1>
      <section className="setting-card">
        <h2>Notifications</h2>
        <p>Choose which activity deserves your attention.</p>
        <label className="switch-row">Task assignments <input type="checkbox" defaultChecked /></label>
        <label className="switch-row">Project updates <input type="checkbox" defaultChecked /></label>
        <label className="switch-row">Weekly digest <input type="checkbox" /></label>
      </section>
      <section className="setting-card" style={{ marginTop: 16 }}>
        <h2>Profile</h2>
        <p>{profile.name?.trim() || "Your profile is ready for updates."}</p>
      </section>
    </main>
  );
}
