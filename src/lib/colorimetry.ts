// ================================================================
// COLORLAB PRO — MOTEUR COLORIMETRIQUE
// deltaE CIE76, deltaE CIE2000, LAB → RGB, score de proximite
// ================================================================

/**
 * ΔE CIE76 (euclidean distance in L*a*b*)
 */
export function deltaE76(
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number
): number {
  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;
  return round(Math.sqrt(dL * dL + da * da + db * db), 2);
}

/**
 * ΔE CIE2000 (perceptually uniform)
 * Reference: Sharma, Wu, Dalal (2005)
 */
export function deltaE2000(
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number
): number {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cmean = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cmean, 7) / (Math.pow(Cmean, 7) + Math.pow(25, 7))));
  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p) * deg;
  if (h1p < 0) h1p += 360;
  let h2p = Math.atan2(b2, a2p) * deg;
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);

  const Lp = (L1 + L2) / 2;
  const Cp = (C1p + C2p) / 2;

  let hp: number;
  if (C1p * C2p === 0) {
    hp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hp = (h1p + h2p + 360) / 2;
  } else {
    hp = (h1p + h2p - 360) / 2;
  }

  const T = 1
    - 0.17 * Math.cos((hp - 30) * rad)
    + 0.24 * Math.cos(2 * hp * rad)
    + 0.32 * Math.cos((3 * hp + 6) * rad)
    - 0.20 * Math.cos((4 * hp - 63) * rad);

  const SL = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
  const SC = 1 + 0.045 * Cp;
  const SH = 1 + 0.015 * Cp * T;

  const RT =
    -2 *
    Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7))) *
    Math.sin(60 * Math.exp(-Math.pow((hp - 275) / 25, 2)) * rad);

  const result = Math.sqrt(
    Math.pow(dLp / SL, 2) +
    Math.pow(dCp / SC, 2) +
    Math.pow(dHp / SH, 2) +
    RT * (dCp / SC) * (dHp / SH)
  );

  return round(result, 2);
}

/**
 * Convert CIE L*a*b* to sRGB hex string
 */
export function labToRgb(L: number, a: number, b: number): string {
  // Lab → XYZ (D65)
  let y = (L + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const f = (t: number) => (t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787);
  x = 0.95047 * f(x);
  y = 1.0 * f(y);
  z = 1.08883 * f(z);

  // XYZ → sRGB
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let bv = x * 0.0557 + y * -0.204 + z * 1.057;

  const gamma = (c: number) => (c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c);
  r = Math.round(Math.max(0, Math.min(1, gamma(r))) * 255);
  g = Math.round(Math.max(0, Math.min(1, gamma(g))) * 255);
  bv = Math.round(Math.max(0, Math.min(1, gamma(bv))) * 255);

  return "#" + [r, g, bv].map((c) => c.toString(16).padStart(2, "0")).join("");
}

/**
 * Proximity score (0-100%) based on ΔE
 */
export function proximityScore(dE: number): number {
  if (dE <= 0) return 100;
  if (dE >= 10) return 0;
  return round(Math.max(0, 100 - dE * 10), 0);
}

/**
 * Human-readable ΔE interpretation
 */
export function deltaELabel(dE: number): string {
  if (dE <= 0.5) return "Excellent";
  if (dE <= 1.0) return "Tres bon";
  if (dE <= 2.0) return "Bon";
  if (dE <= 3.0) return "Acceptable";
  if (dE <= 5.0) return "Perceptible";
  return "Hors tolerance";
}

/**
 * Compute average L*a*b* from multiple measurements
 */
export function averageLab(
  measurements: Array<{ L: number; a: number; b: number }>
): { L: number; a: number; b: number } {
  if (measurements.length === 0) return { L: 0, a: 0, b: 0 };
  const sum = measurements.reduce(
    (acc, m) => ({ L: acc.L + m.L, a: acc.a + m.a, b: acc.b + m.b }),
    { L: 0, a: 0, b: 0 }
  );
  return {
    L: round(sum.L / measurements.length, 2),
    a: round(sum.a / measurements.length, 2),
    b: round(sum.b / measurements.length, 2),
  };
}

/**
 * Compute C* (chroma) from a* and b*
 */
export function chroma(a: number, b: number): number {
  return round(Math.sqrt(a * a + b * b), 2);
}

/**
 * Compute h° (hue angle) from a* and b*
 */
export function hueAngle(a: number, b: number): number {
  return round(((Math.atan2(b, a) * 180) / Math.PI + 360) % 360, 1);
}

// Utility
function round(val: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}
