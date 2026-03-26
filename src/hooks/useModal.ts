"use client";

import { useAppStore } from "@/stores/app-store";

export function useModal() {
  const openModal = useAppStore((s) => s.openModal);
  const closeModal = useAppStore((s) => s.closeModal);

  return { openModal, closeModal };
}
