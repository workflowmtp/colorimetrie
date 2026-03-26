"use client";

import { useRouter } from "next/navigation";
import { TrialStatusBadge, ContextBadge, Swatch, DeltaEBadge, DeltaEValue, ConformityIndicator, EcartValue, CompTypeBadge, ProcessBadge, Accordion, Button } from "@/components/ui";
import { deltaE76, deltaE2000, proximityScore, averageLab, labToRgb } from "@/lib/colorimetry";
import { formatDate, formatDateTime, round } from "@/lib/utils";
import type { Tolerance } from "@prisma/client";

interface Props {
  trial: any;
  tolerances: Tolerance[];
}

export function TrialDetailClient({ trial, tolerances }: Props) {
  const router = useRouter();
  const tol = tolerances[0] ?? { deltaEMax: 3, tolL: 2, tolA: 1.5, tolB: 1.5 };
  const color = trial.color;
  const project = trial.project;
  const spectros = trial.spectroMeasurements ?? [];
  const densitos = trial.densitoMeasurements ?? [];
  const formulations = trial.formulations ?? [];
  const ovenData = trial.ovenData ?? [];

  const cL = color?.cibleLabL ?? 50;
  const cA = color?.cibleLabA ?? 0;
  const cB = color?.cibleLabB ?? 0;

  // ΔE from averaged spectro
  let avgDe: number | null = null;
  let avgDe2k: number | null = null;
  if (spectros.length > 0) {
    const avg = averageLab(spectros.map((s: any) => ({ L: s.lValue, a: s.aValue, b: s.bValue })));
    avgDe = deltaE76(avg.L, avg.a, avg.b, cL, cA, cB);
    avgDe2k = deltaE2000(avg.L, avg.a, avg.b, cL, cA, cB);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {color && <Swatch L={cL} a={cA} b={cB} size={28} />}
            <span className="font-mono text-sm cursor-pointer" style={{ color: "#3B82F6" }} onClick={() => router.push("/projects/" + project?.id)}>{project?.codeDossier ?? "?"} → Essai</span>
          </div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>V{trial.numeroVersion} — {trial.hypothese}</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {color ? `P${color.poste} ${color.nomCouleur} • ` : ""}Par {trial.operateur?.nom ?? "-"} • {formatDateTime(trial.dateEssai)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TrialStatusBadge status={trial.statut} />
          <Button size="sm" variant="ghost" onClick={() => router.push("/trials")}>← Liste</Button>
        </div>
      </div>

      {/* ΔE Summary */}
      {avgDe != null && (
        <div className="mb-6">
          <DeltaEBadge dE={avgDe} maxDe={tol.deltaEMax} showLabel showScore size="md" />
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <div><span style={{ color: "var(--text-muted)" }}>ΔE2000:</span> <span className="font-mono font-bold">{avgDe2k}</span></div>
            <div><span style={{ color: "var(--text-muted)" }}>Ecart L*:</span> <EcartValue value={round(spectros[0]?.lValue - cL, 2)} tolerance={tol.tolL} /></div>
            <div><span style={{ color: "var(--text-muted)" }}>Ecart a*:</span> <EcartValue value={round(spectros[0]?.aValue - cA, 2)} tolerance={tol.tolA} /></div>
            <div><span style={{ color: "var(--text-muted)" }}>Ecart b*:</span> <EcartValue value={round(spectros[0]?.bValue - cB, 2)} tolerance={tol.tolB} /></div>
          </div>
        </div>
      )}

      {/* Spectro */}
      <Accordion id="td_spectro" title="Spectrocolorimetre" icon="🌈" iconBg="rgba(139,92,246,0.15)" iconColor="#8B5CF6" count={spectros.length} defaultOpen={spectros.length > 0}>
        {spectros.length > 0 ? (
          <table className="data-table">
            <thead><tr><th>#</th><th>Contexte</th><th>L*</th><th>a*</th><th>b*</th><th>ΔE</th><th>Conf.</th><th>D.C</th><th>D.M</th><th>D.J</th><th>D.N</th><th>D.TD</th><th>Op.</th></tr></thead>
            <tbody>
              {spectros.map((sp: any) => {
                const dE = deltaE76(sp.lValue, sp.aValue, sp.bValue, cL, cA, cB);
                const ok = dE <= tol.deltaEMax;
                return (
                  <tr key={sp.id}>
                    <td className="font-mono">{sp.lectureNumero}</td>
                    <td><ContextBadge context={sp.contexte} /></td>
                    <td className="font-mono font-semibold">{sp.lValue}</td>
                    <td className="font-mono font-semibold">{sp.aValue}</td>
                    <td className="font-mono font-semibold">{sp.bValue}</td>
                    <td><DeltaEValue dE={dE} maxDe={tol.deltaEMax} /></td>
                    <td><ConformityIndicator conforme={ok} compact /></td>
                    <td className="font-mono text-xs" style={{ color: "#0097A7" }}>{sp.densiteC ?? "-"}</td>
                    <td className="font-mono text-xs" style={{ color: "#C2185B" }}>{sp.densiteM ?? "-"}</td>
                    <td className="font-mono text-xs" style={{ color: "#F9A825" }}>{sp.densiteJ ?? "-"}</td>
                    <td className="font-mono text-xs" style={{ color: "#37474F" }}>{sp.densiteN ?? "-"}</td>
                    <td className="font-mono text-xs font-semibold" style={{ color: "#8B5CF6" }}>{sp.densiteTd ?? "-"}</td>
                    <td className="text-xs" style={{ color: "var(--text-muted)" }}>{sp.operateur?.nom ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune mesure spectro</p>}
      </Accordion>

      {/* Densito */}
      <Accordion id="td_densito" title="Densitometre" icon="📈" iconBg="rgba(6,182,212,0.15)" iconColor="#06B6D4" count={densitos.length}>
        {densitos.length > 0 ? (
          <table className="data-table">
            <thead><tr><th>Canal</th><th>Densite</th><th>Trapping</th><th>Contraste</th><th>Contexte</th><th>Op.</th></tr></thead>
            <tbody>
              {densitos.map((dn: any) => (
                <tr key={dn.id}>
                  <td>{dn.couleur}</td>
                  <td className="font-mono font-bold">{dn.densite}</td>
                  <td className="font-mono">{dn.trapping ?? "-"}%</td>
                  <td className="font-mono">{dn.contraste ?? "-"}</td>
                  <td><ContextBadge context={dn.contexte} /></td>
                  <td className="text-xs" style={{ color: "var(--text-muted)" }}>{dn.operateur?.nom ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune mesure densito</p>}
      </Accordion>

      {/* Formulation */}
      {formulations.map((f: any) => (
        <Accordion key={f.id} id={"td_form_" + f.id} title={"Formulation " + f.codeFormule} icon="🧪" iconBg="rgba(245,158,11,0.15)" iconColor="#F59E0B">
          <div className="flex items-center gap-2 mb-3">
            <ProcessBadge processId={f.processType} />
            <span className="font-mono text-sm font-bold" style={{ color: "#06B6D4" }}>{f.codeFormule}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>V{f.versionFormule} • {f.poidsTotal}g • {f.coutTotal} FCFA</span>
          </div>
          {/* Process params */}
          {f.processType === "heliogravure" && (f.viscositeCoupe || f.tauxDilution) && (
            <div className="flex gap-4 text-xs mb-3 p-2 rounded-lg" style={{ background: "var(--bg-elevated)", borderLeft: "3px solid #8B5CF6", color: "var(--text-secondary)" }}>
              {f.viscositeCoupe && <span><strong>Viscosite:</strong> {f.viscositeCoupe}s ({f.coupe})</span>}
              {f.tauxDilution && <span><strong>Dilution:</strong> {f.tauxDilution}%</span>}
              {f.profondeurAlveole && <span><strong>Alveole:</strong> {f.profondeurAlveole}µm</span>}
              {f.typeVernis && <span><strong>Vernis:</strong> {f.typeVernis}</span>}
            </div>
          )}
          {f.processType !== "heliogravure" && (f.tack || f.finesseBreoyage) && (
            <div className="flex gap-4 text-xs mb-3 p-2 rounded-lg" style={{ background: "var(--bg-elevated)", borderLeft: "3px solid #3B82F6", color: "var(--text-secondary)" }}>
              {f.tack && <span><strong>Tack:</strong> {f.tack}</span>}
              {f.finesseBreoyage && <span><strong>Finesse:</strong> {f.finesseBreoyage}µm (H{f.hegman ?? "-"})</span>}
              {f.sechageType && <span><strong>Sechage:</strong> {f.sechageType}</span>}
            </div>
          )}
          <table className="data-table">
            <thead><tr><th>Composant</th><th>Type</th><th>Poids</th><th>%</th><th>Lot</th><th>Fournisseur</th></tr></thead>
            <tbody>
              {f.items.map((it: any) => (
                <tr key={it.id}>
                  <td className="font-medium">{it.composant}</td>
                  <td><CompTypeBadge type={it.typeComposant} /></td>
                  <td className="font-mono font-semibold">{it.poids}g</td>
                  <td className="font-mono">{it.pourcentage}%</td>
                  <td className="text-xs" style={{ color: "var(--text-muted)" }}>{it.lot || "-"}</td>
                  <td className="text-xs" style={{ color: "var(--text-muted)" }}>{it.fournisseur || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>
      ))}

      {/* Oven */}
      {ovenData.length > 0 && (
        <Accordion id="td_oven" title="Donnees cuisson" icon="🔥" iconBg="rgba(239,68,68,0.15)" iconColor="#EF4444" count={ovenData.length}>
          {ovenData.map((ov: any) => (
            <div key={ov.id} className="text-sm grid grid-cols-2 md:grid-cols-4 gap-3 py-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div><span className="text-xs block" style={{ color: "var(--text-muted)" }}>Four</span>{ov.typeFour}</div>
              <div><span className="text-xs block" style={{ color: "var(--text-muted)" }}>T° consigne/reelle</span><span className="font-mono">{ov.temperatureConsigne}°C / {ov.temperatureReelle ?? "-"}°C</span></div>
              <div><span className="text-xs block" style={{ color: "var(--text-muted)" }}>Temps/Vitesse</span><span className="font-mono">{ov.tempsSejour ?? "-"}min • {ov.vitesseLigne ?? "-"}m/min</span></div>
              <div><span className="text-xs block" style={{ color: "var(--text-muted)" }}>Zone</span>{ov.zone || "-"}</div>
            </div>
          ))}
        </Accordion>
      )}
    </div>
  );
}
