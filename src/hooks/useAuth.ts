"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";
import { hasBasePermission, hasAnyPermission, type Permission } from "@/lib/permissions";
import { hasAnyTransition } from "@/lib/workflow";
import type { ProjectStatus } from "@prisma/client";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user ?? null;
  const role = (user?.role ?? "tech_labo") as Role;
  const loading = status === "loading";
  const authenticated = status === "authenticated";

  function can(permission: Permission): boolean {
    return hasBasePermission(role, permission);
  }

  function canAny(permissions: Permission[]): boolean {
    return hasAnyPermission(role, permissions);
  }

  function canTransitionFrom(status: ProjectStatus): boolean {
    return hasAnyTransition(status, role);
  }

  return {
    user,
    role,
    loading,
    authenticated,
    can,
    canAny,
    canTransitionFrom,
  };
}
