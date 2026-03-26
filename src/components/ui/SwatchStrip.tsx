"use client";

import { labToRgb } from "@/lib/colorimetry";

interface SwatchStripProps {
  colors: Array<{
    poste: number;
    nomCouleur: string;
    cibleLabL: number;
    cibleLabA: number;
    cibleLabB: number;
  }>;
  size?: number;
  showTooltip?: boolean;
}

/**
 * Renders a horizontal strip of color swatches from project_colors LAB values
 */
export function SwatchStrip({ colors, size = 18, showTooltip = true }: SwatchStripProps) {
  if (!colors || colors.length === 0) {
    return <div className="w-5 h-5 rounded bg-gray-400 border border-gray-300 opacity-50" />;
  }

  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      {colors.map((c) => {
        const rgb = labToRgb(c.cibleLabL, c.cibleLabA, c.cibleLabB);
        return (
          <div
            key={c.poste}
            className="rounded swatch"
            style={{
              width: size,
              height: size,
              background: rgb,
              flexShrink: 0,
            }}
            title={showTooltip ? `P${c.poste} ${c.nomCouleur} (L*${c.cibleLabL} a*${c.cibleLabA} b*${c.cibleLabB})` : undefined}
          />
        );
      })}
    </div>
  );
}

/**
 * Single swatch from LAB values
 */
export function Swatch({ L, a, b, size = 24, className = "" }: { L: number; a: number; b: number; size?: number; className?: string }) {
  const rgb = labToRgb(L, a, b);
  return (
    <div
      className={`rounded swatch ${className}`}
      style={{ width: size, height: size, background: rgb, flexShrink: 0 }}
      title={`L*${L} a*${a} b*${b}`}
    />
  );
}

/**
 * Color comparison: two swatches side by side (cible vs mesure)
 */
export function ColorComparison({
  cibleL, cibleA, cibleB,
  mesureL, mesureA, mesureB,
  size = 56,
}: {
  cibleL: number; cibleA: number; cibleB: number;
  mesureL: number; mesureA: number; mesureB: number;
  size?: number;
}) {
  const cibleRgb = labToRgb(cibleL, cibleA, cibleB);
  const mesureRgb = labToRgb(mesureL, mesureA, mesureB);

  return (
    <div className="flex gap-6 justify-center flex-wrap">
      {/* Cible */}
      <div className="text-center p-4 rounded-xl" style={{ background: "var(--bg-elevated)", minWidth: 130 }}>
        <div
          className="rounded-xl mx-auto mb-2 swatch"
          style={{ width: size, height: size, background: cibleRgb }}
        />
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Couleur cible</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
          L*: {cibleL}<br />a*: {cibleA}<br />b*: {cibleB}
        </div>
      </div>

      {/* Mesure */}
      <div className="text-center p-4 rounded-xl" style={{ background: "var(--bg-elevated)", minWidth: 130 }}>
        <div
          className="rounded-xl mx-auto mb-2 swatch"
          style={{ width: size, height: size, background: mesureRgb }}
        />
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Couleur mesuree</div>
        <div className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
          L*: {mesureL}<br />a*: {mesureA}<br />b*: {mesureB}
        </div>
      </div>
    </div>
  );
}
