"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { useAuth } from "@/hooks/useAuth";
import type { Permission } from "@/lib/permissions";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  perm?: Permission;
  separator?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",    label: "Dashboard",          icon: "📊", href: "/dashboard" },
  { id: "projects",     label: "Dossiers couleur",   icon: "📁", href: "/projects",     perm: "project.read" },
  { id: "trials",       label: "Essais",             icon: "🔬", href: "/trials",       perm: "trial.read" },
  { id: "sep1",         label: "",                   icon: "",   href: "",             separator: true },
  { id: "spectro",      label: "Spectrocolorimetre", icon: "🌈", href: "/spectro",      perm: "measure.read" },
  { id: "densito",      label: "Densitometre",       icon: "📈", href: "/densito",       perm: "measure.read" },
  { id: "sep2",         label: "",                   icon: "",   href: "",             separator: true },
  { id: "formulations", label: "Formulations",       icon: "🧪", href: "/formulations", perm: "formulation.read" },
  { id: "recipes",      label: "Recettes",           icon: "📕", href: "/formulations/recipes", perm: "library.read" },
  { id: "sep3",         label: "",                   icon: "",   href: "",             separator: true },
  { id: "validation",   label: "Validation Labo",    icon: "✅", href: "/validation",   perm: "validation.read" },
  { id: "production",   label: "Suivi Production",   icon: "⚙️", href: "/production",   perm: "production.read" },
  { id: "qc",           label: "Controle Qualite",   icon: "🛡️", href: "/qc",           perm: "qc.read" },
  { id: "sep4",         label: "",                   icon: "",   href: "",             separator: true },
  { id: "metal",        label: "Offset Metal",       icon: "🔩", href: "/metal",        perm: "metal.read" },
  { id: "tints",        label: "Bibl. Teintes",      icon: "🎨", href: "/tints",        perm: "library.read" },
  { id: "ai",           label: "Agent IA",           icon: "🤖", href: "/ai",           perm: "ai.use" },
  { id: "sep5",         label: "",                   icon: "",   href: "",             separator: true },
  { id: "settings",     label: "Parametres",         icon: "⚙️", href: "/settings",     perm: "settings.read" },
  { id: "users",        label: "Utilisateurs",       icon: "👥", href: "/users",        perm: "users.manage" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { can, user, role } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[60px]" : "w-[240px]"
      }`}
      style={{ background: "#0C1B2E" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent-blue/30 flex items-center justify-center text-lg flex-shrink-0">
          🎨
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-sm leading-tight">ColorLab Pro</div>
            <div className="text-[10px] text-slate-500 leading-tight">MULTIPRINT S.A.</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          // Separator
          if (item.separator) {
            return (
              <div key={item.id} className="my-2 mx-3 border-t border-white/5" />
            );
          }

          // Permission check
          if (item.perm && !can(item.perm)) return null;

          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                active
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 border-t border-white/10 text-slate-500 hover:text-white transition-colors"
        title={collapsed ? "Ouvrir" : "Reduire"}
      >
        <span className={`text-xs transition-transform ${collapsed ? "rotate-180" : ""}`}>
          ◀
        </span>
      </button>
    </aside>
  );
}
