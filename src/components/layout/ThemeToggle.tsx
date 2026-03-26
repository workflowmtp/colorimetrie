"use client";

import { useAppStore } from "@/stores/app-store";

export default function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-sm gap-1.5"
      title={theme === "dark" ? "Passer en clair" : "Passer en sombre"}
    >
      <span>{theme === "dark" ? "☀️" : "🌙"}</span>
      <span className="text-xs">Theme</span>
    </button>
  );
}
