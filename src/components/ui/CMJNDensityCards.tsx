"use client";

import { CMJN_CARD_COLORS, REFLECTANCE_NM, NM_COLORS } from "@/lib/constants";

interface DensityCardsProps {
  densiteC?: number | null;
  densiteM?: number | null;
  densiteJ?: number | null;
  densiteN?: number | null;
  densiteTd?: number | null;
}

/**
 * CMJN density cards — large colored boxes like spectrodensitometer output
 */
export function CMJNDensityCards({ densiteC, densiteM, densiteJ, densiteN, densiteTd }: DensityCardsProps) {
  const hasAny = densiteC != null || densiteM != null || densiteJ != null || densiteN != null;
  if (!hasAny && densiteTd == null) return null;

  const cards: Array<{ val: number | null | undefined; label: string; bg: string }> = [
    { val: densiteC, label: "Cyan",    bg: CMJN_CARD_COLORS.cyan.bg },
    { val: densiteM, label: "Magenta", bg: CMJN_CARD_COLORS.magenta.bg },
    { val: densiteJ, label: "Jaune",   bg: CMJN_CARD_COLORS.jaune.bg },
    { val: densiteN, label: "Noir",    bg: CMJN_CARD_COLORS.noir.bg },
  ].filter((c) => c.val != null);

  return (
    <div>
      {cards.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="flex-1 min-w-[75px] text-center py-3 px-2 rounded-xl text-white"
              style={{ background: c.bg }}
            >
              <div className="font-mono text-2xl font-bold">{c.val}</div>
              <div className="text-xs opacity-80">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {densiteTd != null && (
        <div className="text-center py-2 px-4 rounded-lg mb-2" style={{ background: "var(--bg-elevated)" }}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Densite ton direct : </span>
          <span className="font-mono text-lg font-bold" style={{ color: "#8B5CF6" }}>{densiteTd}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Inline density value with CMJN color coding
 */
export function DensityInline({
  densiteC, densiteM, densiteJ, densiteN, densiteTd,
}: DensityCardsProps) {
  if (densiteTd != null) {
    return <span className="font-mono text-xs font-semibold" style={{ color: "#8B5CF6" }}>{densiteTd}</span>;
  }
  if (densiteC != null) {
    return <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>C{densiteC}</span>;
  }
  return <span style={{ color: "var(--text-muted)" }}>-</span>;
}

interface ReflectanceProps {
  data: Record<string, number | null | undefined>;
}

/**
 * Spectral reflectance cards (400-700nm)
 */
export function ReflectanceCards({ data }: ReflectanceProps) {
  const values = REFLECTANCE_NM.map((nm) => ({
    nm,
    value: data[`r${nm}`] as number | null | undefined,
    color: NM_COLORS[nm],
  })).filter((v) => v.value != null);

  if (values.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {values.map((v) => (
        <div
          key={v.nm}
          className="flex-1 min-w-[55px] text-center py-2 px-1 rounded-lg"
          style={{ background: "var(--bg-elevated)", borderBottom: `3px solid ${v.color}` }}
        >
          <div className="font-mono text-base font-bold" style={{ color: "var(--text-primary)" }}>
            {v.value}%
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{v.nm}nm</div>
        </div>
      ))}
    </div>
  );
}
