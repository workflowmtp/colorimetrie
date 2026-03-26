import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role, ColorType } from "@prisma/client";

// GET /api/colors?projectId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId requis" }, { status: 400 });

  const colors = await prisma.projectColor.findMany({
    where: { projectId },
    orderBy: { poste: "asc" },
    include: { operateur: { select: { id: true, nom: true } } },
  });

  return NextResponse.json(colors);
}

// POST /api/colors — add color to project
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "project.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const { projectId, poste, nomCouleur, typeCouleur, cibleLabL, cibleLabA, cibleLabB, operateurId } = body;

  if (!projectId || !nomCouleur || cibleLabL === undefined) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  // Auto-assign poste if not provided
  let finalPoste = poste;
  if (!finalPoste) {
    const maxPoste = await prisma.projectColor.findFirst({
      where: { projectId },
      orderBy: { poste: "desc" },
    });
    finalPoste = (maxPoste?.poste ?? 0) + 1;
  }

  const color = await prisma.projectColor.create({
    data: {
      projectId,
      poste: finalPoste,
      nomCouleur,
      typeCouleur: (typeCouleur as ColorType) || "Pantone",
      cibleLabL: parseFloat(cibleLabL),
      cibleLabA: parseFloat(cibleLabA),
      cibleLabB: parseFloat(cibleLabB),
      operateurId: operateurId || null,
    },
  });

  return NextResponse.json(color, { status: 201 });
}

// PUT /api/colors (bulk update — used by project edit form)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "project.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { projectId, colors } = await req.json();
  if (!projectId || !colors) return NextResponse.json({ error: "Donnees manquantes" }, { status: 400 });

  // Delete existing and recreate
  await prisma.projectColor.deleteMany({ where: { projectId } });

  const created = await prisma.projectColor.createMany({
    data: colors.map((c: { poste: number; nomCouleur: string; typeCouleur: string; cibleLabL: number; cibleLabA: number; cibleLabB: number; operateurId?: string }) => ({
      projectId,
      poste: c.poste,
      nomCouleur: c.nomCouleur,
      typeCouleur: (c.typeCouleur as ColorType) || "Pantone",
      cibleLabL: c.cibleLabL,
      cibleLabA: c.cibleLabA,
      cibleLabB: c.cibleLabB,
      operateurId: c.operateurId || null,
    })),
  });

  return NextResponse.json({ count: created.count });
}
