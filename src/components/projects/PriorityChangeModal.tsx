"use client";

import { PRIORITY_META } from "@/lib/constants";
import { Button } from "@/components/ui";
import type { Priority } from "@prisma/client";

interface Props {
  projectId: string;
  currentPriority: Priority;
  codeDossier: string;
  onConfirm: (projectId: string, newPriority: string) => void;
}

export function PriorityChangeModal({ projectId, currentPriority, codeDossier, onConfirm }: Props) {
  const options: Array<{ key: Priority; label: string; icon: string; color: string }> = [
    { key: "normale",  label: "Normale",  icon: "⚪", color: "#94A3B8" },
    { key: "haute",    label: "Haute",    icon: "🔸", color: "#F97316" },
    { key: "urgente",  label: "Urgente",  icon: "⚠️",  color: "#EF4444" },
  ];

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{codeDossier}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isCurrent = currentPriority === opt.key;
          return (
            <Button
              key={opt.key}
              variant={isCurrent ? "primary" : "ghost"}
              className="w-full justify-start gap-2"
              disabled={isCurrent}
              onClick={() => onConfirm(projectId, opt.key)}
            >
              <span style={{ color: opt.color }}>{opt.icon}</span> {opt.label}
              {isCurrent && <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>(actuel)</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
