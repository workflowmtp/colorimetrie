// ================================================================
// COLORLAB PRO — SYSTEME DE PERMISSIONS RBAC DYNAMIQUE
// Les permissions sont definies en code (type Permission)
// Les liaisons role <-> permission sont en DB (table role_permissions)
// Fallback sur PERMISSION_MATRIX si la DB n'est pas accessible
// ================================================================

import prisma from "./prisma";
import type { Role } from "@prisma/client";

export type Permission =
  // Dossiers couleur
  | "project.create" | "project.read" | "project.edit" | "project.delete"
  | "project.validate" | "project.reject"
  // Essais
  | "trial.create" | "trial.read" | "trial.edit" | "trial.validate"
  // Formulations
  | "formulation.create" | "formulation.read" | "formulation.edit" | "formulation.validate"
  // Mesures
  | "measure.create" | "measure.read"
  // Validation labo
  | "validation.create" | "validation.read"
  // Production
  | "production.create" | "production.read"
  // Controle qualite
  | "qc.create" | "qc.read" | "qc.validate"
  // IA
  | "ai.use" | "ai.config"
  // Settings
  | "settings.read" | "settings.edit"
  // Users
  | "users.manage" | "users.assign_permissions"
  // Reports
  | "reports.read" | "reports.export"
  // Libraries
  | "library.read" | "library.edit"
  // Metal
  | "metal.read" | "metal.edit"
  // Workflow transitions
  | "workflow.to_en_essai" | "workflow.to_en_analyse" | "workflow.to_a_valider"
  | "workflow.to_brouillon" | "workflow.to_archive"
  | "workflow.to_valide" | "workflow.to_rejete"
  // Priority
  | "priority.change";

/** Liste complete de toutes les permissions (utile pour l'UI admin) */
export const ALL_PERMISSIONS: Permission[] = [
  "project.create", "project.read", "project.edit", "project.delete",
  "project.validate", "project.reject",
  "trial.create", "trial.read", "trial.edit", "trial.validate",
  "formulation.create", "formulation.read", "formulation.edit", "formulation.validate",
  "measure.create", "measure.read",
  "validation.create", "validation.read",
  "production.create", "production.read",
  "qc.create", "qc.read", "qc.validate",
  "ai.use", "ai.config",
  "settings.read", "settings.edit",
  "users.manage", "users.assign_permissions",
  "reports.read", "reports.export",
  "library.read", "library.edit",
  "metal.read", "metal.edit",
  "workflow.to_en_essai", "workflow.to_en_analyse", "workflow.to_a_valider",
  "workflow.to_brouillon", "workflow.to_archive",
  "workflow.to_valide", "workflow.to_rejete",
  "priority.change",
];

/** Metadata des permissions par module (pour l'UI admin) */
export const PERMISSION_MODULES: Record<string, { label: string; permissions: Permission[] }> = {
  projects: { label: "Dossiers couleur", permissions: ["project.create", "project.read", "project.edit", "project.delete", "project.validate", "project.reject"] },
  trials: { label: "Essais", permissions: ["trial.create", "trial.read", "trial.edit", "trial.validate"] },
  formulations: { label: "Formulations", permissions: ["formulation.create", "formulation.read", "formulation.edit", "formulation.validate"] },
  measures: { label: "Mesures", permissions: ["measure.create", "measure.read"] },
  validation: { label: "Validation labo", permissions: ["validation.create", "validation.read"] },
  production: { label: "Production", permissions: ["production.create", "production.read"] },
  qc: { label: "Controle qualite", permissions: ["qc.create", "qc.read", "qc.validate"] },
  ai: { label: "Agent IA", permissions: ["ai.use", "ai.config"] },
  settings: { label: "Parametres", permissions: ["settings.read", "settings.edit"] },
  users: { label: "Utilisateurs", permissions: ["users.manage", "users.assign_permissions"] },
  reports: { label: "Rapports", permissions: ["reports.read", "reports.export"] },
  library: { label: "Bibliotheque", permissions: ["library.read", "library.edit"] },
  metal: { label: "Offset Metal", permissions: ["metal.read", "metal.edit"] },
  workflow: { label: "Workflow", permissions: ["workflow.to_en_essai", "workflow.to_en_analyse", "workflow.to_a_valider", "workflow.to_brouillon", "workflow.to_archive", "workflow.to_valide", "workflow.to_rejete"] },
  priority: { label: "Priorite", permissions: ["priority.change"] },
};

const PERMISSION_MATRIX: Record<Permission, Role[]> = {
  // Dossiers couleur
  "project.create":       ["admin", "resp_labo", "tech_labo"],
  "project.read":         ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "project.edit":         ["admin", "resp_labo", "tech_labo"],
  "project.delete":       ["admin"],
  "project.validate":     ["admin", "resp_labo"],
  "project.reject":       ["admin", "resp_labo"],

  // Essais
  "trial.create":         ["admin", "resp_labo", "tech_labo"],
  "trial.read":           ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "trial.edit":           ["admin", "resp_labo", "tech_labo"],
  "trial.validate":       ["admin", "resp_labo"],

  // Formulations
  "formulation.create":   ["admin", "resp_labo", "tech_labo"],
  "formulation.read":     ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "formulation.edit":     ["admin", "resp_labo", "tech_labo"],
  "formulation.validate": ["admin", "resp_labo"],

  // Mesures
  "measure.create":       ["admin", "resp_labo", "tech_labo", "conducteur"],
  "measure.read":         ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],

  // Validation labo
  "validation.create":    ["admin", "resp_labo"],
  "validation.read":      ["admin", "resp_labo", "tech_labo", "resp_qc", "direction"],

  // Production
  "production.create":    ["admin", "conducteur"],
  "production.read":      ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],

  // Controle qualite
  "qc.create":            ["admin", "resp_qc"],
  "qc.read":              ["admin", "resp_labo", "tech_labo", "resp_qc", "direction"],
  "qc.validate":          ["admin", "resp_qc"],

  // IA
  "ai.use":               ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc"],
  "ai.config":            ["admin"],

  // Settings
  "settings.read":        ["admin", "resp_labo", "resp_qc", "direction"],
  "settings.edit":        ["admin"],

  // Users
  "users.manage":         ["admin"],
  "users.assign_permissions": ["admin"],

  // Reports
  "reports.read":         ["admin", "resp_labo", "resp_qc", "direction"],
  "reports.export":       ["admin", "resp_labo", "resp_qc", "direction"],

  // Libraries
  "library.read":         ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "library.edit":         ["admin", "resp_labo"],

  // Metal
  "metal.read":           ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "metal.edit":           ["admin", "resp_labo", "tech_labo"],

  // Workflow
  "workflow.to_en_essai":   ["admin", "resp_labo", "tech_labo"],
  "workflow.to_en_analyse": ["admin", "resp_labo", "tech_labo"],
  "workflow.to_a_valider":  ["admin", "resp_labo", "tech_labo"],
  "workflow.to_brouillon":  ["admin", "resp_labo"],
  "workflow.to_archive":    ["admin", "resp_labo", "direction"],
  "workflow.to_valide":     ["admin", "resp_labo"],
  "workflow.to_rejete":     ["admin", "resp_labo"],

  // Priority
  "priority.change":        ["admin", "resp_labo", "resp_qc", "direction"],
};

/**
 * Check if a role has a specific permission (fallback statique)
 */
export function hasBasePermission(role: Role, permission: Permission): boolean {
  const allowed = PERMISSION_MATRIX[permission];
  return allowed ? allowed.includes(role) : false;
}

/**
 * Verifie une permission depuis la session NextAuth (API routes)
 * Utilise les permissions dynamiques du JWT, fallback sur statique
 */
export function hasSessionPermission(
  session: { user: { role: string; permissions?: string[] } } | null,
  permission: Permission
): boolean {
  if (!session?.user) return false;
  const { permissions: perms, role } = session.user;
  if (perms && perms.length > 0) {
    return perms.includes(permission);
  }
  return hasBasePermission(role as Role, permission);
}

/**
 * Verifie une permission a partir d'une liste de permissions (cote client)
 * Utilise par useAuth avec les permissions chargees dans le JWT
 */
export function hasPermissionInList(permissions: string[], permission: Permission): boolean {
  return permissions.includes(permission);
}

/**
 * Charger les permissions d'un role depuis la DB (cote serveur)
 * Fallback sur PERMISSION_MATRIX si la DB echoue
 */
export async function getRolePermissionsFromDB(role: Role): Promise<Permission[]> {
  try {
    const rolePerms = await prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });

    if (rolePerms.length > 0) {
      return rolePerms.map((rp) => rp.permission.nom as Permission);
    }

    // Fallback si aucune permission en DB pour ce role
    return getRolePermissionsStatic(role);
  } catch {
    // Fallback si DB inaccessible
    return getRolePermissionsStatic(role);
  }
}

/**
 * Charger toutes les permissions d'un user (role DB + permissions directes)
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: {
          include: { permission: true },
        },
      },
    });

    if (!user || !user.actif) return [];

    // Permissions du role depuis la DB
    const rolePerms = await getRolePermissionsFromDB(user.role);

    // Permissions directes de l'utilisateur
    const directPerms = user.userPermissions.map(
      (up) => up.permission.nom as Permission
    );

    return [...new Set([...rolePerms, ...directPerms])];
  } catch {
    return [];
  }
}

/**
 * Verifie si un user a une permission (serveur, async)
 */
export async function hasUserPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms.includes(permission);
}

/**
 * Check if a role has ANY of the given permissions (client, depuis liste)
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasBasePermission(role, p));
}

/**
 * Check if a role has ANY permission from a list (client, depuis liste stockee)
 */
export function hasAnyPermissionInList(userPerms: string[], permissions: Permission[]): boolean {
  return permissions.some((p) => userPerms.includes(p));
}

/**
 * Get all permissions for a role (statique, fallback)
 */
export function getRolePermissionsStatic(role: Role): Permission[] {
  return (Object.keys(PERMISSION_MATRIX) as Permission[]).filter(
    (p) => PERMISSION_MATRIX[p].includes(role)
  );
}

/**
 * Role display metadata
 */
export const ROLE_META: Record<Role, { nom: string; color: string; desc: string }> = {
  admin:      { nom: "Administrateur",     color: "#EF4444", desc: "Acces complet" },
  resp_labo:  { nom: "Resp. Laboratoire",  color: "#8B5CF6", desc: "Validation & pilotage" },
  tech_labo:  { nom: "Technicien Labo",    color: "#3B82F6", desc: "Essais & mesures" },
  conducteur: { nom: "Conducteur Machine", color: "#F59E0B", desc: "Production & suivi" },
  resp_qc:    { nom: "Resp. Qualite",      color: "#10B981", desc: "Controle & conformite" },
  direction:  { nom: "Direction Technique", color: "#06B6D4", desc: "Tableaux de bord" },
};
