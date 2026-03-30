"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import ToastContainer from "@/components/ui/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: isDesktop ? (collapsed ? 60 : 240) : 0 }}
      >
        {/* Header */}
        <Header />

        {/* Content — pt-16 sur mobile pour laisser place au hamburger */}
        <main className={`p-3 md:p-6 ${!isDesktop ? "pt-16" : ""}`}>
          {children}
        </main>
      </div>

      {/* Global overlays */}
      <Modal />
      <ToastContainer />
    </div>
  );
}
