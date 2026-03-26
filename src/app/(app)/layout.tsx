"use client";

import { useAppStore } from "@/stores/app-store";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import ToastContainer from "@/components/ui/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? 60 : 240 }}
      >
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Global overlays */}
      <Modal />
      <ToastContainer />
    </div>
  );
}
