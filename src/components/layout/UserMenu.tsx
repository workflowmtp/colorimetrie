"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_META } from "@/lib/permissions";

export default function UserMenu() {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const meta = ROLE_META[role];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
      >
        {/* Avatar circle */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: meta.color }}
        >
          {user?.nom?.charAt(0) ?? "?"}
        </div>
        <span className="text-sm font-medium hidden sm:inline" style={{ color: "var(--text-primary)" }}>
          {user?.nom ?? "Utilisateur"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-56 rounded-xl border shadow-lg py-2 animate-fade-in z-50"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {/* User info */}
          <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{user?.nom}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{user?.email}</div>
            <div className="mt-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{ background: meta.color + "20", color: meta.color }}
              >
                {meta.nom}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              🚪 Deconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
