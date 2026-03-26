"use client";

import { useAppStore } from "@/stores/app-store";

export function useToast() {
  const addToast = useAppStore((s) => s.addToast);

  return {
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    warning: (msg: string) => addToast(msg, "warning"),
    info: (msg: string) => addToast(msg, "info"),
  };
}
