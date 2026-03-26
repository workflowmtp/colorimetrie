"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccordionGroup, Accordion, ProcessBadge, CompTypeBadge, Swatch, Badge, Button } from "@/components/ui";
import { formatFCFA, formatWeight } from "@/lib/utils";

interface Props { formulations: any[]; }

export function FormulationsPageClient({ formulations }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [processFilter, setProcessFilter] = useState("all");

  const filtered = formulations.filter((f) => {
    if (processFilter !== "all" && f.processType !== processFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!f.codeFormule.toLowerCase().includes(s) && !(f.trial?.project?.codeDossier ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Formulations</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{formulations.length} formulation(s)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input max-w-xs" />
        <select value={processFilter} onChange={(e) => setProcessFilter(e.target.value)} className="form-input w-auto">
          <option value="all">Tous procedes</option>
          <option value="offset_papier">Offset</option>
          <option value="heliogravure">Heliogravure</option>
          <option value="offset_metal">Offset Metal</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Aucune formulation</div>
      ) : (
        <AccordionGroup>
          {filtered.map((f) => {
            const isHelio = f.processType === "heliogravure";
            return (
              <Accordion
                key={f.id}
                id={"frm_" + f.id}
                title={
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-sm" style={{ color: "#06B6D4" }}>{f.codeFormule}</span>
                    <span className="text-xs" style={{ color: "#3B82F6" }}>{f.trial?.project?.codeDossier ?? "?"}</span>
                    {f.trial?.color && <Swatch L={f.trial.color.cibleLabL} a={f.trial.color.cibleLabA} b={f.trial.color.cibleLabB} size={14} />}
                    <ProcessBadge isHelio={isHelio} />
                    <Badge color={f.validee ? "#10B981" : "var(--text-muted)"} bgColor={f.validee ? "rgba(16,185,129,0.15)" : "var(--bg-elevated)"}>{f.validee ? "Validee" : "Brouillon"}</Badge>
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{formatWeight(f.poidsTotal)} • {formatFCFA(f.coutTotal)}</span>
                  </div>
                }
              >
                {/* Process-specific params */}
                {isHelio && (f.viscositeCoupe || f.tauxDilution) && (
                  <div className="flex gap-4 text-xs mb-3 p-2 rounded-lg flex-wrap" style={{ background: "var(--bg-elevated)", borderLeft: "3px solid #8B5CF6", color: "var(--text-secondary)" }}>
                    {f.viscositeCoupe && <span><strong>Viscosite:</strong> {f.viscositeCoupe}s ({f.coupe})</span>}
                    {f.tauxDilution && <span><strong>Dilution:</strong> {f.tauxDilution}%</span>}
                    {f.profondeurAlveole && <span><strong>Alveole:</strong> {f.profondeurAlveole}µm</span>}
                    {f.typeVernis && <span><strong>Vernis:</strong> {f.typeVernis}</span>}
                    {f.tempsSechageHelio && <span><strong>Sechage:</strong> {f.tempsSechageHelio}s</span>}
                  </div>
                )}
                {!isHelio && (f.tack || f.finesseBreoyage) && (
                  <div className="flex gap-4 text-xs mb-3 p-2 rounded-lg flex-wrap" style={{ background: "var(--bg-elevated)", borderLeft: "3px solid #3B82F6", color: "var(--text-secondary)" }}>
                    {f.tack && <span><strong>Tack:</strong> {f.tack}</span>}
                    {f.finesseBreoyage && <span><strong>Finesse:</strong> {f.finesseBreoyage}µm (H{f.hegman ?? "-"})</span>}
                    {f.sechageType && <span><strong>Sechage:</strong> {f.sechageType}</span>}
                    {f.resistanceFrottement && <span><strong>Resistance:</strong> {f.resistanceFrottement}</span>}
                    {f.siccativite && <span><strong>Siccativite:</strong> {f.siccativite}</span>}
                  </div>
                )}

                {/* Summary stats */}
                <div className="flex gap-6 mb-3">
                  <div className="text-center">
                    <div className="font-mono font-bold text-lg" style={{ color: "var(--text-primary)" }}>{f.items.length}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Composants</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono font-bold text-lg" style={{ color: "var(--text-primary)" }}>{formatWeight(f.poidsTotal)}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Poids total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono font-bold text-lg" style={{ color: "var(--text-primary)" }}>{formatFCFA(f.coutTotal)}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Cout estime</div>
                  </div>
                </div>

                {/* Items table */}
                <table className="data-table">
                  <thead><tr><th>Composant</th><th>Code</th><th>Type</th><th>Poids</th><th>%</th><th>Lot</th><th>Fournisseur</th><th>Cout/kg</th></tr></thead>
                  <tbody>
                    {f.items.map((it: any) => (
                      <tr key={it.id}>
                        <td className="font-medium text-sm">{it.composant}</td>
                        <td className="font-mono text-xs">{it.codeComposant || "-"}</td>
                        <td><CompTypeBadge type={it.typeComposant} /></td>
                        <td className="font-mono font-semibold">{it.poids}g</td>
                        <td>
                          <span className="font-mono text-xs">{it.pourcentage}%</span>
                          <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: "var(--bg-elevated)", width: 60 }}>
                            <div className="h-full rounded-full" style={{ width: Math.min(it.pourcentage, 100) + "%", background: "#3B82F6" }} />
                          </div>
                        </td>
                        <td className="text-xs" style={{ color: "var(--text-muted)" }}>{it.lot || "-"}</td>
                        <td className="text-xs" style={{ color: "var(--text-muted)" }}>{it.fournisseur || "-"}</td>
                        <td className="font-mono text-xs">{it.coutUnitaire ? it.coutUnitaire + " FCFA" : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {f.commentaire && (
                  <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                    <strong>Note :</strong> {f.commentaire}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="ghost" onClick={() => router.push("/trials/" + f.trialId)}>📄 Essai</Button>
                  <Button size="sm" variant="ghost" onClick={() => router.push("/projects/" + f.projectId)}>📁 Dossier</Button>
                </div>
              </Accordion>
            );
          })}
        </AccordionGroup>
      )}
    </div>
  );
}
