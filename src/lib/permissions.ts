// ================================================================
// COLORLAB PRO — MATRICE DE PERMISSIONS RBAC
// 6 roles, 35+ permissions + permissions dynamiques
// ================================================================

import { prisma } from "./prisma";
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
 * Check if a role has a specific permission (base permissions)
 */
export function hasBasePermission(role: Role, permission: Permission): boolean {
  const allowed = PERMISSION_MATRIX[permission];
  return allowed ? allowed.includes(role) : false;
}

/**
 * Check if a user has a specific permission (including dynamic permissions)
 */
export async function hasUserPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user || !user.actif) {
      return false;
    }

    // Vérifier les permissions directes de l'utilisateur
    const hasDirectPermission = user.userPermissions.some(
      (up) => up.permission.nom === permission
    );

    if (hasDirectPermission) {
      return true;
    }

    // Vérifier les permissions de base du rôle
    return hasBasePermission(user.role, permission);
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
}

/**
 * Grant a permission to a user
 */
export async function grantUserPermission(
  granterId: string,
  userId: string,
  permissionId: string
): Promise<boolean> {
  try {
    // Vérifier que le granter a la permission d'accorder des permissions
    const canGrant = await hasUserPermission(granterId, "users.assign_permissions");
    
    if (!canGrant) {
      throw new Error("L'utilisateur n'a pas la permission d'accorder des permissions");
    }

    // Vérifier que la permission existe
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new Error("La permission n'existe pas");
    }

    // Accorder la permission
    await prisma.userPermission.create({
      data: {
        userId,
        permissionId,
        grantedBy: granterId,
      },
    });

    return true;
  } catch (error) {
    console.error("Erreur lors de l'octroi de la permission:", error);
    return false;
  }
}

/**
 * Revoke a permission from a user
 */
export async function revokeUserPermission(
  granterId: string,
  userId: string,
  permissionId: string
): Promise<boolean> {
  try {
    // Vérifier que le granter a la permission d'accorder des permissions
    const canGrant = await hasUserPermission(granterId, "users.assign_permissions");
    
    if (!canGrant) {
      throw new Error("L'utilisateur n'a pas la permission de révoquer des permissions");
    }

    // Révoquer la permission
    await prisma.userPermission.deleteMany({
      where: {
        userId,
        permissionId,
      },
    });

    return true;
  } catch (error) {
    console.error("Erreur lors de la révocation de la permission:", error);
    return false;
  }
}

/**
 * Get all permissions for a user (base + dynamic)
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    // Permissions directes
    const directPermissions = user.userPermissions.map(
      (up) => up.permission.nom as Permission
    );

    // Permissions de base du rôle
    const basePermissions = (Object.keys(PERMISSION_MATRIX) as Permission[]).filter(
      (p) => hasBasePermission(user.role, p)
    );

    return [...new Set([...directPermissions, ...basePermissions])];
  } catch (error) {
    console.error("Erreur lors de la récupération des permissions:", error);
    return [];
  }
}

/**
 * Check if a role has ANY of the given permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasBasePermission(role, p));
}

/**
 * Check if a role has ALL of the given permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasBasePermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
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
