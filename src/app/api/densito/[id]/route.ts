import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// GET /api/densito/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const dn = await prisma.densitoMeasurement.findUnique({
    where: { id },
    include: {
      trial: { include: { project: true, color: true } },
      operateur: { select: { id: true, nom: true } },
    },
  });

  if (!dn) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });
  return NextResponse.json(dn);
}

// PUT /api/densito/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "measure.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  const fields = ["contexte", "couleur", "densite", "trame25", "trame50", "trame75", "trame80", "trapping", "contraste", "operateurId", "commentaire"];
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f];
  }

  const updated = await prisma.densitoMeasurement.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/densito/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "measure.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  await prisma.densitoMeasurement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
