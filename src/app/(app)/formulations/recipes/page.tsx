import prisma from "@/lib/prisma";
import { RecipeLibraryClient } from "@/components/formulations/RecipeLibraryClient";

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const formulations = await prisma.formulation.findMany({
    where: { validee: true },
    include: {
      items: { orderBy: { poids: "desc" } },
      trial: { include: { color: true, project: { select: { id: true, codeDossier: true, processId: true, cibleDescription: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <RecipeLibraryClient recipes={JSON.parse(JSON.stringify(formulations))} />;
}
