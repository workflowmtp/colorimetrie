"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useModal } from "@/hooks/useModal";
import { Accordion, KpiCard, KpiGrid, StatusBadge, SwatchStrip, Swatch, ConformityIndicator, Button } from "@/components/ui";
import { labToRgb } from "@/lib/colorimetry";
import { formatDateTime, checkDriftAlert } from "@/lib/utils";

interface Props { projects: any[]; }

export function ProductionPageClient({ projects }: Props) {
  const router = useRouter();
  const { can } = useAuth();
  const toast = useToast();
  const { openModal, closeModal } = useModal();

  const allControls = projects.flatMap((p) => p.productionControls ?? []);
  const ncProd = allControls.filter((c: any) => !c.conforme).length;

  async function handleSaveControls(projectId: string, etape: string, controls: Array<{ colorId: string; conforme: boolean; commentaire: string }>) {
    const res = await fetch("/api/production", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, etapeTirage: etape, controls }),
    });
    if (res.ok) { toast.success("Controles enregistres"); closeModal(); router.refresh(); }
    else toast.error("Erreur enregistrement");
  }

  function openProductionForm(pr: any) {
    openModal("Controle production — " + pr.colors.length + " couleurs", <ProductionForm project={pr} onSave={handleSaveControls} />, pr.colors.length > 3 ? "large" : "default");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Suivi Production</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Mesures debut, milieu, fin de tirage</p>
      </div>

      <KpiGrid>
        <KpiCard icon="📄" value={projects.length} label="Refs en production" color="#3B82F6" />
        <KpiCard icon="📊" value={allControls.length} label="Controles" color="#06B6D4" />
        <KpiCard icon="✅" value={allControls.length - ncProd} label="Conformes" color="#10B981" />
        <KpiCard icon="✘" value={ncProd} label="Non conformes" color="#EF4444" />
      </KpiGrid>

      <div className="mt-6 space-y-3">
        {projects.map((pr) => {
          const controls = pr.productionControls ?? [];
          const drift = checkDriftAlert(controls.map((c: any) => ({ conforme: c.conforme, dateControle: c.dateControle })));

          // Group controls by dateControle batch
          const byDate: Record<string, any[]> = {};
          for (const ctrl of controls) { const dk = ctrl.dateControle; if (!byDate[dk]) byDate[dk] = []; byDate[dk].push(ctrl); }
          const dateKeys = Object.keys(byDate).sort().reverse();

          return (
            <Accordion key={pr.id} id={"prod_" + pr.id}
              icon={drift ? "⚠️" : "⚙️"}
              iconBg={drift ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}
              iconColor={drift ? "#EF4444" : "#10B981"}
              title={
                <div className="flex items-center gap-3 flex-wrap">
                  <SwatchStrip colors={pr.colors} size={16} />
                  <span className="font-mono font-bold text-sm" style={{ color: "#3B82F6" }}>{pr.codeDossier}</span>
                  <span className="text-sm">{pr.cibleDescription}</span>
                  <StatusBadge status={pr.statut} />
                  {drift && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>⚠ DERIVE</span>}
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{controls.length} ctrl</span>
                </div>
              }
              count={controls.length + " ctrl"}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{pr.client.nom} • {pr.machine?.nomMachine ?? "-"} • {pr.colors.length} couleurs</span>
                {can("production.create") && <Button size="sm" variant="primary" onClick={() => openProductionForm(pr)}>+ Saisie</Button>}
              </div>

              {controls.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Etape</th><th>Date</th>
                        {pr.colors.map((c: any) => (
                          <th key={c.id} className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Swatch L={c.cibleLabL} a={c.cibleLabA} b={c.cibleLabB} size={12} />
                              <span className="text-[9px]">P{c.poste}</span>
                            </div>
                          </th>
                        ))}
                        <th>Op.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateKeys.map((dk) => {
                        const batch = byDate[dk];
                        return (
                          <tr key={dk}>
                            <td className="font-semibold text-xs">{batch[0].etapeTirage}</td>
                            <td className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDateTime(batch[0].dateControle)}</td>
                            {pr.colors.map((c: any) => {
                              const ctrl = batch.find((b: any) => b.colorId === c.id) ?? batch.find((b: any) => !b.colorId);
                              return (
                                <td key={c.id} className="text-center">
                                  {ctrl ? <ConformityIndicator conforme={ctrl.conforme} compact /> : <span style={{ color: "var(--text-muted)" }}>-</span>}
                                </td>
                              );
                            })}
                            <td className="text-xs" style={{ color: "var(--text-muted)" }}>{batch[0].operateur?.nom ?? ""}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun controle</p>}

              {drift && (
                <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}>
                  <strong>⚠ Alerte derive :</strong> 3 controles NC consecutifs.
                </div>
              )}
            </Accordion>
          );
        })}
        {projects.length === 0 && <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Aucune reference en production</div>}
      </div>
    </div>
  );
}

// Inline production form component
function ProductionForm({ project, onSave }: { project: any; onSave: (pid: string, etape: string, controls: any[]) => void }) {
  const [etape, setEtape] = useState("debut");

  function handleSubmit() {
    const rows = document.querySelectorAll("#prod-form-table tbody tr");
    const controls: Array<{ colorId: string; conforme: boolean; commentaire: string }> = [];
    rows.forEach((row) => {
      const colorId = row.getAttribute("data-color-id") ?? "";
      const sel = row.querySelector("select") as HTMLSelectElement;
      const input = row.querySelector("input") as HTMLInputElement;
      controls.push({ colorId, conforme: sel?.value === "true", commentaire: input?.value ?? "" });
    });
    onSave(project.id, etape, controls);
  }

  return (
    <div>
      <div className="mb-4">
        <label className="form-label">Etape du tirage</label>
        <select value={etape} onChange={(e) => setEtape(e.target.value)} className="form-input w-auto">
          <option value="debut">Debut de tirage</option>
          <option value="milieu">Milieu de tirage</option>
          <option value="fin">Fin de tirage</option>
        </select>
      </div>
      <table className="data-table" id="prod-form-table">
        <thead><tr><th>Poste</th><th>Couleur</th><th>Conforme ?</th><th>Commentaire</th></tr></thead>
        <tbody>
          {project.colors.map((c: any) => (
            <tr key={c.id} data-color-id={c.id}>
              <td><div className="flex items-center gap-2"><span className="font-mono font-bold" style={{ color: "#06B6D4" }}>P{c.poste}</span><Swatch L={c.cibleLabL} a={c.cibleLabA} b={c.cibleLabB} size={14} /></div></td>
              <td className="text-sm">{c.nomCouleur}</td>
              <td><select className="form-input w-auto py-1 text-sm" defaultValue="true"><option value="true">Conforme</option><option value="false">Non conforme</option></select></td>
              <td><input type="text" className="form-input py-1 text-sm" placeholder="Observations..." /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <Button variant="primary" onClick={handleSubmit}>✔ Enregistrer {project.colors.length} controle(s)</Button>
      </div>
    </div>
  );
}
