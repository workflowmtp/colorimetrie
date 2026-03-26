"use client";

import { useAuth } from "@/hooks/useAuth";
import { getAvailableTransitions } from "@/lib/workflow";
import { StatusBadge, Button } from "@/components/ui";
import type { ProjectStatus } from "@prisma/client";

interface Props {
  projectId: string;
  currentStatus: ProjectStatus;
  codeDossier: string;
  onConfirm: (projectId: string, newStatus: string) => void;
}

export function StatusChangeModal({ projectId, currentStatus, codeDossier, onConfirm }: Props) {
  const { role } = useAuth();
  const transitions = getAvailableTransitions(currentStatus, role);

  const STYLE_MAP: Record<string, "primary" | "success" | "danger" | "ghost"> = {
    primary: "primary", success: "success", danger: "danger", warning: "warning" as "danger", ghost: "ghost",
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Statut actuel</p>
        <div className="flex items-center gap-2">
          <StatusBadge status={currentStatus} />
          <span className="font-semibold text-sm">{codeDossier}</span>
        </div>
      </div>

      {transitions.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune transition disponible pour votre role.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Transitions possibles :</p>
          {transitions.map((t) => (
            <Button
              key={t.to}
              variant={STYLE_MAP[t.style] ?? "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => onConfirm(projectId, t.to)}
            >
              → <StatusBadge status={t.to} /> {t.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
