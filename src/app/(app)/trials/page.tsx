import prisma from "@/lib/prisma";
import { TrialListClient } from "@/components/trials/TrialListClient";

export const dynamic = 'force-dynamic';

export default async function TrialsPage() {
  const trials = await prisma.colorTrial.findMany({
    include: {
      project: { select: { id: true, codeDossier: true, processId: true, cibleDescription: true } },
      color: true,
      operateur: { select: { id: true, nom: true } },
      _count: { select: { spectroMeasurements: true, densitoMeasurements: true } },
    },
    orderBy: { dateEssai: "desc" },
  });

  return <TrialListClient trials={JSON.parse(JSON.stringify(trials))} />;
}
