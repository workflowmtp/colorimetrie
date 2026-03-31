"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { PROCESSES, SUPPORTS } from "@/lib/constants";

interface ClientOption {
  id: string;
  nom: string;
}

interface MachineOption {
  id: string;
  nomMachine: string;
  typeProcede: string;
}

interface UserOption {
  id: string;
  nom: string;
}

interface ColorRow {
  poste: number;
  nomCouleur: string;
  typeCouleur: string;
  cibleLabL: string;
  cibleLabA: string;
  cibleLabB: string;
}

const EMPTY_COLOR: ColorRow = {
  poste: 1,
  nomCouleur: "",
  typeCouleur: "Pantone",
  cibleLabL: "",
  cibleLabA: "",
  cibleLabB: "",
};

const COLOR_TYPES = ["Pantone", "CMJN", "Quadri", "Ton_direct", "Vernis", "Autre"];

export default function NewProjectPage() {
  const router = useRouter();
  const { can } = useAuth();
  const toast = useToast();

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [machines, setMachines] = useState<MachineOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [clientId, setClientId] = useState("");
  const [processId, setProcessId] = useState("offset_papier");
  const [supportId, setSupportId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [cibleDescription, setCibleDescription] = useState("");
  const [priorite, setPriorite] = useState("normale");
  const [colors, setColors] = useState<ColorRow[]>([{ ...EMPTY_COLOR }]);

  // Load reference data
  useEffect(() => {
    Promise.all([
      fetch("/api/settings/clients").then((r) => r.json()),
      fetch("/api/settings/machines").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([c, m, u]) => {
      setClients(Array.isArray(c) ? c : []);
      setMachines(Array.isArray(m) ? m : []);
      setUsers(Array.isArray(u) ? u : []);
    }).catch(() => {});
  }, []);

  // Filter machines by process
  const filteredMachines = machines.filter((m) => m.typeProcede === processId);

  function addColor() {
    setColors((prev) => [...prev, { ...EMPTY_COLOR, poste: prev.length + 1 }]);
  }

  function removeColor(idx: number) {
    if (colors.length <= 1) return;
    setColors((prev) => prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, poste: i + 1 })));
  }

  function updateColor(idx: number, field: keyof ColorRow, value: string) {
    setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) { toast.error("Selectionnez un client"); return; }
    if (colors.some((c) => !c.nomCouleur.trim())) { toast.error("Chaque couleur doit avoir un nom"); return; }
    if (colors.some((c) => c.cibleLabL === "" || c.cibleLabA === "" || c.cibleLabB === "")) {
      toast.error("Chaque couleur doit avoir les valeurs L*a*b*"); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          processId,
          supportId: supportId || null,
          machineId: machineId || null,
          responsableId: responsableId || null,
          cibleDescription,
          priorite,
          colors: colors.map((c) => ({
            poste: c.poste,
            nomCouleur: c.nomCouleur,
            typeCouleur: c.typeCouleur,
            cibleLabL: parseFloat(c.cibleLabL),
            cibleLabA: parseFloat(c.cibleLabA),
            cibleLabB: parseFloat(c.cibleLabB),
          })),
        }),
      });

      if (res.ok) {
        const project = await res.json();
        toast.success("Dossier " + project.codeDossier + " cree");
        router.push("/projects/" + project.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la creation");
      }
    } catch {
      toast.error("Erreur reseau");
    } finally {
      setLoading(false);
    }
  }

  if (!can("project.create")) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Acces refuse</h2>
        <p style={{ color: "var(--text-muted)" }}>Vous n&apos;avez pas la permission de creer un dossier.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Nouveau dossier couleur</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Remplissez les informations et ajoutez les couleurs cibles</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informations generales */}
        <div className="card mb-4">
          <div className="card-header">
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Informations generales</h2>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div>
              <label className="form-label">Client *</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="form-input" required>
                <option value="">-- Selectionnez --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Procede */}
            <div>
              <label className="form-label">Procede *</label>
              <select value={processId} onChange={(e) => { setProcessId(e.target.value); setMachineId(""); }} className="form-input">
                {PROCESSES.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            {/* Support */}
            <div>
              <label className="form-label">Support</label>
              <select value={supportId} onChange={(e) => setSupportId(e.target.value)} className="form-input">
                <option value="">-- Optionnel --</option>
                {SUPPORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Machine */}
            <div>
              <label className="form-label">Machine</label>
              <select value={machineId} onChange={(e) => setMachineId(e.target.value)} className="form-input">
                <option value="">-- Optionnel --</option>
                {filteredMachines.map((m) => (
                  <option key={m.id} value={m.id}>{m.nomMachine}</option>
                ))}
              </select>
            </div>

            {/* Responsable */}
            <div>
              <label className="form-label">Responsable</label>
              <select value={responsableId} onChange={(e) => setResponsableId(e.target.value)} className="form-input">
                <option value="">-- Auto (moi) --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.nom}</option>
                ))}
              </select>
            </div>

            {/* Priorite */}
            <div>
              <label className="form-label">Priorite</label>
              <select value={priorite} onChange={(e) => setPriorite(e.target.value)} className="form-input">
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="form-label">Description cible</label>
              <input
                type="text"
                value={cibleDescription}
                onChange={(e) => setCibleDescription(e.target.value)}
                className="form-input"
                placeholder="Ex: Pantone 294 sur papier couche 150g"
              />
            </div>
          </div>
        </div>

        {/* Couleurs */}
        <div className="card mb-4">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Couleurs cibles ({colors.length})</h2>
            <button type="button" onClick={addColor} className="btn btn-sm btn-primary">+ Couleur</button>
          </div>
          <div className="card-body space-y-4">
            {colors.map((color, idx) => (
              <div key={idx} className="p-3 rounded-lg border" style={{ borderColor: "var(--border-light)", background: "var(--bg-elevated)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Poste {color.poste}</span>
                  {colors.length > 1 && (
                    <button type="button" onClick={() => removeColor(idx)} className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Nom couleur */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text"
                      value={color.nomCouleur}
                      onChange={(e) => updateColor(idx, "nomCouleur", e.target.value)}
                      className="form-input"
                      placeholder="Pantone 294 C"
                      required
                    />
                  </div>
                  {/* Type */}
                  <div>
                    <label className="form-label">Type</label>
                    <select value={color.typeCouleur} onChange={(e) => updateColor(idx, "typeCouleur", e.target.value)} className="form-input">
                      {COLOR_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  {/* L* */}
                  <div>
                    <label className="form-label">L*</label>
                    <input
                      type="number" step="0.01"
                      value={color.cibleLabL}
                      onChange={(e) => updateColor(idx, "cibleLabL", e.target.value)}
                      className="form-input font-mono"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {/* a* */}
                  <div>
                    <label className="form-label">a*</label>
                    <input
                      type="number" step="0.01"
                      value={color.cibleLabA}
                      onChange={(e) => updateColor(idx, "cibleLabA", e.target.value)}
                      className="form-input font-mono"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {/* b* */}
                  <div>
                    <label className="form-label">b*</label>
                    <input
                      type="number" step="0.01"
                      value={color.cibleLabB}
                      onChange={(e) => updateColor(idx, "cibleLabB", e.target.value)}
                      className="form-input font-mono"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="btn btn-ghost">Annuler</button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Creation en cours..." : "Creer le dossier"}
          </button>
        </div>
      </form>
    </div>
  );
}
