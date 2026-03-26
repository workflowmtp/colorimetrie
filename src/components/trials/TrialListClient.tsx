"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccordionGroup, Accordion, TrialStatusBadge, Swatch, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface TrialData {
  id: string; numeroVersion: number; hypothese: string; statut: string; dateEssai: string; commentaire: string;
  project: { id: string; codeDossier: string; processId: string; cibleDescription: string } | null;
  color: { poste: number; nomCouleur: string; cibleLabL: number; cibleLabA: number; cibleLabB: number } | null;
  operateur: { nom: string } | null;
  _count: { spectroMeasurements: number; densitoMeasurements: number };
}

export function TrialListClient({ trials }: { trials: TrialData[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = trials.filter((t) => {
    if (statusFilter !== "all" && t.statut !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(t.project?.codeDossier ?? "").toLowerCase().includes(s) && !t.hypothese.toLowerCase().includes(s) && !(t.color?.nomCouleur ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Essais</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{trials.length} essai(s)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input w-auto">
          <option value="all">Tous statuts</option>
          {["en_cours","mesure","analyse","a_corriger","candidat_validation","valide","rejete"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Aucun essai</div>
      ) : (
        <AccordionGroup>
          {filtered.map((trial) => (
            <Accordion
              key={trial.id}
              id={"tri_" + trial.id}
              title={
                <div className="flex items-center gap-3 flex-wrap">
                  {trial.color && <Swatch L={trial.color.cibleLabL} a={trial.color.cibleLabA} b={trial.color.cibleLabB} size={18} />}
                  <span className="font-mono font-bold text-sm" style={{ color: "#3B82F6" }}>{trial.project?.codeDossier ?? "?"}</span>
                  <span className="font-mono font-semibold text-sm">V{trial.numeroVersion}</span>
                  {trial.color && <span className="text-xs" style={{ color: "#06B6D4" }}>P{trial.color.poste} {trial.color.nomCouleur}</span>}
                  <TrialStatusBadge status={trial.statut} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{trial._count.spectroMeasurements} spectro • {trial._count.densitoMeasurements} densito</span>
                </div>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Hypothese</span>{trial.hypothese}</div>
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Operateur</span>{trial.operateur?.nom ?? "-"}</div>
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Date</span>{formatDate(trial.dateEssai)}</div>
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Dossier</span>{trial.project?.cibleDescription ?? "-"}</div>
              </div>
              {trial.commentaire && <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{trial.commentaire}</p>}
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => router.push("/trials/" + trial.id)}>📄 Detail</Button>
                <Button size="sm" variant="ghost" onClick={() => router.push("/projects/" + trial.project?.id)}>📁 Dossier</Button>
              </div>
            </Accordion>
          ))}
        </AccordionGroup>
      )}
    </div>
  );
}
