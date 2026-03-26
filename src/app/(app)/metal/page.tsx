"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function MetalPage() {
  const { can } = useAuth();
  const [selectedStandard, setSelectedStandard] = useState("");

  if (!can("metal.read")) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Accès refusé</h2>
        <p style={{ color: "var(--text-muted)" }}>Vous n'avez pas la permission d'accéder à Offset Metal.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Offset Metal</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Gestion des standards et formulations pour impression offset sur métal (ETP/TFS)
        </p>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>🔩 ETP (Étain Tin Plated)</h3>
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              Supports en tôle étamée pour boîtes de conserve
            </p>
            <button className="btn btn-secondary btn-sm">Voir les standards</button>
          </div>
          
          <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>🥫 TFS (Tin Free Steel)</h3>
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              Supports en acier sans étam pour applications alimentaires
            </p>
            <button className="btn btn-secondary btn-sm">Voir les standards</button>
          </div>
          
          <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>🎨 Formulations</h3>
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              Bibliothèque de formulations offset métal
            </p>
            <button className="btn btn-secondary btn-sm">Explorer</button>
          </div>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--accent-blue/10)" }}>
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>📋 Standards disponibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <div>• Pantone Metal™ standards</div>
            <div>• Formulations ETP/TFS optimisées</div>
            <div>• Contrastes et densités recommandés</div>
            <div>• Tests de résistance et adhérence</div>
          </div>
        </div>
      </div>
    </div>
  );
}
