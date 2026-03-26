"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useModal } from "@/hooks/useModal";
import { AccordionGroup, Accordion, KpiCard, KpiGrid, StatusBadge, ContextBadge, DeltaEValue, ConformityIndicator, SwatchStrip, Swatch, Button } from "@/components/ui";
import { SpectroMultiForm } from "./SpectroMultiForm";
import { SpectroDetailModal } from "./SpectroDetailModal";
import { deltaE76 } from "@/lib/colorimetry";
import type { Tolerance } from "@prisma/client";

interface Props {
  spectros: any[];
  projects: any[];
  tolerances: Tolerance[];
  users: Array<{ id: string; nom: string }>;
}

export function SpectroPageClient({ spectros, projects, tolerances, users }: Props) {
  const router = useRouter();
  const { can } = useAuth();
  const toast = useToast();
  const { openModal, closeModal } = useModal();
  const [search, setSearch] = useState("");

  function getTol(processId: string) {
    return tolerances.find((t) => t.processId === processId) ?? { deltaEMax: 3, tolL: 2, tolA: 1.5, tolB: 1.5 } as any;
  }

  // Filter
  const filtered = spectros.filter((sp) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const code = sp.trial?.project?.codeDossier ?? "";
    return code.toLowerCase().includes(s) || (sp.contexte || "").toLowerCase().includes(s);
  });

  // Count conformity
  let confCount = 0;
  for (const sp of filtered) {
    const color = sp.trial?.color;
    if (color) {
      const tol = getTol(sp.trial?.project?.processId ?? "");
      const dE = deltaE76(sp.lValue, sp.aValue, sp.bValue, color.cibleLabL, color.cibleLabA, color.cibleLabB);
      if (dE <= tol.deltaEMax) confCount++;
    }
  }

  // Group by project
  const byProject: Record<string, { project: any; items: any[] }> = {};
  for (const sp of filtered) {
    const pid = sp.trial?.project?.id ?? "_none";
    if (!byProject[pid]) byProject[pid] = { project: sp.trial?.project, items: [] };
    byProject[pid].items.push(sp);
  }

  function showMultiForm() {
    openModal(
      "Mesures spectrocolorimetre — saisie par dossier",
      <SpectroMultiForm projects={projects} users={users} onSaved={() => { closeModal(); router.refresh(); }} />,
      "large"
    );
  }

  function showDetail(sp: any) {
    const color = sp.trial?.color;
    const tol = getTol(sp.trial?.project?.processId ?? "");
    openModal("Detail mesure spectro", <SpectroDetailModal sp={sp} color={color} tol={tol} />, "large");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Spectrocolorimetre</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Mesures L*a*b* + densites CMJN + reflectances</p>
        </div>
        {can("measure.create") && <Button variant="primary" onClick={showMultiForm}>+ Nouvelle mesure spectro</Button>}
      </div>

      {/* Search + KPIs */}
      <input type="text" placeholder="🔍 Rechercher par dossier, contexte..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input max-w-md mb-4" />

      <KpiGrid>
        <KpiCard icon="🌈" value={filtered.length} label="Mesures spectro" color="#8B5CF6" />
        <KpiCard icon="✅" value={confCount} label="Conformes" color="#10B981" />
        <KpiCard icon="✘" value={filtered.length - confCount} label="Non conformes" color="#EF4444" />
      </KpiGrid>

      {/* Grouped accordions */}
      <div className="mt-6">
        <AccordionGroup>
          {Object.entries(byProject).map(([pid, grp]) => {
            const pr = grp.project;
            let grpConf = 0;
            for (const sp of grp.items) {
              const c = sp.trial?.color;
              if (c) {
                const t = getTol(pr?.processId ?? "");
                if (deltaE76(sp.lValue, sp.aValue, sp.bValue, c.cibleLabL, c.cibleLabA, c.cibleLabB) <= t.deltaEMax) grpConf++;
              }
            }
            return (
              <Accordion
                key={pid}
                id={"spg_" + pid}
                title={
                  <div className="flex items-center gap-3 flex-wrap">
                    {pr && <SwatchStrip colors={projects.find((p: any) => p.id === pr.id)?.colors ?? []} size={16} />}
                    <span className="font-mono font-bold text-sm" style={{ color: "#3B82F6" }}>{pr?.codeDossier ?? "?"}</span>
                    <span className="text-sm">{pr?.cibleDescription ?? "Sans dossier"}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{grp.items.length} mesure(s)</span>
                    <span className="font-mono text-xs" style={{ color: "#10B981" }}>{grpConf} OK</span>
                    <span className="font-mono text-xs" style={{ color: "#EF4444" }}>{grp.items.length - grpConf} NC</span>
                  </div>
                }
              >
                <table className="data-table">
                  <thead>
                    <tr><th>Couleur</th><th>Essai</th><th>Contexte</th><th>L*</th><th>a*</th><th>b*</th><th>ΔE</th><th>Conf.</th><th>D.TD</th><th>Op.</th><th></th></tr>
                  </thead>
                  <tbody>
                    {grp.items.map((sp: any) => {
                      const color = sp.trial?.color;
                      const tol = getTol(pr?.processId ?? "");
                      let dE: number | null = null;
                      let ok: boolean | null = null;
                      if (color) {
                        dE = deltaE76(sp.lValue, sp.aValue, sp.bValue, color.cibleLabL, color.cibleLabA, color.cibleLabB);
                        ok = dE <= tol.deltaEMax;
                      }
                      return (
                        <tr key={sp.id}>
                          <td className="text-xs">
                            {color ? (
                              <div className="flex items-center gap-1">
                                <Swatch L={sp.lValue} a={sp.aValue} b={sp.bValue} size={12} />
                                P{color.poste} {color.nomCouleur}
                              </div>
                            ) : "-"}
                          </td>
                          <td className="font-mono">V{sp.trial?.numeroVersion ?? "?"}</td>
                          <td><ContextBadge context={sp.contexte} /></td>
                          <td className="font-mono font-semibold">{sp.lValue}</td>
                          <td className="font-mono font-semibold">{sp.aValue}</td>
                          <td className="font-mono font-semibold">{sp.bValue}</td>
                          <td>{dE != null ? <DeltaEValue dE={dE} maxDe={tol.deltaEMax} /> : "-"}</td>
                          <td>{ok != null ? <ConformityIndicator conforme={ok} compact /> : "-"}</td>
                          <td className="font-mono text-xs" style={{ color: "#8B5CF6" }}>{sp.densiteTd ?? (sp.densiteC ? "C" + sp.densiteC : "-")}</td>
                          <td className="text-xs" style={{ color: "var(--text-muted)" }}>{sp.operateur?.nom ?? ""}</td>
                          <td><button className="btn btn-ghost btn-sm" onClick={() => showDetail(sp)} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>🔍</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Accordion>
            );
          })}
        </AccordionGroup>

        {filtered.length === 0 && (
          <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Aucune mesure spectrocolorimetrique</div>
        )}
      </div>
    </div>
  );
}
