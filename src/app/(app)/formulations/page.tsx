import prisma from "@/lib/prisma";
import { FormulationsPageClient } from "@/components/formulations/FormulationsPageClient";

export const dynamic = 'force-dynamic';

export default async function FormulationsPage() {
  const formulations = await prisma.formulation.findMany({
    include: {
      items: { orderBy: { poids: "desc" } },
      trial: { include: { color: true, project: { select: { id: true, codeDossier: true, processId: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <FormulationsPageClient formulations={JSON.parse(JSON.stringify(formulations))} />;
}
