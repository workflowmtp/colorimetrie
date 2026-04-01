import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

// GET /api/metal?projectId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId requis" }, { status: 400 });

  const [metalData, whiteLacquer, ovenData] = await Promise.all([
    prisma.metalSupportData.findUnique({ where: { projectId } }),
    prisma.whiteLacquerData.findUnique({ where: { projectId } }),
    prisma.ovenData.findMany({
      where: { trial: { projectId } },
      include: { operateur: { select: { id: true, nom: true } }, trial: { select: { id: true, numeroVersion: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ metalData, whiteLacquer, ovenData });
}

// PUT /api/metal — upsert metal + white lacquer data
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "metal.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { projectId, metalData, whiteLacquer } = await req.json();
  if (!projectId) return NextResponse.json({ error: "projectId requis" }, { status: 400 });

  let metal = null, wl = null;

  if (metalData) {
    metal = await prisma.metalSupportData.upsert({
      where: { projectId },
      create: { projectId, ...metalData },
      update: metalData,
    });
  }

  if (whiteLacquer) {
    wl = await prisma.whiteLacquerData.upsert({
      where: { projectId },
      create: { projectId, ...whiteLacquer },
      update: whiteLacquer,
    });
  }

  return NextResponse.json({ metalData: metal, whiteLacquer: wl });
}

// POST /api/metal — add oven data
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "metal.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const oven = await prisma.ovenData.create({
    data: {
      trialId: body.trialId,
      typeFour: body.typeFour || "Tunnel gaz",
      temperatureConsigne: body.temperatureConsigne,
      temperatureReelle: body.temperatureReelle ?? null,
      tempsSejour: body.tempsSejour ?? null,
      vitesseLigne: body.vitesseLigne ?? null,
      zone: body.zone || "",
      operateurId: body.operateurId || session.user.id,
      commentaire: body.commentaire || "",
    },
  });

  return NextResponse.json(oven, { status: 201 });
}
