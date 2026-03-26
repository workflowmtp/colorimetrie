"use client";

import { useAppStore } from "@/stores/app-store";

const ICONS: Record<string, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const COLORS: Record<string, string> = {
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};

export default function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up min-w-[280px] max-w-[420px]"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            borderLeft: `3px solid ${COLORS[toast.type] ?? COLORS.info}`,
          }}
        >
          <span className="text-base flex-shrink-0">{ICONS[toast.type] ?? ICONS.info}</span>
          <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-xs flex-shrink-0 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
