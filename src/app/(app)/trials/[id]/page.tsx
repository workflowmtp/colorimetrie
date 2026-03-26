import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { TrialDetailClient } from "@/components/trials/TrialDetailClient";

export const dynamic = 'force-dynamic';

export default async function TrialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const trial = await prisma.colorTrial.findUnique({
    where: { id },
    include: {
      project: { include: { client: true } },
      color: { include: { operateur: { select: { id: true, nom: true } } } },
      operateur: { select: { id: true, nom: true } },
      spectroMeasurements: { orderBy: { createdAt: "asc" }, include: { operateur: { select: { id: true, nom: true } } } },
      densitoMeasurements: { orderBy: { createdAt: "asc" }, include: { operateur: { select: { id: true, nom: true } } } },
      formulations: { include: { items: { orderBy: { poids: "desc" } } } },
      ovenData: { include: { operateur: { select: { id: true, nom: true } } } },
    },
  });

  if (!trial) notFound();

  const tolerances = await prisma.tolerance.findMany({ where: { processId: trial.project?.processId } });

  return <TrialDetailClient trial={JSON.parse(JSON.stringify(trial))} tolerances={JSON.parse(JSON.stringify(tolerances))} />;
}
