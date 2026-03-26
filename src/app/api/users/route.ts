import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import { hash } from "bcryptjs";
import type { Role } from "@prisma/client";

// GET /api/users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const users = await prisma.user.findMany({
    select: { id: true, nom: true, email: true, login: true, role: true, actif: true, createdAt: true },
    orderBy: { nom: "asc" },
  });

  return NextResponse.json(users);
}

// POST /api/users — create or update user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "users.manage")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { id, nom, email, login, role, actif, password } = await req.json();
  if (!nom || !email || !login) {
    return NextResponse.json({ error: "nom, email et login requis" }, { status: 400 });
  }

  const data: Record<string, unknown> = {
    nom,
    email,
    login,
    role: (role as Role) || "tech_labo",
    actif: actif ?? true,
  };

  if (password) {
    data.passwordHash = await hash(password, 12);
  }

  let result;
  if (id) {
    result = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, nom: true, email: true, login: true, role: true, actif: true },
    });
  } else {
    if (!password) return NextResponse.json({ error: "Mot de passe requis pour creation" }, { status: 400 });
    result = await prisma.user.create({
      data: data as { nom: string; email: string; login: string; role: Role; actif: boolean; passwordHash: string },
      select: { id: true, nom: true, email: true, login: true, role: true, actif: true },
    });
  }

  return NextResponse.json(result, { status: id ? 200 : 201 });
}
