import { configureStore, createSlice } from "@reduxjs/toolkit";

export const storageKey = "taskmatrix-state-v1";

const initialTasks = {
  items: [],
  query: "",
};

const initialUI = {
  sidebarOpen: false,
  taskId: null,
  createTaskModal: false,
  editingTask: null,
  selectedTask: null,
};

const initialTheme = {
  dark: false,
};

const initialProfile = {
  name: "",
  title: "",
  email: "",
  location: "",
  bio: "",
};

const initialNotifications = {
  unread: 0,
  items: [],
};

const initialMembers = {
  items: [],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState: initialTasks,
  reducers: {
    hydrateTasks: (state, action) => {
      const payload = action.payload ?? {};
      state.items = Array.isArray(payload.items) ? payload.items : [];
      state.query = payload.query ?? "";
    },

    moveTask: (state, action) => {
      const task = state.items.find((item) => item.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
      }
    },

    setQuery: (state, action) => {
      state.query = action.payload;
    },

    addTask: (state, action) => {
      const payload = action.payload ?? {};
      state.items.unshift({
        ...payload,
        comments: payload.comments ?? 0,
        labels: payload.labels ?? [],
      });
    },

    updateTask: (state, action) => {
      const payload = action.payload ?? {};
      const index = state.items.findIndex((task) => task.id === payload.id);

      if (index === -1) return;

      state.items[index] = {
        ...state.items[index],
        ...payload,
      };
    },

    deleteTask: (state, action) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },

    duplicateTask: (state, action) => {
      const task = state.items.find((item) => item.id === action.payload);
      if (!task) return;

      state.items.unshift({
        ...task,
        id: crypto.randomUUID(),
        key: `${task.key}-COPY`,
        title: `${task.title} Copy`,
        comments: 0,
      });
    },

    unassignMemberFromTasks: (state, action) => {
      const payload = action.payload ?? {};
      const memberName = `${payload.memberName ?? payload.name ?? ""}`.trim();
      const memberEmail = `${payload.memberEmail ?? payload.email ?? ""}`.trim();
      const replacement = payload.replacement ?? "Unassigned";

      state.items.forEach((task) => {
        const assignee = `${task.assignee ?? ""}`.trim();
        const manager = `${task.managerName ?? ""}`.trim();
        const shouldUnassign = assignee && (assignee === memberName || assignee === memberEmail || assignee.toLowerCase() === memberName.toLowerCase() || assignee.toLowerCase() === memberEmail.toLowerCase())
          || manager && (manager === memberName || manager === memberEmail || manager.toLowerCase() === memberName.toLowerCase() || manager.toLowerCase() === memberEmail.toLowerCase());

        if (!shouldUnassign) return;

        if (task.assignee && (task.assignee === memberName || task.assignee === memberEmail || task.assignee.toLowerCase() === memberName.toLowerCase() || task.assignee.toLowerCase() === memberEmail.toLowerCase())) {
          task.assignee = replacement;
        }

        if (task.managerName && (task.managerName === memberName || task.managerName === memberEmail || task.managerName.toLowerCase() === memberName.toLowerCase() || task.managerName.toLowerCase() === memberEmail.toLowerCase())) {
          task.managerName = replacement;
        }
      });
    },
  },
});

const uiSlice = createSlice({
  name: "ui",
  initialState: initialUI,
  reducers: {
    hydrateUi: (state, action) => {
      const payload = action.payload ?? {};

      state.sidebarOpen = Boolean(payload.sidebarOpen);
      state.taskId = payload.taskId ?? null;
      state.createTaskModal = Boolean(payload.createTaskModal);
      state.editingTask = payload.editingTask ?? null;
      state.selectedTask = payload.selectedTask ?? null;
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },

    openTask: (state, action) => {
      state.taskId = action.payload;
      state.selectedTask = action.payload;
    },

    closeTask: (state) => {
      state.taskId = null;
      state.selectedTask = null;
    },

    openCreateTask: (state, action) => {
      state.createTaskModal = true;
      state.editingTask = action.payload ?? null;
    },

    closeCreateTask: (state) => {
      state.createTaskModal = false;
      state.editingTask = null;
    },
  },
});

const themeSlice = createSlice({
  name: "theme",
  initialState: initialTheme,
  reducers: {
    hydrateTheme: (state, action) => {
      state.dark = Boolean(action.payload?.dark);
    },

    toggleTheme: (state) => {
      state.dark = !state.dark;
    },

    setTheme: (state, action) => {
      state.dark = Boolean(action.payload);
    },
  },
});

const profileSlice = createSlice({
  name: "profile",
  initialState: initialProfile,
  reducers: {
    hydrateProfile: (state, action) => {
      const payload = action.payload ?? {};
      state.name = payload.name ?? "";
      state.title = payload.title ?? "";
      state.email = payload.email ?? "";
      state.location = payload.location ?? "";
      state.bio = payload.bio ?? "";
    },

    updateProfile: (state, action) => {
      const payload = action.payload ?? {};
      state.name = payload.name ?? state.name;
      state.title = payload.title ?? state.title;
      state.email = payload.email ?? state.email;
      state.location = payload.location ?? state.location;
      state.bio = payload.bio ?? state.bio;
    },
  },
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: initialNotifications,
  reducers: {
    hydrateNotifications: (state, action) => {
      state.unread = Number(action.payload?.unread) || 0;
      state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
    },
  },
});

const membersSlice = createSlice({
  name: "members",
  initialState: initialMembers,
  reducers: {
    hydrateMembers: (state, action) => {
      const payload = action.payload ?? {};
      state.items = Array.isArray(payload.items) ? payload.items : [];
    },

    addMember: (state, action) => {
      const payload = action.payload ?? {};
      state.items.unshift({
        id: payload.id ?? crypto.randomUUID(),
        name: `${payload.name ?? ""}`.trim(),
        email: `${payload.email ?? ""}`.trim(),
        role: `${payload.role ?? ""}`.trim(),
        department: `${payload.department ?? ""}`.trim(),
        status: `${payload.status ?? "Active"}`.trim() || "Active",
        joinDate: `${payload.joinDate ?? ""}`.trim(),
        avatarUrl: `${payload.avatarUrl ?? ""}`.trim(),
      });
    },

    updateMember: (state, action) => {
      const payload = action.payload ?? {};
      const index = state.items.findIndex((member) => member.id === payload.id);
      if (index === -1) return;

      state.items[index] = {
        ...state.items[index],
        ...payload,
        id: payload.id ?? state.items[index].id,
        name: `${payload.name ?? state.items[index].name ?? ""}`.trim(),
        email: `${payload.email ?? state.items[index].email ?? ""}`.trim(),
        role: `${payload.role ?? state.items[index].role ?? ""}`.trim(),
        department: `${payload.department ?? state.items[index].department ?? ""}`.trim(),
        status: `${payload.status ?? state.items[index].status ?? "Active"}`.trim() || "Active",
        joinDate: `${payload.joinDate ?? state.items[index].joinDate ?? ""}`.trim(),
        avatarUrl: `${payload.avatarUrl ?? state.items[index].avatarUrl ?? ""}`.trim(),
      };
    },

    removeMember: (state, action) => {
      const memberId = action.payload;
      state.items = state.items.filter((member) => member.id !== memberId);
    },
  },
});

export const {
  hydrateTasks,
  moveTask,
  setQuery,
  addTask,
  updateTask,
  deleteTask,
  duplicateTask,
  unassignMemberFromTasks,
} = tasksSlice.actions;

export const {
  hydrateUi,
  toggleSidebar,
  closeSidebar,
  openTask,
  closeTask,
  openCreateTask,
  closeCreateTask,
} = uiSlice.actions;

export const {
  hydrateTheme,
  toggleTheme,
  setTheme,
} = themeSlice.actions;

export const {
  hydrateProfile,
  updateProfile,
} = profileSlice.actions;

export const {
  hydrateNotifications,
} = notificationsSlice.actions;

export const {
  hydrateMembers,
  addMember,
  updateMember,
  removeMember,
} = membersSlice.actions;

export const store = configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    ui: uiSlice.reducer,
    theme: themeSlice.reducer,
    profile: profileSlice.reducer,
    notifications: notificationsSlice.reducer,
    members: membersSlice.reducer,
  },
});

store.subscribe(() => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(store.getState()));
  } catch (error) {
    console.error("Failed to persist state:", error);
  }
});