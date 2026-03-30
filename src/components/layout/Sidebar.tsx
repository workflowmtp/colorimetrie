"use client";

import { useState, useEffect } from "react";
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
  const { can } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fermer le menu mobile quand on navigue
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fermer le menu mobile si on redimensionne vers desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent-blue/30 flex items-center justify-center text-lg flex-shrink-0">
          🎨
        </div>
        {(!collapsed || mobileOpen) && (
          <div className="overflow-hidden flex-1">
            <div className="text-white font-bold text-sm leading-tight">ColorLab Pro</div>
            <div className="text-[10px] text-slate-500 leading-tight">MULTIPRINT S.A.</div>
          </div>
        )}
        {/* Bouton fermer mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden ml-auto text-slate-400 hover:text-white p-1"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          if (item.separator) {
            return (
              <div key={item.id} className="my-2 mx-3 border-t border-white/5" />
            );
          }
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
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
              {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop uniquement) */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex items-center justify-center h-10 border-t border-white/10 text-slate-500 hover:text-white transition-colors"
        title={collapsed ? "Ouvrir" : "Reduire"}
      >
        <span className={`text-xs transition-transform ${collapsed ? "rotate-180" : ""}`}>
          ◀
        </span>
      </button>
    </>
  );

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg flex items-center justify-center text-white"
        style={{ background: "#0C1B2E" }}
      >
        <span className="text-lg">☰</span>
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen z-50 flex flex-col w-[260px] transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#0C1B2E" }}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar desktop */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-screen z-40 flex-col transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-[240px]"
        }`}
        style={{ background: "#0C1B2E" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
