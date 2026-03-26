"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Swatch, Button } from "@/components/ui";
import { labToRgb } from "@/lib/colorimetry";

interface Props { projects: any[]; users: Array<{ id: string; nom: string }>; onSaved: () => void; }

interface DensitoRow {
  colorId: string; trialId: string; poste: number; nomCouleur: string;
  cibleL: number; cibleA: number; cibleB: number;
  densite: string; trapping: string; contraste: string;
}

export function DensitoMultiForm({ projects, users, onSaved }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const [projectId, setProjectId] = useState("");
  const [contexte, setContexte] = useState("essai");
  const [operateurId, setOperateurId] = useState(user?.id ?? "");
  const [rows, setRows] = useState<DensitoRow[]>([]);
  const [saving, setSaving] = useState(false);

  const pr = projects.find((p: any) => p.id === projectId);
  const isHelio = pr?.processId === "heliogravure";

  const onProjectChange = useCallback((pid: string) => {
    setProjectId(pid);
    if (!pid) { setRows([]); return; }
    const p = projects.find((pp: any) => pp.id === pid);
    if (!p) { setRows([]); return; }
    const newRows: DensitoRow[] = p.colors.map((c: any) => ({
      colorId: c.id, trialId: "", poste: c.poste, nomCouleur: c.nomCouleur,
      cibleL: c.cibleLabL, cibleA: c.cibleLabA, cibleB: c.cibleLabB,
      densite: "", trapping: "", contraste: "",
    }));
    fetch("/api/trials?projectId=" + pid).then((r) => r.json()).then((trials: any[]) => {
      for (const row of newRows) {
        const ct = trials.filter((t) => t.colorId === row.colorId && t.statut !== "valide" && t.statut !== "rejete");
        ct.sort((a: any, b: any) => b.numeroVersion - a.numeroVersion);
        if (ct.length > 0) row.trialId = ct[0].id;
      }
      setRows([...newRows]);
    });
    setRows(newRows);
  }, [projects]);

  function updateRow(idx: number, field: keyof DensitoRow, value: string) {
    setRows((prev) => { const n = [...prev]; (n[idx] as any)[field] = value; return n; });
  }

  async function handleSave() {
    const measurements = rows.filter((r) => r.densite && r.trialId).map((r) => ({
      trialId: r.trialId, densite: parseFloat(r.densite),
      trapping: r.trapping ? parseFloat(r.trapping) : null,
      contraste: r.contraste ? parseFloat(r.contraste) : null,
    }));
    if (measurements.length === 0) { toast.error("Aucune mesure saisie"); return; }
    setSaving(true);
    const res = await fetch("/api/densito", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexte, operateurId, measurements }),
    });
    setSaving(false);
    if (res.ok) { const data = await res.json(); toast.success(data.saved + " mesure(s) enregistree(s)"); onSaved(); }
    else toast.error("Erreur d'enregistrement");
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="form-label">Dossier</label>
          <select value={projectId} onChange={(e) => onProjectChange(e.target.value)} className="form-input">
            <option value="">-- Selectionner --</option>
            {projects.map((p: any) => <option key={p.id} value={p.id}>{p.codeDossier} — {p.cibleDescription} ({p.colors.length} coul.)</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Contexte</label>
          <select value={contexte} onChange={(e) => setContexte(e.target.value)} className="form-input">
            {["essai", "avant_cuisson", "apres_cuisson", "production"].map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
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

      {rows.length > 0 && (
        <>
          <div className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            {rows.length} COULEUR(S) — DENSITE{!isHelio ? " + TRAPPING + CONTRASTE" : ""}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>P</th><th>Couleur</th><th>Essai</th><th style={{ width: 90 }}>Densite</th>
                {!isHelio && <><th style={{ width: 80 }}>Trapping%</th><th style={{ width: 80 }}>Contraste</th></>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td><div className="flex items-center gap-1"><span className="font-mono font-bold text-xs" style={{ color: "#06B6D4" }}>P{row.poste}</span><Swatch L={row.cibleL} a={row.cibleA} b={row.cibleB} size={14} /></div></td>
                  <td className="text-xs font-semibold">{row.nomCouleur}</td>
                  <td className="text-xs" style={{ color: row.trialId ? "#06B6D4" : "#F97316" }}>{row.trialId ? "Actif" : "Aucun"}</td>
                  <td><input type="number" step="0.01" value={row.densite} onChange={(e) => updateRow(i, "densite", e.target.value)} className="form-input font-mono text-center" placeholder="1.45" /></td>
                  {!isHelio && (
                    <>
                      <td><input type="number" step="1" value={row.trapping} onChange={(e) => updateRow(i, "trapping", e.target.value)} className="form-input font-mono text-center" placeholder="80" /></td>
                      <td><input type="number" step="1" value={row.contraste} onChange={(e) => updateRow(i, "contraste", e.target.value)} className="form-input font-mono text-center" placeholder="35" /></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <Button variant="primary" loading={saving} onClick={handleSave}>✔ Enregistrer {rows.length} mesure(s)</Button>
          </div>
        </>
      )}
      {rows.length === 0 && <div className="py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>{projectId ? "Chargement..." : "Selectionnez un dossier"}</div>}
    </div>
  );
}
