"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export default function Modal() {
  const { modalOpen, modalTitle, modalContent, modalSize, closeModal } = useAppStore();

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && modalOpen) closeModal();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className={`modal-container ${modalSize === "large" ? "large" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            {modalTitle}
          </h3>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {modalContent}
        </div>
      </div>
    </div>
  );
}
