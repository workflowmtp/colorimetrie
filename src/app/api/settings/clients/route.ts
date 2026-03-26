import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const clients = await prisma.client.findMany({ orderBy: { nom: "asc" }, include: { _count: { select: { projects: true } } } });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "settings.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { id, nom, code, secteur, contact, email, telephone, actif } = await req.json();
  if (!nom || !code) return NextResponse.json({ error: "nom et code requis" }, { status: 400 });

  const data = { nom, code, secteur: secteur || "", contact: contact || "", email: email || "", telephone: telephone || "", actif: actif ?? true };
  const result = id
    ? await prisma.client.update({ where: { id }, data })
    : await prisma.client.create({ data });

  return NextResponse.json(result, { status: id ? 200 : 201 });
}
