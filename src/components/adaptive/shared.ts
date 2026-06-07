/** Map a 0-100 mastery value to a semantic color class. */
export function masteryColorClass(mastery: number): string {
  if (mastery >= 80) return 'bg-success';
  if (mastery >= 50) return 'bg-warning';
  return 'bg-destructive';
}

export function masteryTextClass(mastery: number): string {
  if (mastery >= 80) return 'text-success';
  if (mastery >= 50) return 'text-warning';
  return 'text-destructive';
}

export function masteryBorderClass(mastery: number): string {
  if (mastery >= 80) return 'border-success/40';
  if (mastery >= 50) return 'border-warning/40';
  return 'border-destructive/40';
}

export function masteryBgClass(mastery: number): string {
  if (mastery >= 80) return 'bg-success/15';
  if (mastery >= 50) return 'bg-warning/15';
  return 'bg-destructive/15';
}

/** OKLCH-based gradient stop for a mastery value (for SVG gradients / CSS). */
export function masteryGradientStops(mastery: number): [string, string] {
  if (mastery >= 80) return ['oklch(0.72 0.16 162)', 'oklch(0.65 0.14 150)'];
  if (mastery >= 50) return ['oklch(0.82 0.16 80)', 'oklch(0.75 0.14 70)'];
  return ['oklch(0.64 0.21 25)', 'oklch(0.58 0.18 20)'];
}

/** Clamp number between min and max. */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Accessible label builder. */
export function nodeAriaLabel(name: string, mastery: number): string {
  return `${name}, mastery ${Math.round(mastery)} percent`;
}
