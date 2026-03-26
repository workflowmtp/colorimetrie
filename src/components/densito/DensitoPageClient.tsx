"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useModal } from "@/hooks/useModal";
import { AccordionGroup, Accordion, KpiCard, ContextBadge, ConformityIndicator, SwatchStrip, Button } from "@/components/ui";
import { DensitoMultiForm } from "./DensitoMultiForm";

interface Props { densitos: any[]; projects: any[]; users: Array<{ id: string; nom: string }>; }

export function DensitoPageClient({ densitos, projects, users }: Props) {
  const router = useRouter();
  const { can } = useAuth();
  const toast = useToast();
  const { openModal, closeModal } = useModal();
  const [search, setSearch] = useState("");

  const filtered = densitos.filter((dn) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (dn.trial?.project?.codeDossier ?? "").toLowerCase().includes(s) || (dn.couleur || "").toLowerCase().includes(s);
  });

  // Group by project
  const byProject: Record<string, { project: any; items: any[] }> = {};
  for (const dn of filtered) {
    const pid = dn.trial?.project?.id ?? "_none";
    if (!byProject[pid]) byProject[pid] = { project: dn.trial?.project, items: [] };
    byProject[pid].items.push(dn);
  }

  function showMultiForm() {
    openModal(
      "Mesures densitometre — saisie par dossier",
      <DensitoMultiForm projects={projects} users={users} onSaved={() => { closeModal(); router.refresh(); }} />,
      "large"
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Densitometre</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Densites optiques, trapping, contraste</p>
        </div>
        {can("measure.create") && <Button variant="primary" onClick={showMultiForm}>+ Nouvelle mesure densito</Button>}
      </div>

      <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input max-w-md mb-4" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <KpiCard icon="📊" value={filtered.length} label="Mesures densito" color="#06B6D4" />
      </div>

      <AccordionGroup>
        {Object.entries(byProject).map(([pid, grp]) => {
          const pr = grp.project;
          return (
            <Accordion
              key={pid}
              id={"dng_" + pid}
              title={
                <div className="flex items-center gap-3 flex-wrap">
                  {pr && <SwatchStrip colors={projects.find((p: any) => p.id === pr.id)?.colors ?? []} size={16} />}
                  <span className="font-mono font-bold text-sm" style={{ color: "#3B82F6" }}>{pr?.codeDossier ?? "?"}</span>
                  <span className="text-sm">{pr?.cibleDescription ?? "Sans dossier"}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{grp.items.length} mesure(s)</span>
                </div>
              }
            >
              <table className="data-table">
                <thead><tr><th>Essai</th><th>Contexte</th><th>Canal</th><th>Densite</th><th>Trapping</th><th>Contraste</th><th>Op.</th></tr></thead>
                <tbody>
                  {grp.items.map((dn: any) => (
                    <tr key={dn.id}>
                      <td className="font-mono">V{dn.trial?.numeroVersion ?? "?"}</td>
                      <td><ContextBadge context={dn.contexte} /></td>
                      <td>{dn.couleur}</td>
                      <td className="font-mono font-bold">{dn.densite}</td>
                      <td className="font-mono" style={{ color: dn.trapping != null && dn.trapping >= 70 ? "#10B981" : dn.trapping != null ? "#EF4444" : "var(--text-muted)" }}>{dn.trapping != null ? dn.trapping + "%" : "-"}</td>
                      <td className="font-mono" style={{ color: dn.contraste != null && dn.contraste >= 25 ? "#10B981" : dn.contraste != null ? "#EF4444" : "var(--text-muted)" }}>{dn.contraste ?? "-"}</td>
                      <td className="text-xs" style={{ color: "var(--text-muted)" }}>{dn.operateur?.nom ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Accordion>
          );
        })}
      </AccordionGroup>

      {filtered.length === 0 && <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Aucune mesure densitometrique</div>}
    </div>
  );
}
