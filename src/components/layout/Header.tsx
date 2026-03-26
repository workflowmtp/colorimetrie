"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Dossiers couleur",
  "/projects/new": "Nouveau dossier",
  "/trials": "Essais",
  "/spectro": "Spectrocolorimetre",
  "/densito": "Densitometre",
  "/formulations": "Formulations",
  "/formulations/recipes": "Bibliotheque recettes",
  "/validation": "Validation Labo",
  "/production": "Suivi Production",
  "/qc": "Controle Qualite",
  "/metal": "Offset Metal",
  "/tints": "Bibliotheque Teintes",
  "/ai": "Agent IA ColorLab",
  "/settings": "Parametres",
  "/users": "Utilisateurs",
};

function getPageTitle(pathname: string): string {
  // Exact match
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Project detail
  if (pathname.match(/^\/projects\/[^/]+$/)) return "Fiche dossier";
  if (pathname.match(/^\/projects\/[^/]+\/edit$/)) return "Modifier dossier";
  // Trial detail
  if (pathname.match(/^\/trials\/[^/]+$/)) return "Detail essai";
  // Fallback: extract last segment
  const segments = pathname.split("/").filter(Boolean);
  return PAGE_TITLES["/" + segments[0]] || "ColorLab Pro";
}

export default function Header() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const title = getPageTitle(pathname);

  // Breadcrumb parts
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumb = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    return PAGE_TITLES[path] || seg;
  });

  return (
    <header
      className="h-16 border-b flex items-center justify-between px-6 sticky top-0 z-30"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
        marginLeft: collapsed ? 60 : 240,
        transition: "margin-left 0.3s",
      }}
    >
      {/* Left: Breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>ColorLab Pro</span>
          {breadcrumb.map((part, i) => (
            <span key={i}>
              <span className="mx-1">/</span>
              <span className={i === breadcrumb.length - 1 ? "font-semibold" : ""} style={i === breadcrumb.length - 1 ? { color: "var(--text-primary)" } : undefined}>
                {part}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
