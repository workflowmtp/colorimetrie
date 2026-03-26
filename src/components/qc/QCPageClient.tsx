"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Accordion, KpiCard, KpiGrid, SwatchStrip, Swatch, DeltaEValue, ConformityRatio, Button } from "@/components/ui";
import { deltaE76 } from "@/lib/colorimetry";
import { checkDriftAlert } from "@/lib/utils";
import type { Tolerance } from "@prisma/client";

interface Props { projects: any[]; tolerances: Tolerance[]; }

export function QCPageClient({ projects, tolerances }: Props) {
  const router = useRouter();
  const { can } = useAuth();
  const toast = useToast();

  function getTol(processId: string) {
    return tolerances.find((t) => t.processId === processId) ?? { deltaEMax: 3 };
  }

  const allControls = projects.flatMap((p) => p.productionControls ?? []);
  const ncTotal = allControls.filter((c: any) => !c.conforme).length;
  const confTotal = allControls.length - ncTotal;
  let driftCount = 0;
  for (const pr of projects) {
    if (checkDriftAlert((pr.productionControls ?? []).map((c: any) => ({ conforme: c.conforme, dateControle: c.dateControle })))) driftCount++;
  }

  async function qcDecision(projectId: string, conforme: boolean) {
    const res = await fetch("/api/qc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, conforme }) });
    if (res.ok) { toast.success("Decision QC enregistree"); router.refresh(); }
    else toast.error("Erreur QC");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Controle Qualite</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Comparaison labo/production, conformite, recurrences</p>
      </div>

      <KpiGrid>
        <KpiCard icon="📋" value={allControls.length} label="Total controles" color="#3B82F6" />
        <KpiCard icon="✅" value={confTotal} label="Conformes" color="#10B981" />
        <KpiCard icon="✘" value={ncTotal} label="Non conformes" color="#EF4444" />
        <KpiCard icon="⚠️" value={driftCount} label="Derives" color="#F97316" />
      </KpiGrid>

      <div className="mt-6 space-y-3">
        {projects.map((pr) => {
          const controls = pr.productionControls ?? [];
          const drift = checkDriftAlert(controls.map((c: any) => ({ conforme: c.conforme, dateControle: c.dateControle })));
          const tol = getTol(pr.processId);

          // Per-color QC data
          let totalLaboConf = 0, totalProdConf = 0, totalProdNC = 0;
          const colorQC = pr.colors.map((color: any) => {
            // Best labo ΔE
            const colorTrials = (pr.trials ?? []).filter((t: any) => t.colorId === color.id);
            let bestDE = 999;
            for (const trial of colorTrials) {
              for (const sp of trial.spectroMeasurements ?? []) {
                const dE = deltaE76(sp.lValue, sp.aValue, sp.bValue, color.cibleLabL, color.cibleLabA, color.cibleLabB);
                if (dE < bestDE) bestDE = dE;
              }
            }
            const laboOk = bestDE <= tol.deltaEMax;
            if (laboOk) totalLaboConf++;

            // Production controls for this color
            let ctrls = controls.filter((c: any) => c.colorId === color.id);
            if (ctrls.length === 0 && pr.colors.length === 1) ctrls = controls;
            const prodConf = ctrls.filter((c: any) => c.conforme).length;
            const prodNC = ctrls.length - prodConf;
            totalProdConf += prodConf;
            totalProdNC += prodNC;
            const rate = ctrls.length > 0 ? Math.round(prodConf / ctrls.length * 100) : 0;

            return { color, bestDE, laboOk, ctrls: ctrls.length, prodConf, prodNC, rate };
          });

          const globalTotal = totalProdConf + totalProdNC;
          const globalRate = globalTotal > 0 ? Math.round(totalProdConf / globalTotal * 100) : 0;

          return (
            <Accordion key={pr.id} id={"qc_" + pr.id}
              icon={drift ? "⚠️" : "📋"}
              iconBg={drift ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}
              iconColor={drift ? "#EF4444" : "#10B981"}
              title={
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-bold text-sm" style={{ color: "#3B82F6" }}>{pr.codeDossier}</span>
                  <span className="text-sm">{pr.cibleDescription}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{pr.colors.length} coul.</span>
                  {drift && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>DERIVE</span>}
                </div>
              }
              count={globalRate + "%"}
            >
              {/* Per-color comparison table */}
              <div className="overflow-x-auto">
                <table className="data-table mb-3">
                  <thead><tr><th>Poste</th><th>Couleur</th><th>Labo ΔE</th><th>Labo</th><th>Prod.</th><th>OK</th><th>NC</th><th>Taux</th></tr></thead>
                  <tbody>
                    {colorQC.map((cq: any) => (
                      <tr key={cq.color.id}>
                        <td><div className="flex items-center gap-2"><span className="font-mono font-bold" style={{ color: "#06B6D4" }}>P{cq.color.poste}</span><Swatch L={cq.color.cibleLabL} a={cq.color.cibleLabA} b={cq.color.cibleLabB} size={12} /></div></td>
                        <td className="text-sm">{cq.color.nomCouleur}</td>
                        <td>{cq.bestDE < 999 ? <DeltaEValue dE={cq.bestDE} maxDe={tol.deltaEMax} /> : <span style={{ color: "var(--text-muted)" }}>-</span>}</td>
                        <td>{cq.bestDE < 999 ? <span style={{ color: cq.laboOk ? "#10B981" : "#EF4444" }}>{cq.laboOk ? "✔" : "✘"}</span> : "-"}</td>
                        <td className="font-mono">{cq.ctrls}</td>
                        <td className="font-mono" style={{ color: "#10B981" }}>{cq.prodConf}</td>
                        <td className="font-mono" style={{ color: "#EF4444" }}>{cq.prodNC}</td>
                        <td className="font-mono font-bold" style={{ color: cq.rate >= 80 ? "#10B981" : cq.rate >= 50 ? "#F59E0B" : "#EF4444" }}>{cq.ctrls > 0 ? cq.rate + "%" : "-"}</td>
                      </tr>
                    ))}
                    {/* Global row */}
                    <tr className="font-semibold" style={{ borderTop: "2px solid var(--border)" }}>
                      <td colSpan={2}>GLOBAL ({pr.colors.length} coul.)</td>
                      <td colSpan={2}>{totalLaboConf}/{pr.colors.length} labo OK</td>
                      <td className="font-mono">{globalTotal}</td>
                      <td className="font-mono" style={{ color: "#10B981" }}>{totalProdConf}</td>
                      <td className="font-mono" style={{ color: "#EF4444" }}>{totalProdNC}</td>
                      <td className="font-mono font-bold" style={{ color: globalRate >= 80 ? "#10B981" : "#EF4444" }}>{globalTotal > 0 ? globalRate + "%" : "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* QC decision */}
              {can("qc.validate") && controls.length > 0 && (
                <div className="flex gap-2 mb-3">
                  <Button size="sm" variant="success" onClick={() => qcDecision(pr.id, true)}>✔ Declarer conforme</Button>
                  <Button size="sm" variant="danger" onClick={() => qcDecision(pr.id, false)}>✘ Declarer non conforme</Button>
                </div>
              )}

              {/* NC list */}
              {controls.filter((c: any) => !c.conforme).length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Non-conformites recentes</div>
                  {controls.filter((c: any) => !c.conforme).slice(0, 5).map((nc: any) => (
                    <div key={nc.id} className="flex items-center gap-2 text-xs py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span>{nc.etapeTirage}{nc.color ? " P" + nc.color.poste + " " + nc.color.nomCouleur : ""}: {nc.commentaire || "NC"}</span>
                    </div>
                  ))}
                </div>
              )}
            </Accordion>
          );
        })}
        {projects.length === 0 && <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Aucune reference a controler</div>}
      </div>
    </div>
  );
}
