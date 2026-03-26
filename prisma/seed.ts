// ================================================================
// COLORLAB PRO — SEED DATA
// Donnees demo MULTIPRINT S.A. — Douala, Cameroun
// ================================================================

import { PrismaClient, Role, ProcessType, SupportType, ProjectStatus, Priority, TrialStatus, ColorType, MeasureContext, ValidationDecision, ProductionStep } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🎨 Seeding ColorLab Pro...");

  // ============================================================
  // 0. PERMISSIONS
  // ============================================================
  const permissions = [
    // Dossiers couleur
    { nom: 'project.create', description: 'Créer un dossier couleur', module: 'projects', action: 'create' },
    { nom: 'project.read', description: 'Lire les dossiers couleur', module: 'projects', action: 'read' },
    { nom: 'project.edit', description: 'Modifier un dossier couleur', module: 'projects', action: 'edit' },
    { nom: 'project.delete', description: 'Supprimer un dossier couleur', module: 'projects', action: 'delete' },
    { nom: 'project.validate', description: 'Valider un dossier couleur', module: 'projects', action: 'validate' },
    { nom: 'project.reject', description: 'Rejeter un dossier couleur', module: 'projects', action: 'reject' },
    
    // Essais
    { nom: 'trial.create', description: 'Créer un essai', module: 'trials', action: 'create' },
    { nom: 'trial.read', description: 'Lire les essais', module: 'trials', action: 'read' },
    { nom: 'trial.edit', description: 'Modifier un essai', module: 'trials', action: 'edit' },
    { nom: 'trial.validate', description: 'Valider un essai', module: 'trials', action: 'validate' },
    
    // Formulations
    { nom: 'formulation.create', description: 'Créer une formulation', module: 'formulations', action: 'create' },
    { nom: 'formulation.read', description: 'Lire les formulations', module: 'formulations', action: 'read' },
    { nom: 'formulation.edit', description: 'Modifier une formulation', module: 'formulations', action: 'edit' },
    { nom: 'formulation.validate', description: 'Valider une formulation', module: 'formulations', action: 'validate' },
    
    // Mesures
    { nom: 'measure.create', description: 'Créer des mesures', module: 'measures', action: 'create' },
    { nom: 'measure.read', description: 'Lire les mesures', module: 'measures', action: 'read' },
    
    // Validation labo
    { nom: 'validation.create', description: 'Créer une validation', module: 'validations', action: 'create' },
    { nom: 'validation.read', description: 'Lire les validations', module: 'validations', action: 'read' },
    
    // Production
    { nom: 'production.create', description: 'Créer un contrôle production', module: 'production', action: 'create' },
    { nom: 'production.read', description: 'Lire les contrôles production', module: 'production', action: 'read' },
    
    // Contrôle qualité
    { nom: 'qc.create', description: 'Créer un contrôle qualité', module: 'qc', action: 'create' },
    { nom: 'qc.read', description: 'Lire les contrôles qualité', module: 'qc', action: 'read' },
    { nom: 'qc.validate', description: 'Valider un contrôle qualité', module: 'qc', action: 'validate' },
    
    // IA
    { nom: 'ai.use', description: 'Utiliser l\'agent IA', module: 'ai', action: 'use' },
    { nom: 'ai.config', description: 'Configurer l\'agent IA', module: 'ai', action: 'config' },
    
    // Settings
    { nom: 'settings.read', description: 'Lire les paramètres', module: 'settings', action: 'read' },
    { nom: 'settings.edit', description: 'Modifier les paramètres', module: 'settings', action: 'edit' },
    
    // Users
    { nom: 'users.manage', description: 'Gérer les utilisateurs', module: 'users', action: 'manage' },
    { nom: 'users.assign_permissions', description: 'Attribuer des permissions', module: 'users', action: 'assign_permissions' },
    
    // Reports
    { nom: 'reports.read', description: 'Lire les rapports', module: 'reports', action: 'read' },
    { nom: 'reports.export', description: 'Exporter les rapports', module: 'reports', action: 'export' },
    
    // Libraries
    { nom: 'library.read', description: 'Lire les bibliothèques', module: 'libraries', action: 'read' },
    { nom: 'library.edit', description: 'Modifier les bibliothèques', module: 'libraries', action: 'edit' },
    
    // Metal
    { nom: 'metal.read', description: 'Lire les données métal', module: 'metal', action: 'read' },
    { nom: 'metal.edit', description: 'Modifier les données métal', module: 'metal', action: 'edit' },
    
    // Workflow
    { nom: 'workflow.to_en_essai', description: 'Passer en essai', module: 'workflow', action: 'to_en_essai' },
    { nom: 'workflow.to_en_analyse', description: 'Passer en analyse', module: 'workflow', action: 'to_en_analyse' },
    { nom: 'workflow.to_a_valider', description: 'Passer à valider', module: 'workflow', action: 'to_a_valider' },
    { nom: 'workflow.to_brouillon', description: 'Revenir en brouillon', module: 'workflow', action: 'to_brouillon' },
    { nom: 'workflow.to_archive', description: 'Archiver', module: 'workflow', action: 'to_archive' },
    { nom: 'workflow.to_valide', description: 'Valider', module: 'workflow', action: 'to_valide' },
    { nom: 'workflow.to_rejete', description: 'Rejeter', module: 'workflow', action: 'to_rejete' },
    
    // Priority
    { nom: 'priority.change', description: 'Modifier la priorité', module: 'priority', action: 'change' },
  ];

  console.log('Création des permissions...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { nom: permission.nom },
      update: permission,
      create: permission,
    });
  }
  console.log(`  ✅ ${permissions.length} permissions`);

  // ============================================================
  // 1. USERS
  // ============================================================
  const defaultPwd = await hash("colorlab2026", 12);

  const users = await Promise.all([
    prisma.user.create({ data: { id: "usr_admin", nom: "Admin Systeme", email: "admin@multiprint.cm", login: "admin", passwordHash: defaultPwd, role: Role.admin } }),
    prisma.user.create({ data: { id: "usr_resp_labo", nom: "Jean-Marc Nguema", email: "jm.nguema@multiprint.cm", login: "jmnguema", passwordHash: defaultPwd, role: Role.resp_labo } }),
    prisma.user.create({ data: { id: "usr_tech1", nom: "Paul Mbarga", email: "p.mbarga@multiprint.cm", login: "pmbarga", passwordHash: defaultPwd, role: Role.tech_labo } }),
    prisma.user.create({ data: { id: "usr_tech2", nom: "Yvette Ndongo", email: "y.ndongo@multiprint.cm", login: "yndongo", passwordHash: defaultPwd, role: Role.tech_labo } }),
    prisma.user.create({ data: { id: "usr_cond1", nom: "Samuel Fotso", email: "s.fotso@multiprint.cm", login: "sfotso", passwordHash: defaultPwd, role: Role.conducteur } }),
    prisma.user.create({ data: { id: "usr_cond2", nom: "Thierry Ekane", email: "t.ekane@multiprint.cm", login: "tekane", passwordHash: defaultPwd, role: Role.conducteur } }),
    prisma.user.create({ data: { id: "usr_qc", nom: "Marie Atangana", email: "m.atangana@multiprint.cm", login: "matangana", passwordHash: defaultPwd, role: Role.resp_qc } }),
    prisma.user.create({ data: { id: "usr_dir", nom: "Xavier Directeur", email: "direction@multiprint.cm", login: "direction", passwordHash: defaultPwd, role: Role.direction } }),
  ]);
  console.log(`  ✅ ${users.length} users`);

  // ============================================================
  // 1.1. ATTRIBUTION DES PERMISSIONS À L'ADMIN
  // ============================================================
  console.log('Attribution des permissions à l\'admin...');
  const allPermissions = await prisma.permission.findMany();
  const adminUser = users.find(u => u.login === 'admin');
  
  if (adminUser) {
    for (const permission of allPermissions) {
      await prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: adminUser.id,
            permissionId: permission.id,
          },
        },
        update: {
          grantedBy: adminUser.id,
        },
        create: {
          userId: adminUser.id,
          permissionId: permission.id,
          grantedBy: adminUser.id,
        },
      });
    }
    console.log(`  ✅ ${allPermissions.length} permissions attribuées à l'admin`);
  }

  // ============================================================
  // 2. CLIENTS
  // ============================================================
  const clients = await Promise.all([
    prisma.client.create({ data: { id: "cli_01", nom: "SABC", code: "SABC", secteur: "Boissons", contact: "M. Kamga", email: "kamga@sabc.cm", telephone: "699000001" } }),
    prisma.client.create({ data: { id: "cli_02", nom: "CHOCOCAM", code: "CHOC", secteur: "Agroalimentaire", contact: "Mme Bella", email: "bella@chococam.cm", telephone: "699000002" } }),
    prisma.client.create({ data: { id: "cli_03", nom: "GUINNESS Cameroun", code: "GUIN", secteur: "Boissons", contact: "M. Tabi", email: "tabi@guinness.cm", telephone: "699000003" } }),
    prisma.client.create({ data: { id: "cli_04", nom: "NESTLE Cameroun", code: "NEST", secteur: "Agroalimentaire", contact: "Mme Fouda", email: "fouda@nestle.cm", telephone: "699000004" } }),
    prisma.client.create({ data: { id: "cli_05", nom: "CICAM", code: "CICA", secteur: "Textile/Industrie", contact: "M. Essomba", email: "essomba@cicam.cm", telephone: "699000005" } }),
  ]);
  console.log(`  ✅ ${clients.length} clients`);

  // ============================================================
  // 3. PRODUCTS
  // ============================================================
  const products = await Promise.all([
    prisma.product.create({ data: { id: "prd_01", clientId: "cli_01", referenceClient: "33CL-LABEL", designation: "Etiquette 33 Export 33cl", familleProduit: "Etiquettes", description: "Etiquette biere 33 Export" } }),
    prisma.product.create({ data: { id: "prd_02", clientId: "cli_02", referenceClient: "CHOC-WRAP", designation: "Emballage Chocomax", familleProduit: "Flexible", description: "Film BOPP pour barre chocolatee" } }),
    prisma.product.create({ data: { id: "prd_03", clientId: "cli_03", referenceClient: "GUIN-CAP", designation: "Capsule Guinness Smooth", familleProduit: "Capsules metal", description: "Couronne metal offset" } }),
    prisma.product.create({ data: { id: "prd_04", clientId: "cli_01", referenceClient: "SABC-CTN", designation: "Carton Castel Beer", familleProduit: "Cartons", description: "Caisse americaine biere" } }),
    prisma.product.create({ data: { id: "prd_05", clientId: "cli_04", referenceClient: "NEST-BOITE", designation: "Boite Nido 400g", familleProduit: "Metal ETP", description: "Couvercle metal ETP laque" } }),
  ]);
  console.log(`  ✅ ${products.length} products`);

  // ============================================================
  // 4. MACHINES
  // ============================================================
  const machines = await Promise.all([
    prisma.machine.create({ data: { id: "mch_01", nomMachine: "Heidelberg CD102", typeProcede: ProcessType.offset_papier, atelier: "Offset Etiquette" } }),
    prisma.machine.create({ data: { id: "mch_02", nomMachine: "Heidelberg SM74", typeProcede: ProcessType.offset_papier, atelier: "Offset Carton" } }),
    prisma.machine.create({ data: { id: "mch_03", nomMachine: "Cerutti R98", typeProcede: ProcessType.heliogravure, atelier: "Heliogravure Flexible" } }),
    prisma.machine.create({ data: { id: "mch_04", nomMachine: "Crabtree Marquess", typeProcede: ProcessType.offset_metal, atelier: "Offset Metal" } }),
    prisma.machine.create({ data: { id: "mch_05", nomMachine: "Rutherford 6C", typeProcede: ProcessType.offset_metal, atelier: "Offset Metal" } }),
  ]);
  console.log(`  ✅ ${machines.length} machines`);

  // ============================================================
  // 5. TOLERANCES
  // ============================================================
  await Promise.all([
    prisma.tolerance.create({ data: { processId: ProcessType.offset_papier, supportType: "papier", deltaEMax: 3, tolL: 2, tolA: 1.5, tolB: 1.5, tolDensite: 0.10, tolTrapping: 70, tolContraste: 25 } }),
    prisma.tolerance.create({ data: { processId: ProcessType.heliogravure, supportType: "flexible", deltaEMax: 4, tolL: 2.5, tolA: 2, tolB: 2, tolDensite: 0.15, tolTrapping: 0, tolContraste: 0 } }),
    prisma.tolerance.create({ data: { processId: ProcessType.offset_metal, supportType: "metal", deltaEMax: 3.5, tolL: 2, tolA: 1.5, tolB: 2, tolDensite: 0.12, tolTrapping: 65, tolContraste: 20 } }),
  ]);
  console.log("  ✅ 3 tolerances");

  // ============================================================
  // 6. STANDARDS
  // ============================================================
  await Promise.all([
    prisma.standard.create({ data: { nom: "ISO 12647-2 Offset", processId: ProcessType.offset_papier, supportType: "papier_couche", description: "Standard offset feuilles papier couche" } }),
    prisma.standard.create({ data: { nom: "ISO 12647-4 Helio", processId: ProcessType.heliogravure, supportType: "flexible", description: "Standard heliogravure publication" } }),
    prisma.standard.create({ data: { nom: "Interne Metal ETP", processId: ProcessType.offset_metal, supportType: "metal", description: "Standard interne offset metal apres cuisson" } }),
  ]);
  console.log("  ✅ 3 standards");

  // ============================================================
  // 7. COLOR PROJECTS (8 dossiers)
  // ============================================================
  const projects = await Promise.all([
    prisma.colorProject.create({ data: { id: "prj_01", codeDossier: "CLR-10421", clientId: "cli_01", productId: "prd_01", processId: ProcessType.offset_papier, machineId: "mch_01", supportId: SupportType.papier_couche, statut: ProjectStatus.valide, cibleDescription: "Etiquette 33 Export", priorite: Priority.normale, responsableId: "usr_tech1", creeParId: "usr_tech1", createdAt: new Date("2026-02-15") } }),
    prisma.colorProject.create({ data: { id: "prj_02", codeDossier: "CLR-10422", clientId: "cli_02", productId: "prd_02", processId: ProcessType.heliogravure, machineId: "mch_03", supportId: SupportType.bopp, statut: ProjectStatus.en_essai, cibleDescription: "Emballage Chocomax 6 couleurs", priorite: Priority.haute, responsableId: "usr_resp_labo", creeParId: "usr_tech1", createdAt: new Date("2026-03-05") } }),
    prisma.colorProject.create({ data: { id: "prj_03", codeDossier: "CLR-10423", clientId: "cli_03", productId: "prd_03", processId: ProcessType.offset_metal, machineId: "mch_04", supportId: SupportType.etp, statut: ProjectStatus.en_analyse, cibleDescription: "Capsule Guinness Smooth", priorite: Priority.urgente, responsableId: "usr_resp_labo", creeParId: "usr_resp_labo", createdAt: new Date("2026-03-10") } }),
    prisma.colorProject.create({ data: { id: "prj_04", codeDossier: "CLR-10424", clientId: "cli_01", productId: "prd_04", processId: ProcessType.offset_papier, machineId: "mch_02", supportId: SupportType.carton_couche, statut: ProjectStatus.a_valider, cibleDescription: "Caisse Castel Beer", priorite: Priority.normale, responsableId: "usr_tech2", creeParId: "usr_tech2", createdAt: new Date("2026-03-12") } }),
    prisma.colorProject.create({ data: { id: "prj_05", codeDossier: "CLR-10425", clientId: "cli_04", productId: "prd_05", processId: ProcessType.offset_metal, machineId: "mch_05", supportId: SupportType.etp, statut: ProjectStatus.en_essai, cibleDescription: "Boite Nido 400g", priorite: Priority.haute, responsableId: "usr_tech1", creeParId: "usr_tech1", createdAt: new Date("2026-03-14") } }),
    prisma.colorProject.create({ data: { id: "prj_06", codeDossier: "CLR-10426", clientId: "cli_05", productId: "prd_01", processId: ProcessType.offset_papier, machineId: "mch_01", supportId: SupportType.papier_couche, statut: ProjectStatus.rejete, cibleDescription: "Etiquette CICAM", priorite: Priority.normale, responsableId: "usr_tech2", creeParId: "usr_tech2", createdAt: new Date("2026-02-20") } }),
    prisma.colorProject.create({ data: { id: "prj_07", codeDossier: "CLR-10427", clientId: "cli_02", productId: "prd_02", processId: ProcessType.heliogravure, machineId: "mch_03", supportId: SupportType.pet, statut: ProjectStatus.brouillon, cibleDescription: "Film Chocomax PET", priorite: Priority.normale, responsableId: "usr_tech1", creeParId: "usr_tech1", createdAt: new Date("2026-03-18") } }),
    prisma.colorProject.create({ data: { id: "prj_08", codeDossier: "CLR-10428", clientId: "cli_03", productId: "prd_03", processId: ProcessType.offset_metal, machineId: "mch_04", supportId: SupportType.tfs, statut: ProjectStatus.valide_reserve, cibleDescription: "Capsule Guinness Gold", priorite: Priority.haute, responsableId: "usr_resp_labo", creeParId: "usr_resp_labo", createdAt: new Date("2026-03-01") } }),
  ]);
  console.log(`  ✅ ${projects.length} projects`);

  // ============================================================
  // 8. PROJECT COLORS (14 couleurs, dont 6 pour CLR-10422 helio)
  // ============================================================
  await Promise.all([
    // prj_01: single color
    prisma.projectColor.create({ data: { id: "pcl_01", projectId: "prj_01", poste: 1, nomCouleur: "Pantone 485 C", typeCouleur: ColorType.Pantone, cibleLabL: 51.34, cibleLabA: 66.16, cibleLabB: 54.71, operateurId: "usr_tech1", statut: "valide" } }),
    // prj_02: 6-color helio!
    prisma.projectColor.create({ data: { id: "pcl_02", projectId: "prj_02", poste: 1, nomCouleur: "Violet Chocomax V32", typeCouleur: ColorType.Client, cibleLabL: 28.45, cibleLabA: 32.18, cibleLabB: -42.67, operateurId: "usr_tech1", statut: "en_essai" } }),
    prisma.projectColor.create({ data: { id: "pcl_03", projectId: "prj_02", poste: 2, nomCouleur: "Or Chocomax M12", typeCouleur: ColorType.Client, cibleLabL: 72.50, cibleLabA: 8.20, cibleLabB: 58.90, operateurId: "usr_tech2", statut: "en_essai" } }),
    prisma.projectColor.create({ data: { id: "pcl_04", projectId: "prj_02", poste: 3, nomCouleur: "Blanc couvrant", typeCouleur: ColorType.Interne, cibleLabL: 95.00, cibleLabA: -0.50, cibleLabB: 1.20, operateurId: "usr_tech1", statut: "brouillon" } }),
    prisma.projectColor.create({ data: { id: "pcl_05", projectId: "prj_02", poste: 4, nomCouleur: "Cyan process", typeCouleur: ColorType.CMJN, cibleLabL: 56.00, cibleLabA: -25.00, cibleLabB: -43.00, operateurId: "usr_tech2", statut: "brouillon" } }),
    prisma.projectColor.create({ data: { id: "pcl_06", projectId: "prj_02", poste: 5, nomCouleur: "Magenta process", typeCouleur: ColorType.CMJN, cibleLabL: 48.00, cibleLabA: 68.00, cibleLabB: -6.00, operateurId: "usr_tech1", statut: "brouillon" } }),
    prisma.projectColor.create({ data: { id: "pcl_07", projectId: "prj_02", poste: 6, nomCouleur: "Jaune process", typeCouleur: ColorType.CMJN, cibleLabL: 89.00, cibleLabA: -4.00, cibleLabB: 85.00, operateurId: "usr_tech2", statut: "brouillon" } }),
    // prj_03: single metal
    prisma.projectColor.create({ data: { id: "pcl_08", projectId: "prj_03", poste: 1, nomCouleur: "Pantone 289 C", typeCouleur: ColorType.Pantone, cibleLabL: 12.56, cibleLabA: -1.89, cibleLabB: -17.34, operateurId: "usr_tech1", statut: "en_analyse" } }),
    // prj_04: single
    prisma.projectColor.create({ data: { id: "pcl_09", projectId: "prj_04", poste: 1, nomCouleur: "Pantone 130 C", typeCouleur: ColorType.Pantone, cibleLabL: 74.93, cibleLabA: 18.72, cibleLabB: 82.15, operateurId: "usr_tech2", statut: "candidat_validation" } }),
    // prj_05: 2 colors metal
    prisma.projectColor.create({ data: { id: "pcl_10", projectId: "prj_05", poste: 1, nomCouleur: "Bleu Nido BN-01", typeCouleur: ColorType.Client, cibleLabL: 42.11, cibleLabA: -5.67, cibleLabB: -38.92, operateurId: "usr_tech1", statut: "en_essai" } }),
    prisma.projectColor.create({ data: { id: "pcl_11", projectId: "prj_05", poste: 2, nomCouleur: "Rouge Nido RN-02", typeCouleur: ColorType.Client, cibleLabL: 45.20, cibleLabA: 58.30, cibleLabB: 32.10, operateurId: "usr_tech2", statut: "brouillon" } }),
    // prj_06
    prisma.projectColor.create({ data: { id: "pcl_12", projectId: "prj_06", poste: 1, nomCouleur: "Pantone 356 C", typeCouleur: ColorType.Pantone, cibleLabL: 37.45, cibleLabA: -44.12, cibleLabB: 24.89, operateurId: "usr_tech2", statut: "rejete" } }),
    // prj_07
    prisma.projectColor.create({ data: { id: "pcl_13", projectId: "prj_07", poste: 1, nomCouleur: "Pantone 186 C", typeCouleur: ColorType.Pantone, cibleLabL: 44.08, cibleLabA: 65.24, cibleLabB: 33.19, operateurId: "usr_tech1", statut: "brouillon" } }),
    // prj_08
    prisma.projectColor.create({ data: { id: "pcl_14", projectId: "prj_08", poste: 1, nomCouleur: "Or Guinness G-GOLD", typeCouleur: ColorType.Client, cibleLabL: 72.33, cibleLabA: 5.67, cibleLabB: 62.11, operateurId: "usr_resp_labo", statut: "valide_reserve" } }),
  ]);
  console.log("  ✅ 14 project colors");

  // ============================================================
  // 9. TRIALS
  // ============================================================
  await Promise.all([
    prisma.colorTrial.create({ data: { id: "tri_01", projectId: "prj_01", colorId: "pcl_01", numeroVersion: 1, hypothese: "Formulation initiale Pantone 485 C", statut: TrialStatus.valide, operateurId: "usr_tech1", dateEssai: new Date("2026-02-18"), commentaire: "Essai initial" } }),
    prisma.colorTrial.create({ data: { id: "tri_02", projectId: "prj_01", colorId: "pcl_01", numeroVersion: 2, hypothese: "Ajustement +3% Rubine Red", statut: TrialStatus.valide, operateurId: "usr_tech1", dateEssai: new Date("2026-02-19"), commentaire: "Correction rouge" } }),
    prisma.colorTrial.create({ data: { id: "tri_03", projectId: "prj_02", colorId: "pcl_02", numeroVersion: 1, hypothese: "Base violette + dilution 18s CF4", statut: TrialStatus.mesure, operateurId: "usr_tech1", dateEssai: new Date("2026-03-05"), commentaire: "Premier essai Violet" } }),
    prisma.colorTrial.create({ data: { id: "tri_04", projectId: "prj_02", colorId: "pcl_03", numeroVersion: 1, hypothese: "Or metallise base solvant", statut: TrialStatus.en_cours, operateurId: "usr_tech2", dateEssai: new Date("2026-03-06"), commentaire: "Premier essai Or" } }),
    prisma.colorTrial.create({ data: { id: "tri_05", projectId: "prj_03", colorId: "pcl_08", numeroVersion: 1, hypothese: "Bleu reflex + noir process sur ETP laque", statut: TrialStatus.analyse, operateurId: "usr_tech1", dateEssai: new Date("2026-03-10"), commentaire: "Essai initial metal" } }),
    prisma.colorTrial.create({ data: { id: "tri_06", projectId: "prj_04", colorId: "pcl_09", numeroVersion: 1, hypothese: "Jaune Pantone 130 C standard", statut: TrialStatus.candidat_validation, operateurId: "usr_tech2", dateEssai: new Date("2026-03-12"), commentaire: "Bon resultat premier essai" } }),
    prisma.colorTrial.create({ data: { id: "tri_07", projectId: "prj_05", colorId: "pcl_10", numeroVersion: 1, hypothese: "Bleu process + blanc + vernis", statut: TrialStatus.a_corriger, operateurId: "usr_tech1", dateEssai: new Date("2026-03-14"), commentaire: "Derive thermique importante" } }),
    prisma.colorTrial.create({ data: { id: "tri_08", projectId: "prj_05", colorId: "pcl_10", numeroVersion: 2, hypothese: "Compensation cuisson -2 b*", statut: TrialStatus.en_cours, operateurId: "usr_tech1", dateEssai: new Date("2026-03-15"), commentaire: "Correction derive thermique" } }),
  ]);
  console.log("  ✅ 8 trials");

  // ============================================================
  // 10. SPECTRO MEASUREMENTS (avec densites CMJN + reflectances)
  // ============================================================
  await Promise.all([
    prisma.spectroMeasurement.create({ data: { trialId: "tri_02", contexte: MeasureContext.essai, lectureNumero: 1, lValue: 51.12, aValue: 65.89, bValue: 54.33, cValue: 85.35, hValue: 39.5, operateurId: "usr_tech1", commentaire: "Conforme", densiteC: 0.42, densiteM: 1.38, densiteJ: 1.22, densiteN: 0.15, densiteTd: 1.85, r400: 4.2, r450: 5.1, r500: 8.3, r550: 18.7, r600: 42.5, r650: 38.9, r700: 32.1 } }),
    prisma.spectroMeasurement.create({ data: { trialId: "tri_03", contexte: MeasureContext.essai, lectureNumero: 1, lValue: 29.11, aValue: 30.56, bValue: -40.88, cValue: 51.02, hValue: 306.8, operateurId: "usr_tech1", commentaire: "Leger ecart b*", densiteC: 1.05, densiteM: 0.88, densiteJ: 0.12, densiteN: 0.45, densiteTd: 1.52, r400: 3.8, r450: 2.9, r500: 2.1, r550: 4.6, r600: 8.2, r650: 5.4, r700: 3.8 } }),
    prisma.spectroMeasurement.create({ data: { trialId: "tri_05", contexte: MeasureContext.avant_cuisson, lectureNumero: 1, lValue: 14.22, aValue: -1.45, bValue: -15.67, cValue: 15.74, hValue: 264.7, operateurId: "usr_tech1", commentaire: "Avant cuisson OK", densiteC: 1.48, densiteM: 0.82, densiteJ: 0.40, densiteN: 1.92, densiteTd: 2.05, r400: 2.0, r450: 2.8, r500: 3.5, r550: 2.2, r600: 1.8, r650: 1.5, r700: 1.3 } }),
    prisma.spectroMeasurement.create({ data: { trialId: "tri_05", contexte: MeasureContext.apres_cuisson, lectureNumero: 1, lValue: 15.89, aValue: -0.89, bValue: -14.11, cValue: 14.14, hValue: 266.4, operateurId: "usr_tech2", commentaire: "Derive thermique detectee", densiteC: 1.42, densiteM: 0.78, densiteJ: 0.38, densiteN: 1.85, densiteTd: 1.95 } }),
    prisma.spectroMeasurement.create({ data: { trialId: "tri_06", contexte: MeasureContext.essai, lectureNumero: 1, lValue: 74.56, aValue: 18.34, bValue: 81.78, cValue: 83.81, hValue: 77.4, operateurId: "usr_tech2", commentaire: "Tres bon resultat", densiteC: 0.08, densiteM: 0.22, densiteJ: 1.05, densiteN: 0.05, densiteTd: 1.12, r400: 5.5, r450: 8.2, r500: 44.9, r550: 72.1, r600: 13.1, r650: 3.2, r700: 2.1 } }),
    prisma.spectroMeasurement.create({ data: { trialId: "tri_07", contexte: MeasureContext.avant_cuisson, lectureNumero: 1, lValue: 43.56, aValue: -5.12, bValue: -37.44, cValue: 37.79, hValue: 262.2, operateurId: "usr_tech1", densiteC: 1.35, densiteM: 0.45, densiteJ: 0.18, densiteN: 0.52, densiteTd: 1.68 } }),
    prisma.spectroMeasurement.create({ data: { trialId: "tri_07", contexte: MeasureContext.apres_cuisson, lectureNumero: 1, lValue: 46.23, aValue: -4.01, bValue: -33.11, cValue: 33.35, hValue: 263.1, operateurId: "usr_tech2", densiteC: 1.28, densiteM: 0.42, densiteJ: 0.16, densiteN: 0.48, densiteTd: 1.55 } }),
  ]);
  console.log("  ✅ 7 spectro measurements");

  // ============================================================
  // 11. DENSITO MEASUREMENTS
  // ============================================================
  await Promise.all([
    prisma.densitoMeasurement.create({ data: { trialId: "tri_02", contexte: MeasureContext.essai, couleur: "ton_direct", densite: 1.85, trapping: 82, contraste: 38, operateurId: "usr_tech1" } }),
    prisma.densitoMeasurement.create({ data: { trialId: "tri_03", contexte: MeasureContext.essai, couleur: "ton_direct", densite: 1.52, operateurId: "usr_tech1" } }),
  ]);
  console.log("  ✅ 2 densito measurements");

  // ============================================================
  // 12. FORMULATIONS (offset + helio)
  // ============================================================
  // Offset
  const frmOffset = await prisma.formulation.create({ data: { id: "frm_01", projectId: "prj_01", trialId: "tri_02", codeFormule: "F-485-V2", versionFormule: 2, coutTotal: 4500, poidsTotal: 1000, validee: true, commentaire: "Formulation finale validee", processType: "offset_papier", tack: 12.5, finesseBreoyage: 5, hegman: 7, sechageType: "oxydation", resistanceFrottement: "haute", siccativite: "normale" } });
  await Promise.all([
    prisma.formulationItem.create({ data: { formulationId: "frm_01", composant: "Rubine Red 4B", codeComposant: "RR-4B", typeComposant: "pigment", poids: 180, pourcentage: 18, lot: "LOT-2026-001", fournisseur: "Sun Chemical", coutUnitaire: 12 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_01", composant: "Jaune de Chrome", codeComposant: "JC-01", typeComposant: "pigment", poids: 85, pourcentage: 8.5, lot: "LOT-2026-002", fournisseur: "Sun Chemical", coutUnitaire: 9 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_01", composant: "Vernis offset quickset", codeComposant: "VO-QS", typeComposant: "vernis_offset", poids: 620, pourcentage: 62, lot: "LOT-2026-010", fournisseur: "Flint Group", coutUnitaire: 3.5 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_01", composant: "Siccatif cobalt 6%", codeComposant: "SC-01", typeComposant: "siccatif", poids: 15, pourcentage: 1.5, lot: "LOT-2026-011", fournisseur: "Flint Group", coutUnitaire: 18 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_01", composant: "Anti-maculant poudre", codeComposant: "AM-P", typeComposant: "anti_maculage", poids: 10, pourcentage: 1, lot: "LOT-2026-012", fournisseur: "Flint Group", coutUnitaire: 8 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_01", composant: "Base transparente", codeComposant: "BT-00", typeComposant: "base", poids: 90, pourcentage: 9, lot: "LOT-2026-015", fournisseur: "Sun Chemical", coutUnitaire: 2.5 } }),
  ]);

  // Helio
  const frmHelio = await prisma.formulation.create({ data: { id: "frm_02", projectId: "prj_02", trialId: "tri_03", codeFormule: "F-V32-V1", versionFormule: 1, coutTotal: 6200, poidsTotal: 800, validee: false, commentaire: "A corriger viscosite", processType: "heliogravure", viscositeCoupe: 18, coupe: "CF4", tauxDilution: 30, profondeurAlveole: 38, typeVernis: "NC", tempsSechageHelio: 3 } });
  await Promise.all([
    prisma.formulationItem.create({ data: { formulationId: "frm_02", composant: "Violet Carbazole", codeComposant: "VC-01", typeComposant: "pigment", poids: 120, pourcentage: 15, lot: "LOT-2026-030", fournisseur: "Siegwerk", coutUnitaire: 22 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_02", composant: "Bleu Reflex 15:3", codeComposant: "BR-01", typeComposant: "pigment", poids: 80, pourcentage: 10, lot: "LOT-2026-031", fournisseur: "Siegwerk", coutUnitaire: 15 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_02", composant: "Vernis NC heliogravure", codeComposant: "VNC-H1", typeComposant: "vernis_nc", poids: 320, pourcentage: 40, lot: "LOT-2026-040", fournisseur: "Siegwerk", coutUnitaire: 4 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_02", composant: "Ethanol / Ethyl acetate", codeComposant: "SEA-01", typeComposant: "solvant", poids: 200, pourcentage: 25, lot: "LOT-2026-041", fournisseur: "BASF", coutUnitaire: 1.8 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_02", composant: "Anti-mousse XP40", codeComposant: "AMX-40", typeComposant: "anti_mousse", poids: 15, pourcentage: 1.9, lot: "LOT-2026-042", fournisseur: "BYK", coutUnitaire: 12 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_02", composant: "Agent glissement PE wax", codeComposant: "AGP-01", typeComposant: "agent_glissement", poids: 25, pourcentage: 3.1, lot: "LOT-2026-043", fournisseur: "Shamrock", coutUnitaire: 8 } }),
    prisma.formulationItem.create({ data: { formulationId: "frm_02", composant: "Retardateur evaporation", codeComposant: "RET-01", typeComposant: "retardateur", poids: 40, pourcentage: 5, lot: "LOT-2026-044", fournisseur: "Siegwerk", coutUnitaire: 6 } }),
  ]);
  console.log("  ✅ 2 formulations + 13 items");

  // ============================================================
  // 13. VALIDATIONS
  // ============================================================
  await Promise.all([
    prisma.validation.create({ data: { projectId: "prj_01", trialId: "tri_02", statutValidation: ValidationDecision.valide, valideParId: "usr_resp_labo", dateValidation: new Date("2026-02-20T14:00:00Z"), commentaire: "Teinte conforme - validation definitive" } }),
    prisma.validation.create({ data: { projectId: "prj_08", statutValidation: ValidationDecision.valide_reserve, valideParId: "usr_resp_labo", dateValidation: new Date("2026-03-02T16:30:00Z"), commentaire: "Valide sous reserve stabilite cuisson" } }),
  ]);
  console.log("  ✅ 2 validations");

  // ============================================================
  // 14. PRODUCTION CONTROLS
  // ============================================================
  await Promise.all([
    prisma.productionControl.create({ data: { projectId: "prj_01", etapeTirage: ProductionStep.debut, dateControle: new Date("2026-02-25T07:30:00Z"), operateurId: "usr_cond1", commentaire: "RAS", conforme: true } }),
    prisma.productionControl.create({ data: { projectId: "prj_01", etapeTirage: ProductionStep.milieu, dateControle: new Date("2026-02-25T12:00:00Z"), operateurId: "usr_cond1", commentaire: "Stable", conforme: true } }),
    prisma.productionControl.create({ data: { projectId: "prj_01", etapeTirage: ProductionStep.fin, dateControle: new Date("2026-02-25T17:00:00Z"), operateurId: "usr_cond1", commentaire: "OK", conforme: true } }),
    prisma.productionControl.create({ data: { projectId: "prj_08", etapeTirage: ProductionStep.debut, dateControle: new Date("2026-03-04T08:00:00Z"), operateurId: "usr_cond2", commentaire: "Leger ecart densite", conforme: false } }),
    prisma.productionControl.create({ data: { projectId: "prj_08", etapeTirage: ProductionStep.milieu, dateControle: new Date("2026-03-04T13:00:00Z"), operateurId: "usr_cond2", commentaire: "Correction appliquee", conforme: true } }),
  ]);
  console.log("  ✅ 5 production controls");

  // ============================================================
  // 15. METAL-SPECIFIC DATA
  // ============================================================
  await Promise.all([
    prisma.metalSupportData.create({ data: { projectId: "prj_03", metalType: "ETP", epaisseur: 0.18, fournisseur: "ArcelorMittal", lot: "ETP-2026-088", finition: "Brillant", fondType: "metal_nu", observations: "Fer blanc standard capsule" } }),
    prisma.metalSupportData.create({ data: { projectId: "prj_05", metalType: "ETP", epaisseur: 0.22, fournisseur: "ArcelorMittal", lot: "ETP-2026-112", finition: "Mat", fondType: "laque_blanche", observations: "Boite Nido - fond laque blanc requis" } }),
    prisma.metalSupportData.create({ data: { projectId: "prj_08", metalType: "TFS", epaisseur: 0.20, fournisseur: "Nippon Steel", lot: "TFS-2026-045", finition: "Brillant", fondType: "laque_blanche", observations: "Capsule Guinness - TFS chrome" } }),
  ]);
  console.log("  ✅ 3 metal support data");

  await Promise.all([
    prisma.whiteLacquerData.create({ data: { projectId: "prj_05", reference: "LB-PPG-200", fournisseur: "PPG Coatings", lot: "WL-2026-033", opacite: 92, blancheur: 88.5, brillance: 45, nbCouches: 2, depot: 8.5, commentaire: "Depot double couche pour opacite max", mesureL: 94.2, mesureA: -0.8, mesureB: 2.1, conforme: true } }),
    prisma.whiteLacquerData.create({ data: { projectId: "prj_08", reference: "LB-AKZ-150", fournisseur: "AkzoNobel", lot: "WL-2026-041", opacite: 88, blancheur: 86.2, brillance: 42, nbCouches: 1, depot: 6.2, commentaire: "Couche unique OK pour or", mesureL: 92.8, mesureA: -0.5, mesureB: 2.8, conforme: true } }),
  ]);
  console.log("  ✅ 2 white lacquer data");

  await Promise.all([
    prisma.ovenData.create({ data: { trialId: "tri_05", typeFour: "Tunnel gaz", temperatureConsigne: 180, temperatureReelle: 182, tempsSejour: 12, vitesseLigne: 25, zone: "Zone 3", operateurId: "usr_cond1", commentaire: "Cuisson nominale" } }),
    prisma.ovenData.create({ data: { trialId: "tri_07", typeFour: "Tunnel gaz", temperatureConsigne: 185, temperatureReelle: 189, tempsSejour: 14, vitesseLigne: 22, zone: "Zone 3", operateurId: "usr_cond2", commentaire: "Temperature reelle elevee" } }),
  ]);
  console.log("  ✅ 2 oven data");

  console.log("\n🎨 ColorLab Pro seed complete!");
  console.log("   8 users | 5 clients | 5 products | 5 machines");
  console.log("   8 projects | 14 colors | 8 trials | 7 spectro | 2 densito");
  console.log("   2 formulations | 13 items | 2 validations | 5 prod controls");
  console.log("   3 metal | 2 white lacquer | 2 oven");
  console.log(`   ${permissions.length} permissions | ${allPermissions.length ? allPermissions.length : 0} permissions attribuées à l'admin\n`);
  
  console.log("🔑 COMPTES UTILISATEURS CRÉÉS :");
  console.log("   admin / colorlab2026 (Administrateur - toutes les permissions)");
  console.log("   jmnguema / colorlab2026 (Responsable Laboratoire)");
  console.log("   pmbarga / colorlab2026 (Technicien Laboratoire)");
  console.log("   yndongo / colorlab2026 (Technicien Laboratoire)");
  console.log("   sfotso / colorlab2026 (Conducteur Machine)");
  console.log("   tekane / colorlab2026 (Conducteur Machine)");
  console.log("   matangana / colorlab2026 (Responsable Qualité)");
  console.log("   direction / colorlab2026 (Direction Technique)");
  console.log("");
  console.log("🚀 Lancement : npm run dev");
  console.log("🌐 URL : http://localhost:3000");
  console.log("");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
