"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useModal } from "@/hooks/useModal";
import { StatusBadge, PriorityBadge, TrialStatusBadge, ContextBadge, SwatchStrip, Swatch, DeltaEValue, ConformityIndicator, Button, Accordion } from "@/components/ui";
import { StatusChangeModal } from "./StatusChangeModal";
import { PriorityChangeModal } from "./PriorityChangeModal";
import { getProcessLabel, getSupportLabel } from "@/lib/constants";
import { deltaE76 } from "@/lib/colorimetry";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { ProjectStatus, Priority, Tolerance } from "@prisma/client";

interface Props {
  project: any; // Deep include — typed loosely for serialization
  tolerances: Tolerance[];
}

export function ProjectDetailClient({ project, tolerances }: Props) {
  const router = useRouter();
  const { can, canTransitionFrom } = useAuth();
  const toast = useToast();
  const { openModal, closeModal } = useModal();

  const tol = tolerances[0] ?? { deltaEMax: 3, tolL: 2, tolA: 1.5, tolB: 1.5 };
  const pr = project;

  async function handleStatusChange(projectId: string, newStatus: string) {
    const res = await fetch("/api/projects/" + projectId + "/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newStatus }) });
    if (res.ok) { toast.success("Statut mis a jour"); closeModal(); router.refresh(); }
    else toast.error("Erreur changement statut");
  }

  async function handlePriorityChange(projectId: string, newPriority: string) {
    const res = await fetch("/api/projects/" + projectId + "/priority", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPriority }) });
    if (res.ok) { toast.success("Priorite mise a jour"); closeModal(); router.refresh(); }
    else toast.error("Erreur changement priorite");
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <SwatchStrip colors={pr.colors} size={28} />
            <span className="font-mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>{pr.codeDossier}</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{pr.cibleDescription}</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {pr.client.nom} • {getProcessLabel(pr.processId)} • {pr.colors.length} couleur(s)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={pr.statut} />
          <PriorityBadge priority={pr.priorite} />
          {canTransitionFrom(pr.statut) && (
            <Button size="sm" variant="ghost" onClick={() => openModal("Changer le statut", <StatusChangeModal projectId={pr.id} currentStatus={pr.statut} codeDossier={pr.codeDossier} onConfirm={handleStatusChange} />)}>⇄ Statut</Button>
          )}
          {can("priority.change") && (
            <Button size="sm" variant="ghost" onClick={() => openModal("Modifier la priorite", <PriorityChangeModal projectId={pr.id} currentPriority={pr.priorite} codeDossier={pr.codeDossier} onConfirm={handlePriorityChange} />)}>⚑ Priorite</Button>
          )}
          {can("project.edit") && <Button size="sm" variant="ghost" onClick={() => router.push("/projects/" + pr.id + "/edit")}>✏️ Modifier</Button>}
          <Button size="sm" variant="ghost" onClick={() => router.push("/projects")}>← Retour</Button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Couleurs", value: pr.colors.length + " poste(s)", mono: true },
          { label: "Machine", value: pr.machine?.nomMachine ?? "-" },
          { label: "Support", value: getSupportLabel(pr.supportId ?? "") },
          { label: "Essais", value: pr.trials.length, mono: true },
          { label: "Responsable", value: pr.responsable?.nom ?? "-" },
          { label: "Cree le", value: formatDate(pr.createdAt) },
        ].map((item, i) => (
          <div key={i} className="card p-3">
            <div className="text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>{item.label}</div>
            <div className={`text-sm font-semibold ${item.mono ? "font-mono" : ""}`} style={{ color: "var(--text-primary)" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Couleurs & Essais */}
      <Accordion id="pd_colors" title="Couleurs & Essais" icon="🎨" iconBg="rgba(139,92,246,0.15)" iconColor="#8B5CF6" count={pr.colors.length + " coul."} defaultOpen>
        {pr.colors.map((color: any) => {
          const colorTrials = pr.trials.filter((t: any) => t.colorId === color.id);
          return (
            <div key={color.id} className="mb-4 p-3 rounded-lg" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-2">
                <Swatch L={color.cibleLabL} a={color.cibleLabA} b={color.cibleLabB} size={22} />
                <span className="font-mono font-bold text-sm" style={{ color: "#06B6D4" }}>P{color.poste}</span>
                <span className="font-semibold text-sm">{color.nomCouleur}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  L*{color.cibleLabL} a*{color.cibleLabA} b*{color.cibleLabB}
                </span>
                {color.operateur && <span className="text-xs" style={{ color: "var(--text-muted)" }}>Op: {color.operateur.nom}</span>}
              </div>

              {colorTrials.length > 0 ? (
                <table className="data-table">
                  <thead><tr><th>V</th><th>Hypothese</th><th>Statut</th><th>Spectro</th><th>Best ΔE</th><th>Date</th></tr></thead>
                  <tbody>
                    {colorTrials.map((trial: any) => {
                      let bestDE = 999;
                      for (const sp of trial.spectroMeasurements ?? []) {
                        const dE = deltaE76(sp.lValue, sp.aValue, sp.bValue, color.cibleLabL, color.cibleLabA, color.cibleLabB);
                        if (dE < bestDE) bestDE = dE;
                      }
                      return (
                        <tr key={trial.id} className="cursor-pointer" onClick={() => router.push("/trials/" + trial.id)}>
                          <td className="font-mono font-bold">V{trial.numeroVersion}</td>
                          <td className="text-xs">{trial.hypothese}</td>
                          <td><TrialStatusBadge status={trial.statut} /></td>
                          <td className="font-mono text-center">{trial.spectroMeasurements?.length ?? 0}</td>
                          <td>{bestDE < 999 ? <DeltaEValue dE={bestDE} maxDe={tol.deltaEMax} /> : <span style={{ color: "var(--text-muted)" }}>-</span>}</td>
                          <td className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(trial.dateEssai)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs py-2" style={{ color: "var(--text-muted)" }}>Aucun essai</p>
              )}
            </div>
          );
        })}
      </Accordion>

      {/* Spectro summary */}
      {pr.trials.some((t: any) => t.spectroMeasurements?.length > 0) && (
        <Accordion id="pd_spectro" title="Mesures spectrocolorimetriques" icon="🌈" iconBg="rgba(139,92,246,0.15)" iconColor="#8B5CF6" count={pr.trials.reduce((s: number, t: any) => s + (t.spectroMeasurements?.length ?? 0), 0)}>
          <table className="data-table">
            <thead><tr><th>Couleur</th><th>Essai</th><th>Contexte</th><th>L*</th><th>a*</th><th>b*</th><th>ΔE</th><th>Conf.</th><th>D.TD</th><th>Op.</th></tr></thead>
            <tbody>
              {pr.trials.flatMap((trial: any) =>
                (trial.spectroMeasurements ?? []).map((sp: any) => {
                  const color = trial.color;
                  const dE = color ? deltaE76(sp.lValue, sp.aValue, sp.bValue, color.cibleLabL, color.cibleLabA, color.cibleLabB) : null;
                  const ok = dE != null ? dE <= tol.deltaEMax : null;
                  return (
                    <tr key={sp.id}>
                      <td className="text-xs">{color ? "P" + color.poste + " " + color.nomCouleur : "-"}</td>
                      <td className="font-mono">V{trial.numeroVersion}</td>
                      <td><ContextBadge context={sp.contexte} /></td>
                      <td className="font-mono font-semibold">{sp.lValue}</td>
                      <td className="font-mono font-semibold">{sp.aValue}</td>
                      <td className="font-mono font-semibold">{sp.bValue}</td>
                      <td>{dE != null ? <DeltaEValue dE={dE} maxDe={tol.deltaEMax} /> : "-"}</td>
                      <td>{ok != null ? <ConformityIndicator conforme={ok} compact /> : "-"}</td>
                      <td className="font-mono text-xs" style={{ color: "#8B5CF6" }}>{sp.densiteTd ?? "-"}</td>
                      <td className="text-xs" style={{ color: "var(--text-muted)" }}>{sp.operateur?.nom ?? ""}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Accordion>
      )}

      {/* Validations */}
      {pr.validations.length > 0 && (
        <Accordion id="pd_val" title="Validations" icon="✅" iconBg="rgba(16,185,129,0.15)" iconColor="#10B981" count={pr.validations.length}>
          {pr.validations.map((v: any) => (
            <div key={v.id} className="py-2 border-b last:border-0 text-sm" style={{ borderColor: "var(--border-light)" }}>
              <StatusBadge status={v.statutValidation} /> par <strong>{v.validePar?.nom}</strong> le {formatDateTime(v.dateValidation)}
              {v.commentaire && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{v.commentaire}</p>}
            </div>
          ))}
        </Accordion>
      )}

      {/* Production */}
      {pr.productionControls.length > 0 && (
        <Accordion id="pd_prod" title="Controles production" icon="⚙️" iconBg="rgba(6,182,212,0.15)" iconColor="#06B6D4" count={pr.productionControls.length}>
          <table className="data-table">
            <thead><tr><th>Etape</th><th>Couleur</th><th>Conf.</th><th>Op.</th><th>Date</th><th>Note</th></tr></thead>
            <tbody>
              {pr.productionControls.map((ctrl: any) => (
                <tr key={ctrl.id}>
                  <td className="font-semibold text-xs">{ctrl.etapeTirage}</td>
                  <td className="text-xs">{ctrl.color ? "P" + ctrl.color.poste + " " + ctrl.color.nomCouleur : "-"}</td>
                  <td><ConformityIndicator conforme={ctrl.conforme} /></td>
                  <td className="text-xs" style={{ color: "var(--text-muted)" }}>{ctrl.operateur?.nom ?? ""}</td>
                  <td className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDateTime(ctrl.dateControle)}</td>
                  <td className="text-xs" style={{ color: "var(--text-muted)" }}>{ctrl.commentaire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>
      )}
    </div>
  );
}
