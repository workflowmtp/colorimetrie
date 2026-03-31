"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";
import { hasPermissionInList, hasAnyPermissionInList, hasBasePermission, type Permission } from "@/lib/permissions";
import { hasAnyTransition } from "@/lib/workflow";
import type { ProjectStatus } from "@prisma/client";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user ?? null;
  const role = (user?.role ?? "tech_labo") as Role;
  const permissions = user?.permissions ?? [];
  const loading = status === "loading";
  const authenticated = status === "authenticated";

  function can(permission: Permission): boolean {
    // Utilise les permissions dynamiques chargees depuis la DB dans le JWT
    if (permissions.length > 0) {
      return hasPermissionInList(permissions, permission);
    }
    // Fallback statique si pas de permissions dans la session
    return hasBasePermission(role, permission);
  }

  function canAny(perms: Permission[]): boolean {
    if (permissions.length > 0) {
      return hasAnyPermissionInList(permissions, perms);
    }
    return perms.some((p) => hasBasePermission(role, p));
  }

  function canTransitionFrom(currentStatus: ProjectStatus): boolean {
    return hasAnyTransition(currentStatus, role);
  }

  return {
    user,
    role,
    permissions,
    loading,
    authenticated,
    can,
    canAny,
    canTransitionFrom,
  };
}
