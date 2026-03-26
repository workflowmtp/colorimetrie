"use client";

import { ColorComparison, DeltaEBadge, EcartValue } from "@/components/ui";
import { CMJNDensityCards, ReflectanceCards } from "@/components/ui/CMJNDensityCards";
import { deltaE76, deltaE2000 } from "@/lib/colorimetry";
import { round } from "@/lib/utils";

interface Props {
  sp: any;
  color: any;
  tol: any;
}

export function SpectroDetailModal({ sp, color, tol }: Props) {
  const cL = color?.cibleLabL ?? 50;
  const cA = color?.cibleLabA ?? 0;
  const cB = color?.cibleLabB ?? 0;
  const hasCible = !!color;

  const dE = hasCible ? deltaE76(sp.lValue, sp.aValue, sp.bValue, cL, cA, cB) : null;
  const dE2k = hasCible ? deltaE2000(sp.lValue, sp.aValue, sp.bValue, cL, cA, cB) : null;

  return (
    <div className="space-y-5">
      {/* Section: Comparaison colorimetrique */}
      <div>
        <h4 className="font-semibold text-sm mb-3 pb-2" style={{ borderBottom: "2px solid #3B82F6" }}>
          Comparaison colorimetrique
        </h4>
        {hasCible && (
          <ColorComparison
            cibleL={cL} cibleA={cA} cibleB={cB}
            mesureL={sp.lValue} mesureA={sp.aValue} mesureB={sp.bValue}
          />
        )}
      </div>

      {/* ΔE Badge */}
      {dE != null && (
        <DeltaEBadge dE={dE} maxDe={tol.deltaEMax ?? 3} showLabel showScore size="md" />
      )}

      {/* Ecarts detail */}
      {hasCible && (
        <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)" }}>
          {color && (
            <div className="text-xs font-semibold mb-3" style={{ color: "#06B6D4" }}>
              P{color.poste} — {color.nomCouleur}
            </div>
          )}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
            <div></div><div>Cible</div><div>Mesure</div><div>Ecart</div>
          </div>
          {[
            { label: "L*", c: cL, m: sp.lValue, t: tol.tolL ?? 2 },
            { label: "a*", c: cA, m: sp.aValue, t: tol.tolA ?? 1.5 },
            { label: "b*", c: cB, m: sp.bValue, t: tol.tolB ?? 1.5 },
          ].map((ax) => (
            <div key={ax.label} className="grid grid-cols-4 gap-2 text-center py-1.5" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div className="font-semibold text-sm">{ax.label}</div>
              <div className="font-mono font-semibold">{ax.c}</div>
              <div className="font-mono font-semibold">{ax.m}</div>
              <div><EcartValue value={round(ax.m - ax.c, 2)} tolerance={ax.t} /></div>
            </div>
          ))}
          <div className="flex gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>C*: {sp.cValue ?? "-"}</span>
            <span>h°: {sp.hValue ?? "-"}</span>
            {dE2k != null && <span>ΔE2000: {dE2k}</span>}
          </div>
        </div>
      )}

      {/* Section: Densites CMJN */}
      {(sp.densiteC != null || sp.densiteM != null || sp.densiteJ != null || sp.densiteN != null || sp.densiteTd != null) && (
        <div>
          <h4 className="font-semibold text-sm mb-3 pb-2" style={{ borderBottom: "2px solid #06B6D4" }}>
            Densites CMJN
          </h4>
          <CMJNDensityCards
            densiteC={sp.densiteC} densiteM={sp.densiteM}
            densiteJ={sp.densiteJ} densiteN={sp.densiteN}
            densiteTd={sp.densiteTd}
          />
        </div>
      )}

      {/* Section: Reflectances */}
      {(sp.r400 != null || sp.r450 != null || sp.r500 != null) && (
        <div>
          <h4 className="font-semibold text-sm mb-3 pb-2" style={{ borderBottom: "2px solid #8B5CF6" }}>
            Reflectances (400-700nm)
          </h4>
          <ReflectanceCards data={sp} />
        </div>
      )}

      {/* Meta */}
      <div className="text-xs pt-2" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
        <strong>Lecture #</strong> {sp.lectureNumero} • <strong>Contexte:</strong> {sp.contexte}
        <br /><strong>Mesure par:</strong> {sp.operateur?.nom ?? "-"}
        {sp.commentaire && <><br /><strong>Note:</strong> {sp.commentaire}</>}
      </div>
    </div>
  );
}
