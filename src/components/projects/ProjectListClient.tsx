"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useModal } from "@/hooks/useModal";
import { AccordionGroup, Accordion, StatusBadge, PriorityBadge, SwatchStrip, Button } from "@/components/ui";
import { StatusChangeModal } from "@/components/projects/StatusChangeModal";
import { PriorityChangeModal } from "@/components/projects/PriorityChangeModal";
import { getProcessLabel, getSupportLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { ProjectStatus, Priority, ProcessType } from "@prisma/client";

interface ProjectData {
  id: string; codeDossier: string; cibleDescription: string; statut: ProjectStatus;
  priorite: Priority; processId: ProcessType; createdAt: string;
  client: { nom: string };
  machine?: { nomMachine: string } | null;
  responsable?: { id: string; nom: string } | null;
  colors: Array<{ poste: number; nomCouleur: string; cibleLabL: number; cibleLabA: number; cibleLabB: number }>;
  _count: { trials: number; colors: number };
}

interface Props {
  projects: ProjectData[];
  users: Array<{ id: string; nom: string; role: string }>;
}

export function ProjectListClient({ projects: initialProjects, users }: Props) {
  const router = useRouter();
  const { can, canTransitionFrom } = useAuth();
  const toast = useToast();
  const { openModal, closeModal } = useModal();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processFilter, setProcessFilter] = useState("all");

  const filtered = initialProjects.filter((p) => {
    if (statusFilter !== "all" && p.statut !== statusFilter) return false;
    if (processFilter !== "all" && p.processId !== processFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!p.codeDossier.toLowerCase().includes(s) && !p.cibleDescription.toLowerCase().includes(s) && !p.client.nom.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  async function handleStatusChange(projectId: string, newStatus: string) {
    const res = await fetch("/api/projects/" + projectId + "/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newStatus }) });
    if (res.ok) { toast.success("Statut mis a jour"); closeModal(); router.refresh(); }
    else { const data = await res.json(); toast.error(data.error || "Erreur"); }
  }

  async function handlePriorityChange(projectId: string, newPriority: string) {
    const res = await fetch("/api/projects/" + projectId + "/priority", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPriority }) });
    if (res.ok) { toast.success("Priorite mise a jour"); closeModal(); router.refresh(); }
    else { const data = await res.json(); toast.error(data.error || "Erreur"); }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Dossiers couleur</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{initialProjects.length} dossier(s)</p>
        </div>
        {can("project.create") && (
          <Button variant="primary" onClick={() => router.push("/projects/new")}>+ Nouveau dossier</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text" placeholder="🔍 Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="form-input max-w-xs"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input w-auto">
          <option value="all">Tous statuts</option>
          {["brouillon","en_essai","en_analyse","a_valider","valide","valide_reserve","rejete","archive"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select value={processFilter} onChange={(e) => setProcessFilter(e.target.value)} className="form-input w-auto">
          <option value="all">Tous procedes</option>
          <option value="offset_papier">Offset Papier</option>
          <option value="heliogravure">Heliogravure</option>
          <option value="offset_metal">Offset Metal</option>
        </select>
      </div>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Aucun dossier</div>
      ) : (
        <AccordionGroup>
          {filtered.map((pr) => (
            <Accordion
              key={pr.id}
              id={"prj_" + pr.id}
              title={
                <div className="flex items-center gap-3 flex-wrap">
                  <SwatchStrip colors={pr.colors} size={18} />
                  <span className="font-mono font-bold text-sm" style={{ color: "#3B82F6" }}>{pr.codeDossier}</span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{pr.cibleDescription}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{pr.client.nom}</span>
                  <StatusBadge status={pr.statut} />
                  <PriorityBadge priority={pr.priorite} />
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{pr._count.colors} coul.</span>
                </div>
              }
            >
              {/* Detail grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Procede</span>{getProcessLabel(pr.processId)}</div>
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Machine</span>{pr.machine?.nomMachine ?? "-"}</div>
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Responsable</span>{pr.responsable?.nom ?? "-"}</div>
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Date</span>{formatDate(pr.createdAt)}</div>
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Essais</span><span className="font-mono font-bold">{pr._count.trials}</span></div>
                <div><span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>Couleurs</span><span className="font-mono font-bold">{pr._count.colors}</span></div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="primary" onClick={() => router.push("/projects/" + pr.id)}>📄 Ouvrir la fiche</Button>
                {can("project.edit") && <Button size="sm" variant="ghost" onClick={() => router.push("/projects/" + pr.id + "/edit")}>✏️ Modifier</Button>}
                {can("trial.create") && <Button size="sm" variant="ghost" onClick={() => router.push("/trials?newFor=" + pr.id)}>🔬 Nouvel essai</Button>}
                {canTransitionFrom(pr.statut) && (
                  <Button size="sm" variant="ghost" onClick={() => openModal("Changer le statut", <StatusChangeModal projectId={pr.id} currentStatus={pr.statut} codeDossier={pr.codeDossier} onConfirm={handleStatusChange} />)}>
                    ⇄ Statut
                  </Button>
                )}
                {can("priority.change") && (
                  <Button size="sm" variant="ghost" onClick={() => openModal("Modifier la priorite", <PriorityChangeModal projectId={pr.id} currentPriority={pr.priorite} codeDossier={pr.codeDossier} onConfirm={handlePriorityChange} />)}>
                    ⚑ Priorite
                  </Button>
                )}
              </div>
            </Accordion>
          ))}
        </AccordionGroup>
      )}
    </div>
  );
}
