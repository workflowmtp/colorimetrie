// prisma/seed-permissions.ts
// Seed: insere les permissions dans la table `permissions`
// puis cree les liaisons role <-> permission dans `role_permissions`
// basé sur la PERMISSION_MATRIX existante.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ALL_PERMISSIONS: { nom: string; description: string; module: string; action: string }[] = [
  { nom: "project.create", description: "Creer un dossier couleur", module: "projects", action: "create" },
  { nom: "project.read", description: "Voir les dossiers couleur", module: "projects", action: "read" },
  { nom: "project.edit", description: "Modifier un dossier couleur", module: "projects", action: "edit" },
  { nom: "project.delete", description: "Supprimer un dossier couleur", module: "projects", action: "delete" },
  { nom: "project.validate", description: "Valider un dossier couleur", module: "projects", action: "validate" },
  { nom: "project.reject", description: "Rejeter un dossier couleur", module: "projects", action: "reject" },
  { nom: "trial.create", description: "Creer un essai", module: "trials", action: "create" },
  { nom: "trial.read", description: "Voir les essais", module: "trials", action: "read" },
  { nom: "trial.edit", description: "Modifier un essai", module: "trials", action: "edit" },
  { nom: "trial.validate", description: "Valider un essai", module: "trials", action: "validate" },
  { nom: "formulation.create", description: "Creer une formulation", module: "formulations", action: "create" },
  { nom: "formulation.read", description: "Voir les formulations", module: "formulations", action: "read" },
  { nom: "formulation.edit", description: "Modifier une formulation", module: "formulations", action: "edit" },
  { nom: "formulation.validate", description: "Valider une formulation", module: "formulations", action: "validate" },
  { nom: "measure.create", description: "Creer une mesure", module: "measures", action: "create" },
  { nom: "measure.read", description: "Voir les mesures", module: "measures", action: "read" },
  { nom: "validation.create", description: "Creer une validation labo", module: "validation", action: "create" },
  { nom: "validation.read", description: "Voir les validations labo", module: "validation", action: "read" },
  { nom: "production.create", description: "Creer un controle production", module: "production", action: "create" },
  { nom: "production.read", description: "Voir les controles production", module: "production", action: "read" },
  { nom: "qc.create", description: "Creer un controle qualite", module: "qc", action: "create" },
  { nom: "qc.read", description: "Voir les controles qualite", module: "qc", action: "read" },
  { nom: "qc.validate", description: "Valider un controle qualite", module: "qc", action: "validate" },
  { nom: "ai.use", description: "Utiliser l agent IA", module: "ai", action: "use" },
  { nom: "ai.config", description: "Configurer l agent IA", module: "ai", action: "config" },
  { nom: "settings.read", description: "Voir les parametres", module: "settings", action: "read" },
  { nom: "settings.edit", description: "Modifier les parametres", module: "settings", action: "edit" },
  { nom: "users.manage", description: "Gerer les utilisateurs", module: "users", action: "manage" },
  { nom: "users.assign_permissions", description: "Assigner des permissions", module: "users", action: "assign_permissions" },
  { nom: "reports.read", description: "Voir les rapports", module: "reports", action: "read" },
  { nom: "reports.export", description: "Exporter les rapports", module: "reports", action: "export" },
  { nom: "library.read", description: "Voir la bibliotheque", module: "library", action: "read" },
  { nom: "library.edit", description: "Modifier la bibliotheque", module: "library", action: "edit" },
  { nom: "metal.read", description: "Voir offset metal", module: "metal", action: "read" },
  { nom: "metal.edit", description: "Modifier offset metal", module: "metal", action: "edit" },
  { nom: "workflow.to_en_essai", description: "Transition vers en_essai", module: "workflow", action: "to_en_essai" },
  { nom: "workflow.to_en_analyse", description: "Transition vers en_analyse", module: "workflow", action: "to_en_analyse" },
  { nom: "workflow.to_a_valider", description: "Transition vers a_valider", module: "workflow", action: "to_a_valider" },
  { nom: "workflow.to_brouillon", description: "Transition vers brouillon", module: "workflow", action: "to_brouillon" },
  { nom: "workflow.to_archive", description: "Transition vers archive", module: "workflow", action: "to_archive" },
  { nom: "workflow.to_valide", description: "Transition vers valide", module: "workflow", action: "to_valide" },
  { nom: "workflow.to_rejete", description: "Transition vers rejete", module: "workflow", action: "to_rejete" },
  { nom: "priority.change", description: "Changer la priorite", module: "priority", action: "change" },
];

type RoleName = "admin" | "resp_labo" | "tech_labo" | "conducteur" | "resp_qc" | "direction";

const ROLE_PERMISSION_MAP: Record<string, RoleName[]> = {
  "project.create":       ["admin", "resp_labo", "tech_labo"],
  "project.read":         ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "project.edit":         ["admin", "resp_labo", "tech_labo"],
  "project.delete":       ["admin"],
  "project.validate":     ["admin", "resp_labo"],
  "project.reject":       ["admin", "resp_labo"],
  "trial.create":         ["admin", "resp_labo", "tech_labo"],
  "trial.read":           ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "trial.edit":           ["admin", "resp_labo", "tech_labo"],
  "trial.validate":       ["admin", "resp_labo"],
  "formulation.create":   ["admin", "resp_labo", "tech_labo"],
  "formulation.read":     ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "formulation.edit":     ["admin", "resp_labo", "tech_labo"],
  "formulation.validate": ["admin", "resp_labo"],
  "measure.create":       ["admin", "resp_labo", "tech_labo", "conducteur"],
  "measure.read":         ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "validation.create":    ["admin", "resp_labo"],
  "validation.read":      ["admin", "resp_labo", "tech_labo", "resp_qc", "direction"],
  "production.create":    ["admin", "conducteur"],
  "production.read":      ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "qc.create":            ["admin", "resp_qc"],
  "qc.read":              ["admin", "resp_labo", "tech_labo", "resp_qc", "direction"],
  "qc.validate":          ["admin", "resp_qc"],
  "ai.use":               ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc"],
  "ai.config":            ["admin"],
  "settings.read":        ["admin", "resp_labo", "resp_qc", "direction"],
  "settings.edit":        ["admin"],
  "users.manage":         ["admin"],
  "users.assign_permissions": ["admin"],
  "reports.read":         ["admin", "resp_labo", "resp_qc", "direction"],
  "reports.export":       ["admin", "resp_labo", "resp_qc", "direction"],
  "library.read":         ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "library.edit":         ["admin", "resp_labo"],
  "metal.read":           ["admin", "resp_labo", "tech_labo", "conducteur", "resp_qc", "direction"],
  "metal.edit":           ["admin", "resp_labo", "tech_labo"],
  "workflow.to_en_essai":   ["admin", "resp_labo", "tech_labo"],
  "workflow.to_en_analyse": ["admin", "resp_labo", "tech_labo"],
  "workflow.to_a_valider":  ["admin", "resp_labo", "tech_labo"],
  "workflow.to_brouillon":  ["admin", "resp_labo"],
  "workflow.to_archive":    ["admin", "resp_labo", "direction"],
  "workflow.to_valide":     ["admin", "resp_labo"],
  "workflow.to_rejete":     ["admin", "resp_labo"],
  "priority.change":        ["admin", "resp_labo", "resp_qc", "direction"],
};

async function main() {
  console.log("Seeding permissions...");

  // 1. Upsert all permissions
  for (const p of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { nom: p.nom },
      update: { description: p.description, module: p.module, action: p.action },
      create: p,
    });
  }
  console.log(`  ${ALL_PERMISSIONS.length} permissions upserted`);

  // 2. Fetch all permissions from DB to get IDs
  const dbPerms = await prisma.permission.findMany();
  const permMap = new Map(dbPerms.map((p) => [p.nom, p.id]));

  // 3. Upsert role_permissions
  let count = 0;
  for (const [permNom, roles] of Object.entries(ROLE_PERMISSION_MAP)) {
    const permId = permMap.get(permNom);
    if (!permId) { console.warn(`  Permission ${permNom} not found in DB`); continue; }

    for (const role of roles) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId: permId } },
        update: {},
        create: { role, permissionId: permId },
      });
      count++;
    }
  }
  console.log(`  ${count} role-permission links upserted`);
  console.log("Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
