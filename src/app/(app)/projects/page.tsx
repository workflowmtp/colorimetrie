import prisma from "@/lib/prisma";
import { ProjectListClient } from "@/components/projects/ProjectListClient";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await prisma.colorProject.findMany({
    include: {
      client: true,
      machine: true,
      responsable: { select: { id: true, nom: true } },
      colors: { orderBy: { poste: "asc" } },
      _count: { select: { trials: true, colors: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const users = await prisma.user.findMany({ where: { actif: true }, select: { id: true, nom: true, role: true } });

  return <ProjectListClient projects={JSON.parse(JSON.stringify(projects))} users={users} />;
}
