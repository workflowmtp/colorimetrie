"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Swatch, DeltaEValue, Button } from "@/components/ui";
import { deltaE76, labToRgb } from "@/lib/colorimetry";

interface Props {
  projects: any[];
  users: Array<{ id: string; nom: string }>;
  onSaved: () => void;
}

interface ColorRow {
  colorId: string; trialId: string; poste: number; nomCouleur: string;
  cibleL: number; cibleA: number; cibleB: number;
  L: string; a: string; b: string;
  dC: string; dM: string; dJ: string; dN: string; dTd: string;
}

export function SpectroMultiForm({ projects, users, onSaved }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const [projectId, setProjectId] = useState("");
  const [contexte, setContexte] = useState("essai");
  const [lectureNum, setLectureNum] = useState(1);
  const [operateurId, setOperateurId] = useState(user?.id ?? "");
  const [showCMJN, setShowCMJN] = useState(false);
  const [rows, setRows] = useState<ColorRow[]>([]);
  const [saving, setSaving] = useState(false);

  const onProjectChange = useCallback((pid: string) => {
    setProjectId(pid);
    if (!pid) { setRows([]); return; }
    const pr = projects.find((p: any) => p.id === pid);
    if (!pr) { setRows([]); return; }
    // Build rows from project colors + find latest active trial per color
    const newRows: ColorRow[] = pr.colors.map((c: any) => {
      // This is simplified — in production, we'd fetch trials via API
      return {
        colorId: c.id, trialId: "", poste: c.poste, nomCouleur: c.nomCouleur,
        cibleL: c.cibleLabL, cibleA: c.cibleLabA, cibleB: c.cibleLabB,
        L: "", a: "", b: "", dC: "", dM: "", dJ: "", dN: "", dTd: "",
      };
    });
    // Fetch trials for this project
    fetch("/api/trials?projectId=" + pid).then((r) => r.json()).then((trials: any[]) => {
      for (const row of newRows) {
        const colorTrials = trials.filter((t) => t.colorId === row.colorId && t.statut !== "valide" && t.statut !== "rejete");
        colorTrials.sort((a: any, b: any) => b.numeroVersion - a.numeroVersion);
        if (colorTrials.length > 0) row.trialId = colorTrials[0].id;
      }
      setRows([...newRows]);
    });
    setRows(newRows);
  }, [projects]);

  function updateRow(idx: number, field: keyof ColorRow, value: string) {
    setRows((prev) => { const n = [...prev]; (n[idx] as any)[field] = value; return n; });
  }

  async function handleSave() {
    if (!projectId) { toast.error("Selectionnez un dossier"); return; }
    const measurements = rows.filter((r) => r.L && r.a && r.b && r.trialId).map((r) => ({
      trialId: r.trialId,
      lValue: parseFloat(r.L), aValue: parseFloat(r.a), bValue: parseFloat(r.b),
      densiteC: r.dC ? parseFloat(r.dC) : null,
      densiteM: r.dM ? parseFloat(r.dM) : null,
      densiteJ: r.dJ ? parseFloat(r.dJ) : null,
      densiteN: r.dN ? parseFloat(r.dN) : null,
      densiteTd: r.dTd ? parseFloat(r.dTd) : null,
    }));
    if (measurements.length === 0) { toast.error("Aucune mesure saisie"); return; }

    setSaving(true);
    const res = await fetch("/api/spectro", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexte, lectureNumero: lectureNum, operateurId, measurements }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      toast.success(data.saved + " mesure(s) enregistree(s)");
      onSaved();
    } else { toast.error("Erreur d'enregistrement"); }
  }

  return (
    <div>
      {/* Project selector + context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="form-label">Dossier</label>
          <select value={projectId} onChange={(e) => onProjectChange(e.target.value)} className="form-input">
            <option value="">-- Selectionner --</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>{p.codeDossier} — {p.cibleDescription} ({p.colors.length} coul.)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Contexte</label>
          <select value={contexte} onChange={(e) => setContexte(e.target.value)} className="form-input">
            {["essai", "avant_cuisson", "apres_cuisson", "production", "controle_final"].map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Mesure par</label>
          <select value={operateurId} onChange={(e) => setOperateurId(e.target.value)} className="form-input">
            <option value="">--</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}
          </select>
        </div>
      </div>

      {/* CMJN toggle */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
          {rows.length} COULEUR(S) A MESURER
        </span>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
          <input type="checkbox" checked={showCMJN} onChange={(e) => setShowCMJN(e.target.checked)} /> Saisir densites CMJN
        </label>
      </div>

      {/* Color rows */}
      {rows.length === 0 && projectId && (
        <div className="py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>Chargement des couleurs...</div>
      )}
      {rows.length === 0 && !projectId && (
        <div className="py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>Selectionnez un dossier</div>
      )}

      {rows.map((row, i) => {
        const hasValues = row.L && row.a && row.b;
        const L = parseFloat(row.L); const a = parseFloat(row.a); const b = parseFloat(row.b);
        let dE: number | null = null;
        if (hasValues && !isNaN(L) && !isNaN(a) && !isNaN(b)) {
          dE = deltaE76(L, a, b, row.cibleL, row.cibleA, row.cibleB);
        }
        const swatchRgb = hasValues && dE != null ? labToRgb(L, a, b) : "#555";

        return (
          <div key={i}>
            {/* Main LAB row */}
            <div className="grid gap-2 items-end mb-1" style={{ gridTemplateColumns: "44px 1fr 78px 78px 78px 90px 32px" }}>
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono font-bold text-xs" style={{ color: "#06B6D4" }}>P{row.poste}</span>
                <Swatch L={row.cibleL} a={row.cibleA} b={row.cibleB} size={20} />
              </div>
              <div>
                <div className="font-semibold text-xs">{row.nomCouleur}</div>
                <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Cible: {row.cibleL}/{row.cibleA}/{row.cibleB}</div>
                {!row.trialId && <div className="text-[10px]" style={{ color: "#F97316" }}>Aucun essai actif</div>}
              </div>
              <div>
                <label className="form-label">L*</label>
                <input type="number" step="0.01" value={row.L} onChange={(e) => updateRow(i, "L", e.target.value)} placeholder={String(row.cibleL)} className="form-input font-mono text-center" />
              </div>
              <div>
                <label className="form-label">a*</label>
                <input type="number" step="0.01" value={row.a} onChange={(e) => updateRow(i, "a", e.target.value)} placeholder={String(row.cibleA)} className="form-input font-mono text-center" />
              </div>
              <div>
                <label className="form-label">b*</label>
                <input type="number" step="0.01" value={row.b} onChange={(e) => updateRow(i, "b", e.target.value)} placeholder={String(row.cibleB)} className="form-input font-mono text-center" />
              </div>
              <div className="text-center pt-4">
                {dE != null ? <DeltaEValue dE={dE} maxDe={3} /> : <span style={{ color: "var(--text-muted)" }}>—</span>}
              </div>
              <div className="pt-4">
                <div className="w-6 h-6 rounded swatch" style={{ background: swatchRgb }} />
              </div>
            </div>

            {/* CMJN sub-row */}
            {showCMJN && (
              <div className="pl-12 pb-2 flex gap-2 flex-wrap" style={{ background: "var(--bg-elevated)", borderRadius: "0 0 8px 8px", marginTop: -2, padding: "6px 12px 8px 48px" }}>
                {[
                  { key: "dC" as const, label: "D Cyan", color: "#0097A7" },
                  { key: "dM" as const, label: "D Mag.", color: "#C2185B" },
                  { key: "dJ" as const, label: "D Jaune", color: "#F9A825" },
                  { key: "dN" as const, label: "D Noir", color: "#37474F" },
                  { key: "dTd" as const, label: "Ton direct", color: "#8B5CF6" },
                ].map((d) => (
                  <div key={d.key} className="w-16">
                    <label className="text-[9px] font-semibold" style={{ color: d.color }}>{d.label}</label>
                    <input type="number" step="0.01" value={row[d.key]} onChange={(e) => updateRow(i, d.key, e.target.value)} className="form-input font-mono text-center text-xs" style={{ padding: "3px" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Save */}
      {rows.length > 0 && (
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            ✔ Enregistrer toutes les mesures
          </Button>
        </div>
      )}
    </div>
  );
}
