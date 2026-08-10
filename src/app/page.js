"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  BellIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  Squares2X2Icon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  addTask,
  closeCreateTask,
  closeSidebar,
  closeTask,
  deleteTask,
  duplicateTask,
  moveTask,
  openCreateTask,
  openTask,
  setQuery,
  toggleSidebar,
  toggleTheme,
  updateTask,
} from "@/redux/store";
import {
  buildTaskFormState,
  buildTaskPayload,
  filterTasksByQuery,
  getDashboardStats,
  getNotifications,
  getProjectOwner,
  initialFormState,
  priorityOptions,
  projectConfig,
  statusMeta,
  statusOptions,
} from "@/lib/taskUtils";

const nav = [
  ["Overview", HomeIcon, "/"],
  ["My tasks", CheckCircleIcon, "/"],
  ["Projects", Squares2X2Icon, "/projects"],
  ["Calendar", CalendarDaysIcon, "/calendar"],
  ["Team", UserGroupIcon, "/team-members"],
];
const tabOptions = ["Board", "List", "Calendar", "Activity"];

async function generateSubtasks(title, description) {
  const response = await fetch("/api/generate-subtasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to generate subtasks.");
  return data.subtasks;
}

function Subtasks({ items }) {
  if (!items.length) return null;
  return <div className="subtasks"><b>Subtasks</b>{items.map((item, index) => <div key={`${item}-${index}`}><span>{index + 1}</span>{item}</div>)}</div>;
}

function BoardSkeleton() {
  return <div className="board" aria-label="Loading tasks">{Array.from({ length: 4 }, (_, column) => <section className="column" key={column}><div className="skeleton skeleton-title" />{Array.from({ length: 2 }, (_, card) => <div className="task-card skeleton-card" key={card}><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line medium" /></div>)}</section>)}</div>;
}

function TaskEmptyState({ searchActive, onCreateTask }) {
  return <section className="empty task-empty"><Squares2X2Icon /><h2>{searchActive ? "No matching tasks" : "No tasks yet"}</h2><p>{searchActive ? "Try a different search term or clear your search to see all tasks." : "Create your first task to start organizing your work."}</p>{!searchActive ? <button className="primary" type="button" onClick={() => onCreateTask("todo")}><PlusIcon />Create task</button> : null}</section>;
}

function Avatar({ name = "Task", small = false }) {
  const safeName = name ?? "Task";
  const initials = safeName.split(" ").filter(Boolean).map((item) => item[0]).join("").slice(0, 2);
  return <span className={`avatar ${small ? "small" : ""}`}>{initials}</span>;
}

function TaskCard({ task, onToast, onCreateTask }) {
  const dispatch = useDispatch();
  const activeTaskId = useSelector((state) => state.ui.taskId);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
  const [menuOpen, setMenuOpen] = useState(false);
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, position: "relative" } : { position: "relative" };

  const openTaskDetails = () => dispatch(openTask(task.id));

  const closeMenu = () => setMenuOpen(false);

  const handleDelete = () => {
    toast("Delete this task?", {
      action: {
        label: "Delete",
        onClick: () => {
          dispatch(deleteTask(task.id));
          if (task.id === activeTaskId) dispatch(closeTask());
          toast.success("Task deleted");
        },
      },
    });
    closeMenu();
  };

  const handleDuplicate = () => {
    dispatch(duplicateTask(task.id));
    onToast("Task duplicated");
    closeMenu();
  };

  const handleEdit = () => {
    dispatch(closeTask());
    onCreateTask(task.status);
    dispatch(openCreateTask(task));
    closeMenu();
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      layout
      whileHover={{ y: -2 }}
      className="task-card"
      onClick={openTaskDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openTaskDetails();
        }
      }}
      tabIndex={0}
      role="button"
    >
      <div className="task-top">
        <span className={`priority ${task.priority}`}></span>
        <span className="task-id">{task.key}</span>
        {task.managerName ? <span style={{ marginLeft: 6, fontSize: 10, color: "#5144c6", background: "#f0efff", padding: "2px 6px", borderRadius: 999 }}>{task.managerName}</span> : null}
        <button type="button" onClick={(event) => { event.stopPropagation(); setMenuOpen((value) => !value); }} style={{ marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EllipsisHorizontalIcon />
        </button>
      </div>
      <strong>{task.title}</strong>
      <div className="tags">{(task.labels ?? []).map((label) => <span key={label}>{label}</span>)}</div>
      <div className="task-foot">
        <Avatar name={task.assignee ?? task.managerName} small />
        <span>{task.due ?? "No date"}</span>
        <span className="comments">◌ {task.comments ?? 0}</span>
      </div>
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ position: "absolute", right: 10, top: 36, background: "#fff", border: "1px solid #e6e8ec", borderRadius: 10, boxShadow: "0 12px 30px rgba(16, 24, 40, 0.14)", minWidth: 140, zIndex: 5 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left", fontSize: 12 }} onClick={handleEdit}>Edit</button>
            <button type="button" style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left", fontSize: 12 }} onClick={handleDuplicate}>Duplicate</button>
            <button type="button" style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left", fontSize: 12 }} onClick={handleDelete}>Delete</button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function Board({ tasks, onToast, onCreateTask, searchActive }) {
  const dispatch = useDispatch();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (!tasks.length) return <TaskEmptyState searchActive={searchActive} onCreateTask={onCreateTask} />;

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || !statusMeta[over.id]) return;

    dispatch(moveTask({ id: active.id, status: over.id }));
  };

  return (
    <DndContext id="taskmatrix-project-board" sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="board">
        {Object.entries(statusMeta).map(([status, [label, tone]]) => (
          <BoardColumn
            key={status}
            status={status}
            label={label}
            tone={tone}
            tasks={tasks.filter((task) => task.status === status)}
            onToast={onToast}
            onCreateTask={onCreateTask}
          />
        ))}
      </div>
    </DndContext>
  );
}

function BoardColumn({ status, label, tone, tasks, onToast, onCreateTask }) {
  const { setNodeRef } = useDroppable({ id: status });
  const hasTasks = tasks.length > 0;

  return (
    <section className="column">
      <div className="column-head">
        <span><i className={tone}></i>{label}</span>
        <b>{tasks.length}</b>
        <button type="button" onClick={() => onCreateTask(status)} style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}><PlusIcon /></button>
      </div>
      <div ref={setNodeRef} className="task-stack">
        {hasTasks ? (
          tasks.map((task) => <TaskCard task={task} key={task.id} onToast={onToast} onCreateTask={onCreateTask} />)
        ) : (
          <div style={{ border: "1px dashed #dfe3eb", borderRadius: 12, padding: "16px 14px", display: "grid", gap: 8, textAlign: "center", color: "#8b95a5" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#556174" }}>No tasks yet</div>
            <div style={{ fontSize: 11, lineHeight: 1.5 }}>Add a task to start this lane.</div>
            <button type="button" className="add-task" onClick={() => onCreateTask(status)} style={{ justifyContent: "center" }}><PlusIcon /> Add task</button>
          </div>
        )}
        {hasTasks ? <button type="button" className="add-task" onClick={() => onCreateTask(status)}><PlusIcon /> Add task</button> : null}
      </div>
    </section>
  );
}

function Sidebar({ projectManager, taskCount, companyName, workspaceName }) {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const closeMenu = () => dispatch(closeSidebar());

  return (
    <>
      <div className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`} onClick={closeMenu} />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><CommandLineIcon /></span>
          <b>TaskMatrix</b>
          <button className="mobile-close" type="button" onClick={closeMenu}><XMarkIcon /></button>
        </div>
        <button className="workspace" type="button" onClick={closeMenu}>
          <span className="workspace-logo">{(companyName || workspaceName || projectManager || "W").charAt(0).toUpperCase()}</span>
          <span><b>{companyName || projectManager || "Workspace"}</b><small>{workspaceName || "Active workspace"}</small></span>
          <ChevronDownIcon />
        </button>
        <nav>
          {nav.map(([label, Icon, href], index) => (
            <Link href={href} className={index === 0 ? "active" : ""} key={label} onClick={closeMenu}>
              <Icon />
              {label}
              {label === "My tasks" ? <em>{taskCount}</em> : null}
            </Link>
          ))}
        </nav>
        <div className="side-bottom">
          <Link href="/settings" onClick={closeMenu}><Cog6ToothIcon />Settings</Link>
          <Link href="/profile" className="person" onClick={closeMenu}>
            <Avatar name={projectManager || "You"} />
            <span><b>{projectManager || "Your profile"}</b><small>{projectManager ? "Workspace owner" : "Profile"}</small></span>
            <ChevronDownIcon />
          </Link>
        </div>
      </aside>
    </>
  );
}

function TaskDrawer({ onToast }) {
  const dispatch = useDispatch();
  const taskId = useSelector((state) => state.ui.taskId);
  const task = useSelector((state) => state.tasks.items.find((item) => item.id === taskId));
  const teamMembers = useSelector((state) => state.members.items);
  const [form, setForm] = useState(initialFormState);
  const [commentDraft, setCommentDraft] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!task) return;
    setForm(buildTaskFormState(task));
    setCommentDraft("");
    setError("");
  }, [task]);

  if (!task) return null;

  const updateField = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleSave = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.status || !form.priority || !form.managerName.trim() || !form.assignee.trim() || !form.due.trim()) {
      setError("Please fill every required field.");
      return;
    }

    const payload = buildTaskPayload({ ...form, labels: form.labels }, task, {
      comments: task.comments ?? 0,
    });
    dispatch(updateTask(payload));
    onToast("Task updated");
    dispatch(closeTask());
  };

  const handleComment = () => {
    if (!commentDraft.trim()) return;
    dispatch(updateTask({ ...task, comments: (task.comments ?? 0) + 1 }));
    onToast("Comment saved");
    setCommentDraft("");
  };

  const handleGenerateSubtasks = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Add a title and description before generating subtasks.");
      return;
    }
    setIsGenerating(true);
    const toastId = toast.loading("Generating subtasks...");
    try {
      updateField("subtasks", await generateSubtasks(form.title, form.description));
      toast.success("Five subtasks generated", { id: toastId });
    } catch (generationError) {
      toast.error(generationError.message, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {task ? (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => dispatch(closeTask())}>
          <motion.aside className="drawer" initial={{ x: 560 }} animate={{ x: 0 }} exit={{ x: 560 }} transition={{ type: "spring", damping: 28 }} onClick={(event) => event.stopPropagation()}>
            <header><span className="task-id">{task.key}</span><button onClick={() => dispatch(closeTask())}><XMarkIcon /></button></header>
            <div className="drawer-body">
              <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
                <div className="select-row">
                  <span className={`status-pill ${task.status}`}>{statusMeta[task.status][0]}</span>
                  <span className={`priority-label ${task.priority}`}>{task.priority} priority</span>
                </div>
                <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                  Title
                  <input value={form.title} onChange={(event) => updateField("title", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} required />
                </label>
                <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                  Description
                  <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", minHeight: 88, resize: "vertical", background: "#fff" }} required />
                </label>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                  <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                    Status
                    <select value={form.status} onChange={(event) => updateField("status", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }}>
                      {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                    Priority
                    <select value={form.priority} onChange={(event) => updateField("priority", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }}>
                      {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                </div>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                  <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                    Manager Name
                    <select value={form.managerName} onChange={(event) => updateField("managerName", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} required>
                      <option value="">Select manager</option>
                      {teamMembers.map((member) => <option key={member.id} value={member.name}>{member.name}</option>)}
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                    Assignee
                    <select value={form.assignee} onChange={(event) => updateField("assignee", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} required>
                      <option value="">Select assignee</option>
                      {teamMembers.map((member) => <option key={`${member.id}-assignee`} value={member.name}>{member.name}</option>)}
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </label>
                </div>
                <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                  Due date
                  <input value={form.due} onChange={(event) => updateField("due", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} required />
                </label>
                <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                  Labels
                  <input value={form.labels} onChange={(event) => updateField("labels", event.target.value)} placeholder="Design, Marketing" style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} />
                </label>
                <div className="subtask-section"><button className="ghost" type="button" onClick={handleGenerateSubtasks} disabled={isGenerating}>{isGenerating ? "Generating subtasks..." : "Generate Subtasks"}</button><Subtasks items={form.subtasks} /></div>
                {error ? <div style={{ color: "#c6535b", fontSize: 12 }}>{error}</div> : null}
                <div className="detail-grid"><span>Manager</span><b>{task.managerName || "Not assigned"}</b><span>Assignee</span><b>{task.assignee || "Not assigned"}</b><span>Due date</span><b>{task.due || "No due date"}</b><span>Project</span><b>{projectConfig.projectName || "Current workspace"}</b></div>
                <h3>Activity</h3>
                <div className="activity"><Avatar small name={task.managerName ?? task.assignee ?? "You"} /><p><b>{task.managerName || task.assignee || "You"}</b> updated this task in the workspace<small>{task.comments ? `${task.comments} comment${task.comments === 1 ? "" : "s"}` : "No comments yet"}</small></p></div>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>Comments</label>
                  <textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Write a comment…" style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", minHeight: 78, resize: "vertical", background: "#fff" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#8b95a5" }}>{task.comments ?? 0} comments</span>
                    <button type="button" onClick={handleComment} style={{ borderRadius: 8, padding: "8px 12px", background: "#3d3a70", color: "#fff", fontSize: 12 }}>Add comment</button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button type="button" onClick={() => dispatch(closeTask())} style={{ borderRadius: 8, padding: "10px 14px", border: "1px solid #e6e8ec", background: "#fff" }}>Cancel</button>
                  <button type="submit" style={{ borderRadius: 8, padding: "10px 14px", background: "#5144c6", color: "#fff" }}>Save</button>
                </div>
              </form>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function TaskModal({ onToast, defaultStatus = "todo" }) {
  const dispatch = useDispatch();
  const { createTaskModal, editingTask } = useSelector((state) => state.ui);
  const teamMembers = useSelector((state) => state.members.items);
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!createTaskModal) return;
    setForm(buildTaskFormState(editingTask, defaultStatus));
    setError("");
  }, [createTaskModal, editingTask, defaultStatus]);

  if (!createTaskModal) return null;

  const updateField = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.status || !form.priority || !form.managerName.trim() || !form.assignee.trim() || !form.due.trim()) {
      setError("Please fill every required field.");
      return;
    }

    const payload = buildTaskPayload({ ...form, labels: form.labels }, editingTask);

    if (editingTask) {
      dispatch(updateTask(payload));
      onToast("Task updated");
    } else {
      dispatch(addTask(payload));
      onToast("Task created");
    }
    dispatch(closeCreateTask());
  };

  const handleGenerateSubtasks = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Add a title and description before generating subtasks.");
      return;
    }
    setIsGenerating(true);
    const toastId = toast.loading("Generating subtasks...");
    try {
      updateField("subtasks", await generateSubtasks(form.title, form.description));
      toast.success("Five subtasks generated", { id: toastId });
    } catch (generationError) {
      toast.error(generationError.message, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {createTaskModal ? (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ justifyContent: "center", alignItems: "center", padding: 24 }} onClick={() => dispatch(closeCreateTask())}>
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} style={{ width: "min(620px, 100%)", background: "#fff", borderRadius: 16, boxShadow: "0 24px 70px rgba(16, 24, 40, 0.16)", border: "1px solid #e6e8ec", maxHeight: "90vh", overflowY: "auto" }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e6e8ec" }}>
              <div>
                <div className="task-id">{editingTask ? "Edit task" : "Create task"}</div>
                <h3 style={{ margin: "4px 0 0", fontSize: 20 }}>{editingTask ? "Edit task" : "New task"}</h3>
              </div>
              <button type="button" onClick={() => dispatch(closeCreateTask())}><XMarkIcon /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, padding: "24px" }}>
              <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                Title
                <input value={form.title} onChange={(event) => updateField("title", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} required />
              </label>
              <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                Description
                <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", minHeight: 88, resize: "vertical", background: "#fff" }} required />
              </label>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                  Status
                  <select value={form.status} onChange={(event) => updateField("status", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }}>
                    {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                  Priority
                  <select value={form.priority} onChange={(event) => updateField("priority", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }}>
                    {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                  Manager Name
                  <select value={form.managerName} onChange={(event) => updateField("managerName", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} required>
                    <option value="">Select manager</option>
                    {teamMembers.map((member) => <option key={`modal-${member.id}`} value={member.name}>{member.name}</option>)}
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                  Assignee
                  <select value={form.assignee} onChange={(event) => updateField("assignee", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} required>
                    <option value="">Select assignee</option>
                    {teamMembers.map((member) => <option key={`modal-assignee-${member.id}`} value={member.name}>{member.name}</option>)}
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </label>
              </div>
              <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                Due date
                <input value={form.due} onChange={(event) => updateField("due", event.target.value)} style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} required />
              </label>
              <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 700 }}>
                Labels
                <input value={form.labels} onChange={(event) => updateField("labels", event.target.value)} placeholder="Design, Marketing" style={{ border: "1px solid #e6e8ec", borderRadius: 8, padding: "10px 12px", background: "#fff" }} />
              </label>
              <div className="subtask-section"><button className="ghost" type="button" onClick={handleGenerateSubtasks} disabled={isGenerating}>{isGenerating ? "Generating subtasks..." : "Generate Subtasks"}</button><Subtasks items={form.subtasks} /></div>
              {error ? <div style={{ color: "#c6535b", fontSize: 12 }}>{error}</div> : null}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button type="button" onClick={() => dispatch(closeCreateTask())} style={{ borderRadius: 8, padding: "10px 14px", border: "1px solid #e6e8ec", background: "#fff" }}>Cancel</button>
                <button type="submit" style={{ borderRadius: 8, padding: "10px 14px", background: "#5144c6", color: "#fff" }}>{editingTask ? "Save changes" : "Create task"}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { items, query } = useSelector((state) => state.tasks);
  const dark = useSelector((state) => state.theme.dark);
  const profile = useSelector((state) => state.profile);
  const unread = useSelector((state) => state.notifications.unread);
  const members = useSelector((state) => state.members.items);
  const [tab, setTab] = useState("Board");
  const [isLoading, setIsLoading] = useState(true);
  const [modalStatus, setModalStatus] = useState("todo");
  const [notificationOpen, setNotificationOpen] = useState(false);

  const tasks = useMemo(() => filterTasksByQuery(items, query), [items, query]);
  const projectManager = getProjectOwner(items);
  const projectStats = useMemo(() => getDashboardStats(items), [items]);
  const { completionPercent, openTaskCount, dueThisWeek, memberCount, memberNames, completedTasks } = projectStats;
  const activeMemberCount = useMemo(() => members.filter((member) => member.status === "Active").length, [members]);
  const notificationItems = useMemo(() => getNotifications(items, profile), [items, profile]);
  const currentUserName = profile.name?.trim() || projectManager || "You";
  const workspaceTitle = profile.name?.trim() || "Workspace";
  const workspaceTag = profile.title?.trim() || "Personal workspace";
  const summary = tasks.length ? `${tasks.length} task${tasks.length === 1 ? "" : "s"} in view` : "No tasks yet";

  useEffect(() => { setIsLoading(false); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setNotificationOpen(false);
        dispatch(closeSidebar());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { body } = window.document;
    body.style.overflow = notificationOpen ? "hidden" : "";
    return () => {
      body.style.overflow = "";
    };
  }, [notificationOpen]);

  const handleCreateTask = (status = "todo") => {
    setModalStatus(status);
    dispatch(openCreateTask());
  };

  return (
    <main className={dark ? "app dark min-h-screen" : "app min-h-screen"}>
      <Sidebar projectManager={currentUserName} taskCount={openTaskCount} companyName={profile.name?.trim() || ""} workspaceName={workspaceTag} />
      <div className="content">
        <header className="topbar">
          <button className="menu" type="button" onClick={() => dispatch(toggleSidebar())}>☰</button>
          <div className="crumb"><span>Workspace</span><b>/</b><strong>{workspaceTitle}</strong></div>
          <label className="search">
            <MagnifyingGlassIcon />
            <input value={query} onChange={(event) => dispatch(setQuery(event.target.value))} placeholder="Search tasks…" />
            <kbd>⌘ K</kbd>
          </label>
          <button className="icon-button" type="button" onClick={() => dispatch(toggleTheme())}>{dark ? <MoonIcon /> : <MoonIcon />}</button>
          <button className="icon-button notification" type="button" onClick={() => setNotificationOpen((value) => !value)}>
            <BellIcon />
            {notificationItems.length > 0 ? <i /> : null}
          </button>
          <Avatar name={currentUserName} />
        </header>
        {notificationOpen ? (
          <div className="notice-panel">
            <div className="notice-head">
              <strong>Activity</strong>
              <button type="button" onClick={() => setNotificationOpen(false)}>Close</button>
            </div>
            {notificationItems.length ? notificationItems.map((item) => (
              <div key={item.id} className="notice-item">
                <div>
                  <b>{item.title}</b>
                  <p>{item.detail}</p>
                </div>
                <span>{item.time}</span>
              </div>
            )) : <div className="notice-empty">No recent activity yet.</div>}
          </div>
        ) : null}
        <section className="page-head">
          <div>
            <div className="eyebrow">{workspaceTag || "Workspace"}</div>
            <h1>{workspaceTitle}</h1>
            <p>{summary} · Owner: {projectManager || currentUserName || "You"}</p>
          </div>
          <div className="head-actions">
            <button className="ghost" type="button"><FunnelIcon />Filter</button>
            <button className="primary" type="button" onClick={() => handleCreateTask("todo")}><PlusIcon />New task</button>
          </div>
        </section>
        <section className="metrics">
          <div><span>Completion</span><b>{completionPercent}%</b><progress value={completionPercent} max="100" /></div>
          <div><span>Open tasks</span><b>{openTaskCount}</b><small className="up">{openTaskCount > 0 ? `${openTaskCount} active` : "0 active"}</small></div>
          <div>
            <span>Due this week</span>
            <b>{dueThisWeek}</b>
            <div className="avatar-row">{memberNames.length ? memberNames.map((memberName, index) => <Avatar key={`${memberName}-${index}`} name={memberName} small />) : <span className="empty-pill">No assignees yet</span>}</div>
          </div>
          <div><span>Project members</span><b>{activeMemberCount}</b><div className="pill-row"><span>{completedTasks} completed</span></div></div>
        </section>
        <div className="tabbar">
          {tabOptions.map((value) => <button key={value} className={tab === value ? "selected" : ""} onClick={() => setTab(value)}>{value}</button>)}
          <span />
          <button className="view-button" type="button"><Squares2X2Icon />View</button>
        </div>
        {isLoading ? <BoardSkeleton /> : tab === "Board" ? (items.length ? <Board tasks={tasks} searchActive={Boolean(query.trim())} onToast={(message) => toast.success(message)} onCreateTask={handleCreateTask} /> : <TaskEmptyState searchActive={false} onCreateTask={handleCreateTask} />) : <section className="empty"><CalendarDaysIcon /><h2>{tab} view</h2><p>{tasks.length ? "Your workspace is ready for the next update." : "Add your first task to populate this view."}</p></section>}
      </div>
      <TaskDrawer onToast={(message) => toast.success(message)} />
      <TaskModal onToast={(message) => toast.success(message)} defaultStatus={modalStatus} />
    </main>
  );
}
