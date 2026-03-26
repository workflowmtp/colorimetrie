// ================================================================
// COLORLAB PRO — TYPES TYPESCRIPT
// Interfaces pour API, composants, et utilitaires
// ================================================================

import type {
  ColorProject, ProjectColor, ColorTrial,
  SpectroMeasurement, DensitoMeasurement,
  Formulation, FormulationItem,
  Validation, ProductionControl,
  MetalSupportData, WhiteLacquerData, OvenData,
  User, Client, Product, Machine, Tolerance, Standard,
  Role, ProjectStatus, Priority, ProcessType, SupportType,
  TrialStatus, ColorType, MeasureContext,
  ValidationDecision, ProductionStep,
} from "@prisma/client";

// Re-export Prisma types
export type {
  ColorProject, ProjectColor, ColorTrial,
  SpectroMeasurement, DensitoMeasurement,
  Formulation, FormulationItem,
  Validation, ProductionControl,
  MetalSupportData, WhiteLacquerData, OvenData,
  User, Client, Product, Machine, Tolerance, Standard,
  Role, ProjectStatus, Priority, ProcessType, SupportType,
  TrialStatus, ColorType, MeasureContext,
  ValidationDecision, ProductionStep,
};

// ================================================================
// ENRICHED TYPES (with relations loaded)
// ================================================================

/** ColorProject with all related data */
export interface ProjectWithRelations extends ColorProject {
  client: Client;
  product?: Product | null;
  machine?: Machine | null;
  responsable?: Pick<User, "id" | "nom"> | null;
  creePar?: Pick<User, "id" | "nom"> | null;
  colors: ProjectColor[];
  _count?: {
    trials: number;
    colors: number;
  };
}

/** ProjectColor with operator loaded */
export interface ProjectColorWithOperator extends ProjectColor {
  operateur?: Pick<User, "id" | "nom"> | null;
}

/** ColorTrial with color & measurements count */
export interface TrialWithRelations extends ColorTrial {
  color?: ProjectColor | null;
  project?: ColorProject | null;
  operateur?: Pick<User, "id" | "nom"> | null;
  _count?: {
    spectroMeasurements: number;
    densitoMeasurements: number;
  };
}

/** SpectroMeasurement with enriched context */
export interface SpectroWithContext extends SpectroMeasurement {
  trial?: ColorTrial & {
    project?: ColorProject | null;
    color?: ProjectColor | null;
  };
  operateur?: Pick<User, "id" | "nom"> | null;
}

/** Formulation with items and process params */
export interface FormulationWithItems extends Formulation {
  items: FormulationItem[];
  trial?: ColorTrial | null;
}

/** ProductionControl with color info */
export interface ProductionControlWithColor extends ProductionControl {
  color?: ProjectColor | null;
  operateur?: Pick<User, "id" | "nom"> | null;
}

// ================================================================
// API REQUEST / RESPONSE TYPES
// ================================================================

/** Create project request */
export interface CreateProjectInput {
  clientId: string;
  productId?: string;
  processId: ProcessType;
  machineId?: string;
  supportId?: SupportType;
  cibleDescription: string;
  priorite?: Priority;
  responsableId?: string;
  colors: CreateColorInput[];
}

/** Create color input (in project form) */
export interface CreateColorInput {
  poste: number;
  nomCouleur: string;
  typeCouleur: ColorType;
  cibleLabL: number;
  cibleLabA: number;
  cibleLabB: number;
  operateurId?: string;
}

/** Create trial request */
export interface CreateTrialInput {
  projectId: string;
  colorId: string;
  hypothese: string;
  commentaire?: string;
}

/** Create spectro measurements (multi-line) */
export interface CreateSpectroMultiInput {
  projectId: string;
  contexte: MeasureContext;
  lectureNumero: number;
  operateurId?: string;
  measurements: SpectroLineInput[];
}

export interface SpectroLineInput {
  trialId: string;
  lValue: number;
  aValue: number;
  bValue: number;
  // CMJN densities (optional)
  densiteC?: number | null;
  densiteM?: number | null;
  densiteJ?: number | null;
  densiteN?: number | null;
  densiteTd?: number | null;
}

/** Create densito measurements (multi-line) */
export interface CreateDensitoMultiInput {
  projectId: string;
  contexte: MeasureContext;
  operateurId?: string;
  measurements: DensitoLineInput[];
}

export interface DensitoLineInput {
  trialId: string;
  densite: number;
  trapping?: number | null;
  contraste?: number | null;
}

/** Create production controls (multi-color) */
export interface CreateProductionMultiInput {
  projectId: string;
  etapeTirage: ProductionStep;
  controls: ProductionLineInput[];
}

export interface ProductionLineInput {
  colorId?: string;
  conforme: boolean;
  commentaire?: string;
}

/** Validation decision */
export interface CreateValidationInput {
  projectId: string;
  trialId?: string;
  decision: ValidationDecision;
  commentaire?: string;
}

/** Status change */
export interface StatusChangeInput {
  newStatus: ProjectStatus;
}

/** Priority change */
export interface PriorityChangeInput {
  newPriority: Priority;
}

/** Create formulation */
export interface CreateFormulationInput {
  projectId: string;
  trialId: string;
  codeFormule: string;
  commentaire?: string;
  // Process-specific params
  processType: string;
  // Helio
  viscositeCoupe?: number | null;
  coupe?: string | null;
  tauxDilution?: number | null;
  profondeurAlveole?: number | null;
  typeVernis?: string | null;
  tempsSechageHelio?: number | null;
  // Offset
  tack?: number | null;
  finesseBreoyage?: number | null;
  hegman?: number | null;
  sechageType?: string | null;
  resistanceFrottement?: string | null;
  siccativite?: string | null;
  // Items
  items: FormulationItemInput[];
}

export interface FormulationItemInput {
  composant: string;
  codeComposant?: string;
  typeComposant: string;
  poids: number;
  lot?: string;
  fournisseur?: string;
  coutUnitaire?: number;
}

// ================================================================
// UI TYPES
// ================================================================

/** Toast notification */
export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

/** Sidebar navigation item */
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  permission?: string;
  badge?: number;
}

/** Color swatch for UI */
export interface SwatchData {
  poste: number;
  nom: string;
  rgb: string;
  labL: number;
  labA: number;
  labB: number;
}
