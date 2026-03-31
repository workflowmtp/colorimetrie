import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

// GET /api/roles — liste des roles avec leurs permissions
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  // Recuperer tous les roles existants dans l'enum
  const roles: Role[] = ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"];

  // Charger toutes les permissions
  const allPermissions = await prisma.permission.findMany({ orderBy: { module: "asc" } });

  // Charger toutes les liaisons role-permission
  const rolePermissions = await prisma.rolePermission.findMany({
    include: { permission: true },
  });

  // Grouper par role
  const rolesData = roles.map((role) => {
    const perms = rolePermissions
      .filter((rp) => rp.role === role)
      .map((rp) => rp.permission.nom);
    return { role, permissions: perms };
  });

  return NextResponse.json({ roles: rolesData, allPermissions });
}

// PUT /api/roles — mettre a jour les permissions d'un role
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "users.assign_permissions")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { role, permissions } = await req.json() as { role: Role; permissions: string[] };

  if (!role || !permissions) {
    return NextResponse.json({ error: "role et permissions requis" }, { status: 400 });
  }

  // Recuperer les IDs des permissions par nom
  const dbPerms = await prisma.permission.findMany({
    where: { nom: { in: permissions } },
  });
  const permIds = dbPerms.map((p) => p.id);

  // Supprimer les anciennes liaisons pour ce role
  await prisma.rolePermission.deleteMany({ where: { role } });

  // Creer les nouvelles liaisons
  if (permIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: permIds.map((permissionId) => ({ role, permissionId })),
    });
  }

  return NextResponse.json({
    role,
    permissions: permissions.length,
    message: "Permissions mises a jour",
  });
}
