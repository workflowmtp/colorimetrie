"use client";

interface ConformityProps {
  conforme: boolean;
  compact?: boolean;
}

export function ConformityIndicator({ conforme, compact = false }: ConformityProps) {
  if (compact) {
    return (
      <span className="font-bold" style={{ color: conforme ? "#10B981" : "#EF4444" }}>
        {conforme ? "✔" : "✘"}
      </span>
    );
  }

  return (
    <span className={conforme ? "conf-ok" : "conf-nc"}>
      <span className="conf-dot" />
      {conforme ? "OK" : "NC"}
    </span>
  );
}

/**
 * Conformity ratio display (e.g., "5/6 OK")
 */
export function ConformityRatio({ ok, total }: { ok: number; total: number }) {
  const rate = total > 0 ? Math.round((ok / total) * 100) : 0;
  const color = rate >= 80 ? "#10B981" : rate >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <span className="font-mono font-bold text-sm" style={{ color }}>
      {ok}/{total} ({rate}%)
    </span>
  );
}

/**
 * Ecart display (L*, a*, b* deviation from target)
 */
export function EcartValue({ value, tolerance }: { value: number; tolerance: number }) {
  const ok = Math.abs(value) <= tolerance;
  const sign = value > 0 ? "+" : "";
  return (
    <span className="font-mono font-bold" style={{ color: ok ? "#10B981" : "#EF4444" }}>
      {sign}{value}
    </span>
  );
}
