"use client";

import { useState } from "react";
import { AccordionGroup, Accordion, ProcessBadge, CompTypeBadge, Swatch, Badge } from "@/components/ui";
import { formatFCFA, formatWeight } from "@/lib/utils";

interface Props { recipes: any[]; }

export function RecipeLibraryClient({ recipes }: Props) {
  const [search, setSearch] = useState("");
  const [processFilter, setProcessFilter] = useState("all");

  const filtered = recipes.filter((f) => {
    if (processFilter !== "all" && f.processType !== processFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!f.codeFormule.toLowerCase().includes(s) && !(f.trial?.color?.nomCouleur ?? "").toLowerCase().includes(s) && !(f.trial?.project?.codeDossier ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Bibliotheque Recettes</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{recipes.length} recette(s) validee(s)</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="🔍 Rechercher recette, couleur, dossier..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input max-w-xs" />
        <select value={processFilter} onChange={(e) => setProcessFilter(e.target.value)} className="form-input w-auto">
          <option value="all">Tous procedes</option>
          <option value="offset_papier">Offset</option>
          <option value="heliogravure">Heliogravure</option>
          <option value="offset_metal">Offset Metal</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Aucune recette validee</div>
      ) : (
        <AccordionGroup>
          {filtered.map((f) => (
            <Accordion
              key={f.id}
              id={"rec_" + f.id}
              title={
                <div className="flex items-center gap-3 flex-wrap">
                  {f.trial?.color && <Swatch L={f.trial.color.cibleLabL} a={f.trial.color.cibleLabA} b={f.trial.color.cibleLabB} size={16} />}
                  <span className="font-mono font-bold text-sm" style={{ color: "#06B6D4" }}>{f.codeFormule}</span>
                  <span className="text-xs">{f.trial?.color?.nomCouleur ?? ""}</span>
                  <span className="text-xs" style={{ color: "#3B82F6" }}>{f.trial?.project?.codeDossier ?? ""}</span>
                  <ProcessBadge processId={f.processType} />
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{f.items.length} comp. • {formatWeight(f.poidsTotal)} • {formatFCFA(f.coutTotal)}</span>
                </div>
              }
            >
              <table className="data-table">
                <thead><tr><th>Composant</th><th>Type</th><th>Poids</th><th>%</th><th>Fournisseur</th></tr></thead>
                <tbody>
                  {f.items.map((it: any) => (
                    <tr key={it.id}>
                      <td className="font-medium text-sm">{it.composant}</td>
                      <td><CompTypeBadge type={it.typeComposant} /></td>
                      <td className="font-mono font-semibold">{it.poids}g</td>
                      <td className="font-mono text-xs">{it.pourcentage}%</td>
                      <td className="text-xs" style={{ color: "var(--text-muted)" }}>{it.fournisseur || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Accordion>
          ))}
        </AccordionGroup>
      )}
    </div>
  );
}
