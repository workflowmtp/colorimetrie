// ================================================================
// COLORLAB PRO — CONSTANTES METIER
// ================================================================

import type { ProcessType, SupportType, MeasureContext } from "@prisma/client";

// ================================================================
// PROCEDES
// ================================================================

export interface ProcessInfo {
  id: ProcessType;
  nom: string;
  type: "offset" | "helio" | "metal";
}

export const PROCESSES: ProcessInfo[] = [
  { id: "offset_papier",  nom: "Offset Papier/Carton", type: "offset" },
  { id: "heliogravure",   nom: "Heliogravure",         type: "helio" },
  { id: "offset_metal",   nom: "Offset Metal ETP/TFS", type: "metal" },
];

export function getProcessLabel(id: string): string {
  return PROCESSES.find((p) => p.id === id)?.nom ?? id;
}

export function isHelio(processId: string): boolean {
  return processId === "heliogravure";
}

export function isOffset(processId: string): boolean {
  return processId === "offset_papier" || processId === "offset_metal";
}

export function isMetal(processId: string): boolean {
  return processId === "offset_metal";
}

// ================================================================
// SUPPORTS
// ================================================================

export interface SupportInfo {
  id: SupportType;
  type: "papier" | "carton" | "flexible" | "metal";
  label: string;
}

export const SUPPORTS: SupportInfo[] = [
  { id: "papier_couche",     type: "papier",   label: "Papier couche" },
  { id: "papier_non_couche", type: "papier",   label: "Papier non couche" },
  { id: "carton",            type: "carton",   label: "Carton" },
  { id: "carton_couche",     type: "carton",   label: "Carton couche" },
  { id: "carton_metallise",  type: "carton",   label: "Carton metallise" },
  { id: "pet",               type: "flexible", label: "PET" },
  { id: "bopp",              type: "flexible", label: "BOPP" },
  { id: "cpp",               type: "flexible", label: "CPP" },
  { id: "papier_helio",      type: "flexible", label: "Papier (helio)" },
  { id: "aluminium",         type: "flexible", label: "Aluminium" },
  { id: "complexe",          type: "flexible", label: "Complexe" },
  { id: "etp",               type: "metal",    label: "ETP (Fer blanc)" },
  { id: "tfs",               type: "metal",    label: "TFS (Fer chrome)" },
];

export function getSupportLabel(id: string): string {
  return SUPPORTS.find((s) => s.id === id)?.label ?? id;
}

// ================================================================
// TYPES DE COMPOSANTS (formulation offset vs helio)
// ================================================================

export interface CompTypeInfo {
  value: string;
  label: string;
}

export const COMP_TYPES_HELIO: CompTypeInfo[] = [
  { value: "pigment",          label: "Pigment" },
  { value: "vernis_nc",        label: "Vernis NC" },
  { value: "vernis_pu",        label: "Vernis PU" },
  { value: "solvant",          label: "Solvant" },
  { value: "retardateur",      label: "Retardateur" },
  { value: "anti_mousse",      label: "Anti-mousse" },
  { value: "agent_glissement", label: "Agent glissement" },
  { value: "additif",          label: "Autre additif" },
];

export const COMP_TYPES_OFFSET: CompTypeInfo[] = [
  { value: "pigment",        label: "Pigment (pate)" },
  { value: "vernis_offset",  label: "Vernis offset" },
  { value: "base",           label: "Base/Extender" },
  { value: "siccatif",       label: "Siccatif" },
  { value: "anti_maculage",  label: "Anti-maculage" },
  { value: "anti_peau",      label: "Anti-peau" },
  { value: "additif",        label: "Autre additif" },
];

export function getCompTypes(processId: string): CompTypeInfo[] {
  return processId === "heliogravure" ? COMP_TYPES_HELIO : COMP_TYPES_OFFSET;
}

/**
 * Component type badge colors (for UI)
 */
export const COMP_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  pigment:          { bg: "rgba(139,92,246,0.15)",  text: "#8B5CF6" },
  base:             { bg: "rgba(59,130,246,0.15)",   text: "#3B82F6" },
  vernis_offset:    { bg: "rgba(16,185,129,0.15)",   text: "#10B981" },
  vernis_nc:        { bg: "rgba(16,185,129,0.15)",   text: "#10B981" },
  vernis_pu:        { bg: "rgba(20,184,166,0.15)",   text: "#14B8A6" },
  solvant:          { bg: "rgba(6,182,212,0.15)",    text: "#06B6D4" },
  siccatif:         { bg: "rgba(249,115,22,0.15)",   text: "#F97316" },
  anti_maculage:    { bg: "rgba(168,85,247,0.15)",   text: "#A855F7" },
  anti_peau:        { bg: "rgba(236,72,153,0.15)",   text: "#EC4899" },
  retardateur:      { bg: "rgba(249,115,22,0.15)",   text: "#F97316" },
  anti_mousse:      { bg: "rgba(236,72,153,0.15)",   text: "#EC4899" },
  agent_glissement: { bg: "rgba(234,179,8,0.15)",    text: "#EAB308" },
  additif:          { bg: "rgba(245,158,11,0.15)",   text: "#F59E0B" },
};

// ================================================================
// CONTEXTES DE MESURE
// ================================================================

export const MEASURE_CONTEXTS: { value: MeasureContext; label: string }[] = [
  { value: "essai",           label: "Essai" },
  { value: "avant_cuisson",   label: "Avant cuisson" },
  { value: "apres_cuisson",   label: "Apres cuisson" },
  { value: "production",      label: "Production" },
  { value: "controle_final",  label: "Controle final" },
];

export const CONTEXT_COLORS: Record<string, { bg: string; text: string }> = {
  essai:          { bg: "rgba(59,130,246,0.15)",   text: "#3B82F6" },
  avant_cuisson:  { bg: "rgba(245,158,11,0.15)",   text: "#F59E0B" },
  apres_cuisson:  { bg: "rgba(249,115,22,0.15)",   text: "#F97316" },
  production:     { bg: "rgba(16,185,129,0.15)",   text: "#10B981" },
  controle_final: { bg: "rgba(139,92,246,0.15)",   text: "#8B5CF6" },
};

// ================================================================
// SPECTRAL WAVELENGTHS
// ================================================================

export const REFLECTANCE_NM = [400, 450, 500, 550, 600, 650, 700] as const;

export const NM_COLORS: Record<number, string> = {
  400: "#7B1FA2", // violet
  450: "#3F51B5", // indigo
  500: "#0097A7", // teal
  550: "#388E3C", // green
  600: "#FBC02D", // yellow
  650: "#F57C00", // orange
  700: "#D32F2F", // red
};

// ================================================================
// PRIORITIES
// ================================================================

export const PRIORITY_META = {
  normale:  { label: "Normale",  icon: "⚪", color: "#94A3B8" },
  haute:    { label: "Haute",    icon: "🔸", color: "#F97316" },
  urgente:  { label: "Urgente",  icon: "⚠️",  color: "#EF4444" },
} as const;

// ================================================================
// CMJN DENSITY CARD COLORS (for UI)
// ================================================================

export const CMJN_CARD_COLORS = {
  cyan:    { bg: "#0097A7", label: "Cyan" },
  magenta: { bg: "#C2185B", label: "Magenta" },
  jaune:   { bg: "#F9A825", label: "Jaune" },
  noir:    { bg: "#37474F", label: "Noir" },
} as const;
