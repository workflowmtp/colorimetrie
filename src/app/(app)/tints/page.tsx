"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

interface Tint {
  name: string;
  code: string;
  category: string;
}

const DEFAULT_TINTS: Tint[] = [
  { name: "PANTONE 185 C", code: "#D9232F", category: "pantone" },
  { name: "PANTONE 294 C", code: "#003865", category: "pantone" },
  { name: "PANTONE 032 C", code: "#ED1C24", category: "pantone" },
  { name: "PANTONE 354 C", code: "#00A651", category: "pantone" },
  { name: "PANTONE 7406 C", code: "#FDB813", category: "pantone" },
  { name: "PANTONE 877 C", code: "#8B8680", category: "pantone" },
  { name: "HKS 41 K", code: "#1F497D", category: "hks" },
  { name: "HKS 44 K", code: "#0066CC", category: "hks" },
  { name: "RAL 3020", code: "#BB1E10", category: "ral" },
  { name: "RAL 5010", code: "#004E7C", category: "ral" },
  { name: "RAL 6010", code: "#4E6A50", category: "ral" },
  { name: "RAL 9010", code: "#F1EFE2", category: "ral" },
];

export default function TintsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [tints, setTints] = useState<Tint[]>(DEFAULT_TINTS);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("#000000");
  const [newCategory, setNewCategory] = useState("custom");

  function handleAddTint(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) { toast.error("Le nom est obligatoire"); return; }
    if (!newCode.trim()) { toast.error("Le code couleur est obligatoire"); return; }

    setTints((prev) => [...prev, { name: newName.trim(), code: newCode, category: newCategory }]);
    toast.success("Teinte " + newName.trim() + " ajoutee");
    setNewName("");
    setNewCode("#000000");
    setNewCategory("custom");
    setShowForm(false);
  }

  const filtered = tints.filter((t) => {
    if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.name.toLowerCase().includes(s) && !t.code.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  if (!can("library.read")) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Acces refuse</h2>
        <p style={{ color: "var(--text-muted)" }}>Vous n&apos;avez pas la permission d&apos;acceder a la Bibliotheque de Teintes.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Bibliotheque de Teintes</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Standards couleur et formulations de reference — {tints.length} teinte(s)
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ Fermer" : "🎨 Ajouter une teinte"}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Nouvelle teinte</h2>
          </div>
          <form onSubmit={handleAddTint} className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                  placeholder="PANTONE 300 C"
                  required
                />
              </div>
              <div>
                <label className="form-label">Couleur (hex) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="form-input font-mono"
                    placeholder="#003865"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Categorie</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="form-input">
                  <option value="pantone">Pantone</option>
                  <option value="hks">HKS</option>
                  <option value="ral">RAL</option>
                  <option value="custom">Personnalisee</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">Ajouter</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Annuler</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="card p-6">
        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input w-auto"
          >
            <option value="all">Toutes les categories</option>
            <option value="pantone">Pantone</option>
            <option value="hks">HKS</option>
            <option value="ral">RAL</option>
            <option value="custom">Personnalisees</option>
          </select>
          <input
            type="text"
            placeholder="🔍 Rechercher une teinte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input max-w-xs"
          />
        </div>

        {/* Grille de teintes */}
        {filtered.length === 0 ? (
          <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Aucune teinte trouvee</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map((tint, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 border-2"
                  style={{ 
                    backgroundColor: tint.code,
                    borderColor: "var(--border)"
                  }}
                />
                <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {tint.name}
                </div>
                <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {tint.code}
                </div>
                <div className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
                  {tint.category}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info section */}
        <div className="mt-6 p-4 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>📚 Standards disponibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <div>Pantone Matching System (PMS)</div>
            <div>HKS Hostmann-Steinberg System</div>
            <div>RAL Classic et Design System</div>
            <div>Standards personnalises MULTIPRINT</div>
            <div>Formulations offset et heliogravure</div>
            <div>Controles spectrophotometriques</div>
          </div>
        </div>
      </div>
    </div>
  );
}
