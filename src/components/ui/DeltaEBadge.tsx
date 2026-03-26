"use client";

import { deltaELabel, proximityScore } from "@/lib/colorimetry";

interface DeltaEBadgeProps {
  dE: number;
  maxDe?: number;
  showLabel?: boolean;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

function getColor(dE: number, maxDe: number): string {
  if (dE <= maxDe) return "#10B981";  // green
  if (dE <= maxDe * 1.5) return "#F59E0B";  // yellow
  return "#EF4444";  // red
}

function getBgColor(dE: number, maxDe: number): string {
  if (dE <= maxDe) return "rgba(16,185,129,0.1)";
  if (dE <= maxDe * 1.5) return "rgba(245,158,11,0.1)";
  return "rgba(239,68,68,0.1)";
}

function getBorderColor(dE: number, maxDe: number): string {
  if (dE <= maxDe) return "rgba(16,185,129,0.3)";
  if (dE <= maxDe * 1.5) return "rgba(245,158,11,0.3)";
  return "rgba(239,68,68,0.3)";
}

/**
 * Inline ΔE value with color coding
 */
export function DeltaEValue({ dE, maxDe = 3 }: { dE: number; maxDe?: number }) {
  const color = getColor(dE, maxDe);
  return (
    <span className="font-mono font-bold" style={{ color }}>
      {dE}
    </span>
  );
}

/**
 * Full ΔE badge with label and optional score
 */
export function DeltaEBadge({ dE, maxDe = 3, showLabel = true, showScore = false, size = "md" }: DeltaEBadgeProps) {
  const color = getColor(dE, maxDe);
  const bg = getBgColor(dE, maxDe);
  const border = getBorderColor(dE, maxDe);
  const label = deltaELabel(dE);
  const score = proximityScore(dE);

  const sizes = {
    sm: { text: "text-sm", padding: "px-2 py-1" },
    md: { text: "text-lg", padding: "px-4 py-2" },
    lg: { text: "text-2xl", padding: "px-6 py-3" },
  };
  const s = sizes[size];

  return (
    <div
      className={`text-center rounded-xl ${s.padding}`}
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <span className={`font-mono font-bold ${s.text}`} style={{ color }}>
        ΔE = {dE}
        {showLabel && <span className="font-sans font-semibold"> — {label}</span>}
      </span>
      {showScore && (
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Score: {score}%
        </div>
      )}
    </div>
  );
}

/**
 * Mini ΔE circle gauge (for compact views)
 */
export function DeltaECircle({ dE, maxDe = 3, size = 52 }: { dE: number; maxDe?: number; size?: number }) {
  const color = getColor(dE, maxDe);
  return (
    <div
      className="rounded-full flex flex-col items-center justify-center"
      style={{
        width: size,
        height: size,
        border: `3px solid ${color}`,
        flexShrink: 0,
      }}
    >
      <span className="font-mono font-bold text-xs" style={{ color, lineHeight: 1 }}>{dE}</span>
      <span className="text-[8px] font-semibold" style={{ color, lineHeight: 1 }}>ΔE</span>
    </div>
  );
}
