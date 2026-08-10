"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store, storageKey, hydrateTasks, hydrateUi, hydrateTheme, hydrateNotifications, hydrateProfile, hydrateMembers } from "@/redux/store";

export default function Providers({ children }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.tasks) {
        store.dispatch(hydrateTasks({ items: (parsed.tasks.items || []).filter((task) => !["t1", "t2", "t3", "t4", "t5", "t6", "t7"].includes(task.id)), query: parsed.tasks.query || "" }));
      }
      if (parsed?.ui) store.dispatch(hydrateUi(parsed.ui));
      if (parsed?.theme) store.dispatch(hydrateTheme(parsed.theme));
      if (parsed?.profile) store.dispatch(hydrateProfile(parsed.profile));
      if (parsed?.notifications) store.dispatch(hydrateNotifications(parsed.notifications));
      if (parsed?.members) store.dispatch(hydrateMembers(parsed.members));
    } catch {}
  }, []);
  return <Provider store={store}>{children}<Toaster richColors position="bottom-right" /></Provider>;
}
