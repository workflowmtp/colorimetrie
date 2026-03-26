import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import { generateDossierCode } from "@/lib/utils";
import type { Role, ProcessType, SupportType, Priority, ColorType } from "@prisma/client";

// GET /api/projects — list all projects
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "project.read")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const process = searchParams.get("process");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.statut = status;
  if (process && process !== "all") where.processId = process;
  if (priority && priority !== "all") where.priorite = priority;
  if (search) {
    where.OR = [
      { codeDossier: { contains: search, mode: "insensitive" } },
      { cibleDescription: { contains: search, mode: "insensitive" } },
      { client: { nom: { contains: search, mode: "insensitive" } } },
    ];
  }

  const projects = await prisma.colorProject.findMany({
    where,
    include: {
      client: true,
      machine: true,
      responsable: { select: { id: true, nom: true } },
      colors: { orderBy: { poste: "asc" } },
      _count: { select: { trials: true, colors: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

// POST /api/projects — create project with colors
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "project.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const { clientId, productId, processId, machineId, supportId, cibleDescription, priorite, responsableId, colors } = body;

  if (!clientId || !processId || !colors || colors.length === 0) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  // Generate next code
  const lastProject = await prisma.colorProject.findFirst({ orderBy: { codeDossier: "desc" } });
  const codeDossier = generateDossierCode(lastProject?.codeDossier);

  const project = await prisma.colorProject.create({
    data: {
      codeDossier,
      clientId,
      productId: productId || null,
      processId: processId as ProcessType,
      machineId: machineId || null,
      supportId: (supportId as SupportType) || null,
      cibleDescription: cibleDescription || "",
      priorite: (priorite as Priority) || "normale",
      responsableId: responsableId || session.user.id,
      creeParId: session.user.id,
      colors: {
        create: colors.map((c: { poste: number; nomCouleur: string; typeCouleur: string; cibleLabL: number; cibleLabA: number; cibleLabB: number; operateurId?: string }, i: number) => ({
          poste: c.poste || i + 1,
          nomCouleur: c.nomCouleur,
          typeCouleur: (c.typeCouleur as ColorType) || "Pantone",
          cibleLabL: c.cibleLabL,
          cibleLabA: c.cibleLabA,
          cibleLabB: c.cibleLabB,
          operateurId: c.operateurId || null,
        })),
      },
    },
    include: {
      client: true,
      colors: { orderBy: { poste: "asc" } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
