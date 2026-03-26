import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.colorProject.findUnique({
    where: { id },
    include: {
      client: true,
      product: true,
      machine: true,
      responsable: { select: { id: true, nom: true } },
      creePar: { select: { id: true, nom: true } },
      colors: { orderBy: { poste: "asc" }, include: { operateur: { select: { id: true, nom: true } } } },
      trials: {
        orderBy: [{ colorId: "asc" }, { numeroVersion: "asc" }],
        include: {
          color: true,
          operateur: { select: { id: true, nom: true } },
          spectroMeasurements: { orderBy: { createdAt: "asc" }, include: { operateur: { select: { id: true, nom: true } } } },
          densitoMeasurements: { orderBy: { createdAt: "asc" } },
          formulations: { include: { items: { orderBy: { poids: "desc" } } } },
        },
      },
      validations: { orderBy: { dateValidation: "desc" }, include: { validePar: { select: { id: true, nom: true } } } },
      productionControls: { orderBy: { dateControle: "desc" }, include: { color: true, operateur: { select: { id: true, nom: true } } } },
      metalSupportData: true,
      whiteLacquerData: true,
    },
  });

  if (!project) notFound();

  const tolerances = await prisma.tolerance.findMany({ where: { processId: project.processId } });

  return <ProjectDetailClient project={JSON.parse(JSON.stringify(project))} tolerances={JSON.parse(JSON.stringify(tolerances))} />;
}
