"use client";

import { PROJECT_STATUS_META, TRIAL_STATUS_META } from "@/lib/workflow";
import { PRIORITY_META, CONTEXT_COLORS } from "@/lib/constants";
import type { ProjectStatus, Priority, MeasureContext } from "@prisma/client";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
}

export function Badge({ children, color, bgColor, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${className}`}
      style={{ color: color ?? "var(--text-muted)", background: bgColor ?? "var(--bg-elevated)" }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];
  if (!meta) return <Badge>{status}</Badge>;
  return <Badge color={meta.color} bgColor={meta.bgColor}>{meta.label}</Badge>;
}

export function TrialStatusBadge({ status }: { status: string }) {
  const meta = TRIAL_STATUS_META[status];
  if (!meta) return <Badge>{status}</Badge>;
  return <Badge color={meta.color} bgColor={meta.bgColor}>{meta.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "normale") return null;
  const meta = PRIORITY_META[priority];
  return (
    <Badge color={meta.color} bgColor={meta.color + "20"}>
      {meta.icon} {meta.label}
    </Badge>
  );
}

export function ContextBadge({ context }: { context: MeasureContext | string }) {
  const c = CONTEXT_COLORS[context];
  return (
    <Badge color={c?.text ?? "var(--text-muted)"} bgColor={c?.bg ?? "var(--bg-elevated)"}>
      {(context || "").replace(/_/g, " ")}
    </Badge>
  );
}

export function ProcessBadge({ processId, isHelio }: { processId?: string; isHelio?: boolean }) {
  const helio = isHelio ?? processId === "heliogravure";
  return (
    <Badge
      color={helio ? "#8B5CF6" : "#3B82F6"}
      bgColor={helio ? "rgba(139,92,246,0.15)" : "rgba(59,130,246,0.15)"}
    >
      {helio ? "HELIO — Encre liquide" : "OFFSET — Encre pateuse"}
    </Badge>
  );
}

export function CompTypeBadge({ type }: { type: string }) {
  const COLORS: Record<string, { bg: string; text: string }> = {
    pigment:          { bg: "rgba(139,92,246,0.15)",  text: "#8B5CF6" },
    base:             { bg: "rgba(59,130,246,0.15)",   text: "#3B82F6" },
    vernis_offset:    { bg: "rgba(16,185,129,0.15)",   text: "#10B981" },
    vernis_nc:        { bg: "rgba(16,185,129,0.15)",   text: "#10B981" },
    vernis_pu:        { bg: "rgba(20,184,166,0.15)",   text: "#14B8A6" },
    solvant:          { bg: "rgba(6,182,212,0.15)",    text: "#06B6D4" },
    siccatif:         { bg: "rgba(249,115,22,0.15)",   text: "#F97316" },
    anti_maculage:    { bg: "rgba(168,85,247,0.15)",   text: "#A855F7" },
    anti_peau:        { bg: "rgba(236,72,153,0.15)",   text: "#EC4899" },
    retardateur:      { bg: "rgba(249,115,22,0.15)",   text: "#F97316" },
    anti_mousse:      { bg: "rgba(236,72,153,0.15)",   text: "#EC4899" },
    agent_glissement: { bg: "rgba(234,179,8,0.15)",    text: "#EAB308" },
    additif:          { bg: "rgba(245,158,11,0.15)",   text: "#F59E0B" },
  };
  const c = COLORS[type] ?? { bg: "var(--bg-elevated)", text: "var(--text-muted)" };
  return <Badge color={c.text} bgColor={c.bg}>{(type || "").replace(/_/g, " ")}</Badge>;
}
