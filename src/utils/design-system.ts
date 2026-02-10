export const clayShadows = {
  sm: "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_1px_1px_rgba(15,23,42,0.04)]",
  md: "shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.06)]",
  lg: "shadow-[0_12px_32px_rgba(15,23,42,0.12),0_4px_10px_rgba(15,23,42,0.08)]",
};

export const radiusTokens = {
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
};

export const spacingTokens = {
  xxs: "space-y-1",
  xs: "space-y-2",
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

export function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatMetric(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

export function compareValues(a: unknown, b: unknown): number {
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}
