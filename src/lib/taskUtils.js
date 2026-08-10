export const statusMeta = {
  backlog: ["Backlog", "slate"],
  todo: ["To do", "blue"],
  progress: ["In progress", "amber"],
  done: ["Done", "green"],
};

export const priorityOptions = ["low", "medium", "high"];
export const statusOptions = Object.entries(statusMeta).map(([value, [label]]) => ({ value, label }));
export const projectConfig = {
  projectName: "",
  companyName: "",
  workspaceName: "",
};
export const initialFormState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  managerName: "",
  assignee: "",
  due: "",
  labels: "",
  subtasks: [],
};

export const createTaskId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

export const createTaskKey = (prefix = "WEB") => {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().split("-")[0].slice(0, 3).toUpperCase()
      : `${Date.now()}`.slice(-3).toUpperCase();

  return `${prefix}-${suffix}`;
};

export const parseLabels = (labels) => {
  if (Array.isArray(labels)) {
    return labels.map((label) => label.trim()).filter(Boolean);
  }

  if (typeof labels === "string") {
    return labels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);
  }

  return [];
};

export const buildTaskFormState = (task = null, defaultStatus = "todo") => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  status: task?.status ?? defaultStatus,
  priority: task?.priority ?? "medium",
  managerName: task?.managerName ?? "",
  assignee: task?.assignee ?? "",
  due: task?.due ?? "",
  labels: Array.isArray(task?.labels) ? task.labels.join(", ") : "",
  subtasks: Array.isArray(task?.subtasks) ? task.subtasks : [],
});

export const buildTaskPayload = (form, editingTask = null, overrides = {}) => {
  const baseTask = {
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    priority: form.priority,
    managerName: form.managerName.trim(),
    assignee: form.assignee.trim(),
    due: form.due.trim(),
    labels: parseLabels(form.labels),
    subtasks: Array.isArray(form.subtasks) ? form.subtasks.filter(Boolean) : [],
    comments: editingTask?.comments ?? 0,
    ...overrides,
  };

  if (editingTask) {
    return {
      ...editingTask,
      ...baseTask,
    };
  }

  return {
    ...baseTask,
    id: createTaskId(),
    key: createTaskKey(),
  };
};

export const buildTaskSearchQuery = (query = "") => query.trim().toLowerCase();

export const filterTasksByQuery = (tasks, query = "") => {
  const normalizedQuery = buildTaskSearchQuery(query);

  if (!normalizedQuery) {
    return tasks;
  }

  return tasks.filter((task) => (task.title ?? "").toLowerCase().includes(normalizedQuery));
};

const createUniqueValues = (values = []) => Array.from(new Set(values.filter(Boolean)));

export const getProjectOwner = (tasks = []) => {
  const owners = createUniqueValues([
    ...(tasks.map((task) => task.managerName?.trim()).filter(Boolean)),
    ...(tasks.map((task) => task.assignee?.trim()).filter(Boolean)),
  ]);

  return owners[0] ?? "";
};

export const getDashboardStats = (tasks = []) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const openTaskCount = tasks.filter((task) => task.status !== "done").length;
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const dueThisWeek = tasks.filter((task) => {
    const dueValue = `${task.due ?? ""}`.trim();
    return dueValue !== "" && task.status !== "done";
  }).length;
  const memberNames = createUniqueValues([
    ...(tasks.map((task) => task.managerName?.trim()).filter(Boolean)),
    ...(tasks.map((task) => task.assignee?.trim()).filter(Boolean)),
  ]).slice(0, 4);

  return {
    completionPercent,
    openTaskCount,
    dueThisWeek,
    memberCount: memberNames.length,
    memberNames,
    completedTasks,
    projectCount: totalTasks > 0 ? 1 : 0,
  };
};

export const getNotifications = (tasks = [], profile = {}) => {
  const actorName = `${profile.name ?? ""}`.trim() || "A teammate";
  return tasks
    .slice()
    .sort((left, right) => (right.comments ?? 0) - (left.comments ?? 0))
    .slice(0, 5)
    .map((task, index) => ({
      id: task.id ?? `notification-${index}`,
      title: `${task.assignee?.trim() || task.managerName?.trim() || actorName} updated ${task.title?.trim() || "a task"}`,
      detail: task.due ? `Due ${task.due}` : "No due date",
      time: task.status === "done" ? "Completed" : "Updated",
    }));
};

export const isPersistableTask = (task = {}) => !["t1", "t2", "t3", "t4", "t5", "t6", "t7"].includes(task.id);
