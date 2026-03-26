"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function TintsPage() {
  const { can } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!can("library.read")) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Accès refusé</h2>
        <p style={{ color: "var(--text-muted)" }}>Vous n avez pas la permission d accéder à la Bibliothèque de Teintes.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Bibliothèque de Teintes</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Standards couleur et formulations de référence pour tous les procédés d impression
        </p>
      </div>

      <div className="card p-6">
        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input w-auto"
          >
            <option value="all">Toutes les catégories</option>
            <option value="pantone">Pantone</option>
            <option value="hks">HKS</option>
            <option value="ral">RAL</option>
            <option value="custom">Personnalisées</option>
          </select>
          <input
            type="text"
            placeholder="🔍 Rechercher une teinte..."
            className="form-input max-w-xs"
          />
        </div>

        {/* Grille de teintes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[
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
          ].map((tint, index) => (
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
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {tint.code}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn btn-primary">
            🎨 Ajouter une teinte
          </button>
          <button className="btn btn-secondary">
            📤 Exporter la bibliothèque
          </button>
          <button className="btn btn-secondary">
            🔄 Synchroniser avec les standards
          </button>
        </div>

        {/* Info section */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "var(--accent-blue/10)" }}>
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>📚 Standards disponibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <div>Pantone Matching System (PMS)</div>
            <div>HKS Hostmann-Steinberg System</div>
            <div>RAL Classic et Design System</div>
            <div>Standards personnalisés MULTIPRINT</div>
            <div>Formulations offset et héliogravure</div>
            <div>Contrôles spectrophotométriques</div>
          </div>
        </div>
      </div>
    </div>
  );
}
