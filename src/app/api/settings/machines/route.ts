import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role, ProcessType } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const machines = await prisma.machine.findMany({ orderBy: { nomMachine: "asc" } });
  return NextResponse.json(machines);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "settings.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { id, nomMachine, typeProcede, atelier, actif } = await req.json();
  const data = { nomMachine, typeProcede: typeProcede as ProcessType, atelier: atelier || "", actif: actif ?? true };

  const result = id
    ? await prisma.machine.update({ where: { id }, data })
    : await prisma.machine.create({ data });

  return NextResponse.json(result, { status: id ? 200 : 201 });
}
