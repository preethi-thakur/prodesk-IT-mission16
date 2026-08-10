"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { addMember, removeMember, updateMember, unassignMemberFromTasks } from "@/redux/store";

const emptyForm = {
  name: "",
  email: "",
  role: "",
  department: "",
  status: "Active",
  joinDate: "",
  avatarUrl: "",
};

function getInitials(name = "") {
  const parts = `${name}`.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function MemberAvatar({ member }) {
  if (member.avatarUrl) {
    return <img src={member.avatarUrl} alt={member.name || "Member avatar"} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />;
  }
  return <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e9e5ff", color: "#5144c6", display: "grid", placeItems: "center", fontWeight: 700 }}>{getInitials(member.name)}</div>;
}

export default function TeamMembersPage() {
  const dispatch = useDispatch();
  const members = useSelector((state) => state.members.items);
  const tasks = useSelector((state) => state.tasks.items);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const visibleMembers = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    return members.filter((member) => {
      const roleMatch = roleFilter === "All" || member.role === roleFilter;
      const statusMatch = statusFilter === "All" || member.status === statusFilter;
      const queryMatch = !normalizedQuery || `${member.name} ${member.email}`.toLowerCase().includes(normalizedQuery);
      return roleMatch && statusMatch && queryMatch;
    });
  }, [members, roleFilter, search, statusFilter]);

  const uniqueRoles = useMemo(() => Array.from(new Set(members.map((member) => member.role).filter(Boolean))), [members]);
  const activeMembers = useMemo(() => members.filter((member) => member.status === "Active").length, [members]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const startEdit = (member) => {
    setForm({
      name: member.name || "",
      email: member.email || "",
      role: member.role || "",
      department: member.department || "",
      status: member.status || "Active",
      joinDate: member.joinDate || "",
      avatarUrl: member.avatarUrl || "",
    });
    setEditingId(member.id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedValues = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      department: form.department.trim(),
      status: form.status.trim() || "Active",
      joinDate: form.joinDate.trim(),
      avatarUrl: form.avatarUrl.trim(),
    };

    if (!trimmedValues.name || !trimmedValues.email || !trimmedValues.role || !trimmedValues.department) {
      setError("Please fill in all required fields.");
      return;
    }

    const duplicate = members.find((member) => member.email.toLowerCase() === trimmedValues.email.toLowerCase() && member.id !== editingId);
    if (duplicate) {
      setError("A member with this email already exists.");
      return;
    }

    if (editingId) {
      dispatch(updateMember({ id: editingId, ...trimmedValues }));
    } else {
      dispatch(addMember({ id: crypto.randomUUID(), ...trimmedValues }));
    }
    resetForm();
  };

  const handleDelete = (member) => {
    toast(`Remove ${member.name || member.email}?`, {
      action: {
        label: "Remove",
        onClick: () => {
          dispatch(removeMember(member.id));
          dispatch(unassignMemberFromTasks({ memberName: member.name, memberEmail: member.email }));
          toast.success("Team member removed");
        },
      },
    });
  };

  return (
    <main className="simple-page">
      <Link href="/">← Back to workspace</Link>
      <p className="eyebrow">TEAM</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1>Team members</h1>
          <p style={{ marginTop: -10, color: "#758093" }}>{activeMembers} active members · {tasks.length} tasks in workspace</p>
        </div>
        <button className="primary" type="button" onClick={openCreate} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><PlusIcon /> Add Member</button>
      </div>

      <section className="setting-card" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "grid", gap: 6, minWidth: 220, flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Search</span>
            <div style={{ position: "relative" }}>
              <MagnifyingGlassIcon style={{ position: "absolute", left: 10, top: 10, width: 16, color: "#8b95a5" }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" style={{ paddingLeft: 36, width: "100%" }} />
            </div>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Role</span>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="All">All</option>
              {uniqueRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="On leave">On leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
      </section>

      {showForm ? (
        <section className="setting-card" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>{editingId ? "Edit member" : "Add member"}</h2>
            <button type="button" className="ghost" onClick={resetForm}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 10 }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}>
                Name
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                Email
                <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </label>
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}>
                Role
                <input value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} required />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                Department
                <input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} required />
              </label>
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}>
                Status
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="Active">Active</option>
                  <option value="On leave">On leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                Join date
                <input type="date" value={form.joinDate} onChange={(event) => setForm((current) => ({ ...current, joinDate: event.target.value }))} />
              </label>
            </div>
            <label style={{ display: "grid", gap: 6 }}>
              Avatar URL
              <input value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="Optional image URL" />
            </label>
            {error ? <div style={{ color: "#c6535b", fontSize: 12 }}>{error}</div> : null}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="primary">Save member</button>
              <button type="button" className="ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </section>
      ) : null}

      {visibleMembers.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {visibleMembers.map((member) => (
            <article key={member.id} className="profile-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MemberAvatar member={member} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <b>{member.name}</b>
                    <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 999, background: member.status === "Active" ? "#e7f8ef" : "#f2f4f7", color: member.status === "Active" ? "#1d8a51" : "#596372" }}>{member.status}</span>
                  </div>
                  <div style={{ color: "#758093", fontSize: 13, marginTop: 2 }}>{member.email}</div>
                  <div style={{ color: "#8b95a5", fontSize: 12, marginTop: 4 }}>{member.role} • {member.department} • Joined {member.joinDate || "—"}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="ghost" onClick={() => startEdit(member)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><PencilSquareIcon style={{ width: 16 }} /> Edit</button>
                <button type="button" className="ghost" onClick={() => handleDelete(member)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><TrashIcon style={{ width: 16 }} /> Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="setting-card" style={{ display: "grid", placeItems: "center", padding: 36, textAlign: "center" }}>
          <UserCircleIcon style={{ width: 48, color: "#a6b0c0" }} />
          <h2 style={{ marginBottom: 4 }}>No team members yet</h2>
          <p style={{ color: "#758093", marginTop: 0 }}>Add your first member to start assigning work.</p>
          <button className="primary" type="button" onClick={openCreate}>Add the first member</button>
        </section>
      )}
    </main>
  );
}
