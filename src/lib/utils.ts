// ================================================================
// COLORLAB PRO — UTILITAIRES GENERIQUES
// ================================================================

/**
 * Round a number to N decimal places
 */
export function round(val: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format datetime as DD/MM/YYYY HH:mm
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (il y a X jours)
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

  if (diff < 1) return "A l'instant";
  if (diff < 60) return `Il y a ${diff}min`;
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
  if (diff < 43200) return `Il y a ${Math.floor(diff / 1440)}j`;
  return formatDate(d);
}

/**
 * Generate unique code with prefix (CLR-10XXX, F-XXXX, etc.)
 */
export function generateCode(prefix: string): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${num}`;
}

/**
 * Generate sequential dossier code
 */
export function generateDossierCode(lastCode?: string): string {
  if (!lastCode) return "CLR-10001";
  const match = lastCode.match(/CLR-(\d+)/);
  if (!match) return "CLR-10001";
  const next = parseInt(match[1]) + 1;
  return `CLR-${next}`;
}

/**
 * Escape HTML characters
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + "...";
}

/**
 * Format number as FCFA currency
 */
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA";
}

/**
 * Format weight in grams
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) return round(grams / 1000, 2) + " kg";
  return round(grams, 1) + " g";
}

/**
 * Clamp a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * cn() — classnames utility (tailwind-merge compatible)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Check if a drift alert should be raised
 * (3 or more consecutive NC production controls for a project)
 */
export function checkDriftAlert(
  controls: Array<{ conforme: boolean; dateControle: Date | string }>
): boolean {
  if (controls.length < 3) return false;
  const sorted = [...controls].sort(
    (a, b) =>
      new Date(b.dateControle).getTime() - new Date(a.dateControle).getTime()
  );
  // Check last 3
  return !sorted[0].conforme && !sorted[1].conforme && !sorted[2].conforme;
}

/**
 * Deep equal comparison for objects
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
