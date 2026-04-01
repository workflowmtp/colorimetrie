import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import type { Role, ProcessType } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  return NextResponse.json(await prisma.standard.findMany({ orderBy: { nom: "asc" } }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "settings.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { id, nom, processId, supportType, description, actif } = await req.json();
  const data = { nom, processId: processId as ProcessType, supportType: supportType || "", description: description || "", actif: actif ?? true };
  const result = id ? await prisma.standard.update({ where: { id }, data }) : await prisma.standard.create({ data });
  return NextResponse.json(result, { status: id ? 200 : 201 });
}
