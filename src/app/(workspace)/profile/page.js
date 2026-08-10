"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "@/redux/store";
import { getDashboardStats } from "@/lib/taskUtils";

function getInitials(name = "") {
  const parts = `${name}`.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function Profile() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const tasks = useSelector((state) => state.tasks.items);
  const [form, setForm] = useState({ name: "", title: "", email: "", location: "", bio: "" });
  const [editing, setEditing] = useState(false);
  const stats = useMemo(() => getDashboardStats(tasks), [tasks]);

  useEffect(() => {
    setForm({
      name: profile.name ?? "",
      title: profile.title ?? "",
      email: profile.email ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
    });
  }, [profile]);

  const saveProfile = (event) => {
    event.preventDefault();
    dispatch(updateProfile(form));
    setEditing(false);
  };

  const hasProfile = [profile.name, profile.title, profile.email, profile.location, profile.bio].some(Boolean);

  return (
    <main className="simple-page">
      <Link href="/">← Back to workspace</Link>
      <p className="eyebrow">PROFILE</p>
      <h1>{profile.name?.trim() || "Your profile"}</h1>
      <section className="profile-card">
        <span className="avatar">{getInitials(profile.name)}</span>
        <div>
          <h2>{profile.title?.trim() || "Add your role"}</h2>
          <p>{[profile.email, profile.location].filter(Boolean).join(" • ") || "Add your contact details to personalize the workspace."}</p>
        </div>
        <button className="primary" onClick={() => { setForm({ name: profile.name ?? "", title: profile.title ?? "", email: profile.email ?? "", location: profile.location ?? "", bio: profile.bio ?? "" }); setEditing(true); }}>Edit profile</button>
      </section>
      {editing ? (
        <section className="setting-card" style={{ marginTop: 16 }}>
          <h2>Profile details</h2>
          <form onSubmit={saveProfile} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              Name
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Role
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Email
              <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Location
              <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Bio
              <textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} rows={3} />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="primary">Save</button>
              <button type="button" className="ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        </section>
      ) : null}
      <div className="metrics profile-metrics">
        <div><span>Tasks completed</span><b>{stats.completedTasks}</b></div>
        <div><span>Open tasks</span><b>{stats.openTaskCount}</b></div>
        <div><span>Due this week</span><b>{stats.dueThisWeek}</b></div>
      </div>
      {!hasProfile ? <section className="setting-card" style={{ marginTop: 16 }}><h2>Profile</h2><p>Add your details to personalize the workspace.</p></section> : null}
    </main>
  );
}
