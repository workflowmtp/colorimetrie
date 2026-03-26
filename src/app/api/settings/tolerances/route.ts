import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role, ProcessType } from "@prisma/client";

// GET /api/settings/tolerances
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const tolerances = await prisma.tolerance.findMany({ orderBy: { processId: "asc" } });
  return NextResponse.json(tolerances);
}

// POST /api/settings/tolerances — create or update
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "settings.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const { id, processId, supportType, deltaEMax, tolL, tolA, tolB, tolDensite, tolTrapping, tolContraste } = body;

  const data = {
    processId: processId as ProcessType,
    supportType: supportType || "",
    deltaEMax: parseFloat(deltaEMax) || 3,
    tolL: parseFloat(tolL) || 2,
    tolA: parseFloat(tolA) || 1.5,
    tolB: parseFloat(tolB) || 1.5,
    tolDensite: parseFloat(tolDensite) || 0.10,
    tolTrapping: parseFloat(tolTrapping) || 70,
    tolContraste: parseFloat(tolContraste) || 25,
  };

  let result;
  if (id) {
    result = await prisma.tolerance.update({ where: { id }, data });
  } else {
    result = await prisma.tolerance.create({ data });
  }

  return NextResponse.json(result, { status: id ? 200 : 201 });
}
