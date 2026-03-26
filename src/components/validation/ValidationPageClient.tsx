"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Accordion, KpiCard, KpiGrid, StatusBadge, SwatchStrip, Swatch, DeltaEValue, ConformityIndicator, Button } from "@/components/ui";
import { deltaE76 } from "@/lib/colorimetry";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Tolerance } from "@prisma/client";

interface Props { projects: any[]; tolerances: Tolerance[]; }

export function ValidationPageClient({ projects, tolerances }: Props) {
  const router = useRouter();
  const { can } = useAuth();
  const toast = useToast();

  function getTol(processId: string) {
    return tolerances.find((t) => t.processId === processId) ?? { deltaEMax: 3 };
  }

  const pending = projects.filter((p) => p.statut === "a_valider");
  const validated = projects.filter((p) => p.statut !== "a_valider");

  async function doValidation(projectId: string, decision: string, commentaire: string) {
    const res = await fetch("/api/validations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, decision, commentaire }) });
    if (res.ok) { toast.success("Validation enregistree"); router.refresh(); }
    else toast.error("Erreur validation");
  }

  function renderCard(pr: any, isPending: boolean) {
    const tol = getTol(pr.processId);
    let allOk = true;

    // Per-color analysis
    const colorData = pr.colors.map((color: any) => {
      const colorTrials = pr.trials.filter((t: any) => t.colorId === color.id);
      let bestDE = 999;
      for (const trial of colorTrials) {
        for (const sp of trial.spectroMeasurements ?? []) {
          const dE = deltaE76(sp.lValue, sp.aValue, sp.bValue, color.cibleLabL, color.cibleLabA, color.cibleLabB);
          if (dE < bestDE) bestDE = dE;
        }
      }
      const conf = bestDE <= tol.deltaEMax;
      if (!conf) allOk = false;
      return { color, trials: colorTrials.length, bestDE, conf };
    });

    const lastVal = pr.validations?.[0];

    return (
      <div key={pr.id} className="card p-4 mb-3">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-3">
            <SwatchStrip colors={pr.colors} size={22} />
            <div>
              <span className="font-mono font-bold text-sm cursor-pointer" style={{ color: "#3B82F6" }} onClick={() => router.push("/projects/" + pr.id)}>{pr.codeDossier}</span>
              <span className="text-sm ml-2">{pr.cibleDescription}</span>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{pr.client.nom} • {pr.colors.length} couleur(s)</div>
            </div>
          </div>
          {lastVal && <StatusBadge status={lastVal.statutValidation} />}
        </div>

        {/* Per-color table */}
        <table className="data-table mb-3">
          <thead><tr><th>Poste</th><th>Couleur</th><th>Essais</th><th>Meilleur ΔE</th><th>Conf.</th>{isPending && can("validation.create") && <th>Decision</th>}</tr></thead>
          <tbody>
            {colorData.map((cd: any) => (
              <tr key={cd.color.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold" style={{ color: "#06B6D4" }}>P{cd.color.poste}</span>
                    <Swatch L={cd.color.cibleLabL} a={cd.color.cibleLabA} b={cd.color.cibleLabB} size={14} />
                  </div>
                </td>
                <td className="text-sm font-medium">{cd.color.nomCouleur}</td>
                <td className="font-mono">{cd.trials}</td>
                <td>{cd.bestDE < 999 ? <DeltaEValue dE={cd.bestDE} maxDe={tol.deltaEMax} /> : <span style={{ color: "var(--text-muted)" }}>-</span>}</td>
                <td>{cd.bestDE < 999 ? <ConformityIndicator conforme={cd.conf} /> : <span style={{ color: "var(--text-muted)" }}>--</span>}</td>
                {isPending && can("validation.create") && (
                  <td className="text-xs" style={{ color: cd.conf ? "#10B981" : "#EF4444" }}>{cd.conf ? "✔ Pret" : "✘ Non pret"}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Global summary */}
        <div className="flex items-center gap-4 text-sm mb-3">
          <span style={{ color: "var(--text-muted)" }}>Conformite globale :</span>
          <span className="font-bold" style={{ color: allOk ? "#10B981" : "#EF4444" }}>{allOk ? "TOUTES OK" : "NC"}</span>
        </div>

        {/* Validation buttons */}
        {isPending && can("validation.create") && (
          <div className="flex gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            {allOk ? (
              <Button size="sm" variant="success" onClick={() => doValidation(pr.id, "valide", "Toutes couleurs conformes")}>
                ✔ Valider le dossier ({pr.colors.length} couleurs conformes)
              </Button>
            ) : (
              <Button size="sm" variant="success" disabled>✔ Valider (toutes les couleurs doivent etre conformes)</Button>
            )}
            <Button size="sm" variant="warning" onClick={() => doValidation(pr.id, "valide_reserve", "Validation sous reserve")}>⚠ Sous reserve</Button>
            <Button size="sm" variant="danger" onClick={() => doValidation(pr.id, "rejete", "")}>✘ Rejeter</Button>
          </div>
        )}

        {/* Past validation */}
        {lastVal?.commentaire && (
          <div className="mt-2 text-xs p-2 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <strong>Note :</strong> {lastVal.commentaire} — {lastVal.validePar?.nom}, {formatDate(lastVal.dateValidation)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Validation Laboratoire</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Valider, rejeter ou conditionner les teintes</p>
      </div>

      <KpiGrid>
        <KpiCard icon="⏳" value={pending.length} label="En attente" color="#F59E0B" />
        <KpiCard icon="✅" value={projects.filter((p) => p.validations?.some((v: any) => v.statutValidation === "valide")).length} label="Validees" color="#10B981" />
        <KpiCard icon="⚠️" value={projects.filter((p) => p.validations?.some((v: any) => v.statutValidation === "valide_reserve")).length} label="Sous reserve" color="#F97316" />
        <KpiCard icon="✘" value={projects.filter((p) => p.validations?.some((v: any) => v.statutValidation === "rejete")).length} label="Rejetees" color="#EF4444" />
      </KpiGrid>

      <div className="mt-6 space-y-3">
        <Accordion id="val_pending" title="En attente de validation" icon="⏳" iconBg="rgba(245,158,11,0.15)" iconColor="#F59E0B" count={pending.length} defaultOpen={pending.length > 0}>
          {pending.length === 0 ? <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun dossier en attente</p> : pending.map((p: any) => renderCard(p, true))}
        </Accordion>
        <Accordion id="val_recent" title="Validations recentes" icon="✅" iconBg="rgba(16,185,129,0.15)" iconColor="#10B981" count={validated.length}>
          {validated.length === 0 ? <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune validation</p> : validated.slice(0, 10).map((p: any) => renderCard(p, false))}
        </Accordion>
      </div>
    </div>
  );
}
