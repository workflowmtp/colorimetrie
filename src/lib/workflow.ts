// ================================================================
// COLORLAB PRO — WORKFLOW ENGINE
// Transitions de statut avec permissions RBAC
// ================================================================

import type { ProjectStatus, Role } from "@prisma/client";
import { hasBasePermission, type Permission } from "./permissions";

export interface WorkflowTransition {
  to: ProjectStatus;
  label: string;
  style: "primary" | "success" | "warning" | "danger" | "ghost";
  perm: Permission;
}

/**
 * All valid transitions from each project status
 */
const TRANSITIONS: Record<ProjectStatus, WorkflowTransition[]> = {
  brouillon: [
    { to: "en_essai", label: "Passer en essai", style: "primary", perm: "workflow.to_en_essai" },
    { to: "archive", label: "Archiver", style: "ghost", perm: "workflow.to_archive" },
  ],
  en_essai: [
    { to: "en_analyse", label: "Envoyer en analyse IA", style: "ghost", perm: "workflow.to_en_analyse" },
    { to: "a_valider", label: "Soumettre a validation", style: "success", perm: "workflow.to_a_valider" },
    { to: "brouillon", label: "Retour brouillon", style: "ghost", perm: "workflow.to_brouillon" },
  ],
  en_analyse: [
    { to: "en_essai", label: "Retour en essai", style: "ghost", perm: "workflow.to_en_essai" },
    { to: "a_valider", label: "Soumettre a validation", style: "success", perm: "workflow.to_a_valider" },
  ],
  a_valider: [
    { to: "en_essai", label: "Retour en essai", style: "ghost", perm: "workflow.to_en_essai" },
  ],
  valide: [
    { to: "archive", label: "Archiver", style: "ghost", perm: "workflow.to_archive" },
  ],
  valide_reserve: [
    { to: "en_essai", label: "Reprendre les essais", style: "primary", perm: "workflow.to_en_essai" },
    { to: "archive", label: "Archiver", style: "ghost", perm: "workflow.to_archive" },
  ],
  rejete: [
    { to: "en_essai", label: "Reprendre les essais", style: "primary", perm: "workflow.to_en_essai" },
    { to: "archive", label: "Archiver", style: "ghost", perm: "workflow.to_archive" },
  ],
  archive: [],
};

/**
 * Get available transitions for a project status filtered by user role
 */
export function getAvailableTransitions(
  currentStatus: ProjectStatus,
  role: Role
): WorkflowTransition[] {
  const all = TRANSITIONS[currentStatus] || [];
  return all.filter((t) => hasBasePermission(role, t.perm));
}

/**
 * Check if a specific transition is allowed
 */
export function canTransition(
  from: ProjectStatus,
  to: ProjectStatus,
  role: Role
): boolean {
  const transitions = getAvailableTransitions(from, role);
  return transitions.some((t) => t.to === to);
}

/**
 * Check if user has ANY available transition from current status
 */
export function hasAnyTransition(
  currentStatus: ProjectStatus,
  role: Role
): boolean {
  return getAvailableTransitions(currentStatus, role).length > 0;
}

/**
 * Auto-transitions (triggered by system events, not user)
 */
export const AUTO_TRANSITIONS = {
  /** When first trial is created on a "brouillon" project → en_essai */
  onTrialCreated: (currentStatus: ProjectStatus): ProjectStatus | null => {
    if (currentStatus === "brouillon") return "en_essai";
    return null;
  },

  /** When spectro/densito measurement is saved on an "en_cours" trial → mesure */
  onMeasurementSaved: (trialStatus: string): string | null => {
    if (trialStatus === "en_cours") return "mesure";
    return null;
  },
};

/**
 * Project status display metadata
 */
export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string; bgColor: string }
> = {
  brouillon:      { label: "Brouillon",        color: "#94A3B8", bgColor: "rgba(148,163,184,0.15)" },
  en_essai:       { label: "En essai",          color: "#3B82F6", bgColor: "rgba(59,130,246,0.15)" },
  en_analyse:     { label: "En analyse",        color: "#8B5CF6", bgColor: "rgba(139,92,246,0.15)" },
  a_valider:      { label: "A valider",         color: "#F59E0B", bgColor: "rgba(245,158,11,0.15)" },
  valide:         { label: "Valide",            color: "#10B981", bgColor: "rgba(16,185,129,0.15)" },
  valide_reserve: { label: "Valide s/reserve",  color: "#F97316", bgColor: "rgba(249,115,22,0.15)" },
  rejete:         { label: "Rejete",            color: "#EF4444", bgColor: "rgba(239,68,68,0.15)" },
  archive:        { label: "Archive",           color: "#64748B", bgColor: "rgba(100,116,139,0.15)" },
};

/**
 * Trial status display metadata
 */
export const TRIAL_STATUS_META: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  en_cours:            { label: "En cours",            color: "#3B82F6", bgColor: "rgba(59,130,246,0.15)" },
  mesure:              { label: "Mesure",               color: "#8B5CF6", bgColor: "rgba(139,92,246,0.15)" },
  analyse:             { label: "Analyse",              color: "#8B5CF6", bgColor: "rgba(139,92,246,0.15)" },
  a_corriger:          { label: "A corriger",           color: "#F97316", bgColor: "rgba(249,115,22,0.15)" },
  candidat_validation: { label: "Candidat validation",  color: "#F59E0B", bgColor: "rgba(245,158,11,0.15)" },
  rejete:              { label: "Rejete",               color: "#EF4444", bgColor: "rgba(239,68,68,0.15)" },
  valide:              { label: "Valide",               color: "#10B981", bgColor: "rgba(16,185,129,0.15)" },
};
