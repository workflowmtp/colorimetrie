// ================================================================
// COLORLAB PRO — ZUSTAND APP STORE
// Etat global: sidebar, theme, modal, filtres, toasts
// ================================================================

import { create } from "zustand";
import type { ToastData } from "@/types";

interface AppState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;

  // Modal
  modalOpen: boolean;
  modalContent: React.ReactNode | null;
  modalTitle: string;
  modalSize: "default" | "large";
  openModal: (title: string, content: React.ReactNode, size?: "default" | "large") => void;
  closeModal: () => void;

  // Toasts
  toasts: ToastData[];
  addToast: (message: string, type?: ToastData["type"]) => void;
  removeToast: (id: string) => void;

  // Search / Filters
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Project list filters
  projectFilter: {
    status: string;
    process: string;
    priority: string;
    search: string;
  };
  setProjectFilter: (key: string, value: string) => void;
  resetProjectFilters: () => void;
}

const DEFAULT_FILTERS = {
  status: "all",
  process: "all",
  priority: "all",
  search: "",
};

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Theme
  theme: "dark",
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
        document.documentElement.classList.toggle("light", next === "light");
      }
      return { theme: next };
    }),
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.classList.toggle("light", theme === "light");
    }
    set({ theme });
  },

  // Modal
  modalOpen: false,
  modalContent: null,
  modalTitle: "",
  modalSize: "default",
  openModal: (title, content, size = "default") =>
    set({ modalOpen: true, modalTitle: title, modalContent: content, modalSize: size }),
  closeModal: () =>
    set({ modalOpen: false, modalContent: null, modalTitle: "", modalSize: "default" }),

  // Toasts
  toasts: [],
  addToast: (message, type = "success") =>
    set((s) => {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const toast: ToastData = { id, message, type, duration: 4000 };
      // Auto-remove after duration
      setTimeout(() => {
        set((s2) => ({ toasts: s2.toasts.filter((t) => t.id !== id) }));
      }, toast.duration);
      return { toasts: [...s.toasts, toast] };
    }),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Search
  globalSearch: "",
  setGlobalSearch: (q) => set({ globalSearch: q }),

  // Project filters
  projectFilter: { ...DEFAULT_FILTERS },
  setProjectFilter: (key, value) =>
    set((s) => ({
      projectFilter: { ...s.projectFilter, [key]: value },
    })),
  resetProjectFilters: () => set({ projectFilter: { ...DEFAULT_FILTERS } }),
}));
