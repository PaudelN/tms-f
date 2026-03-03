const TAILWIND_COLORS: Record<string, string> = {
  "bg-emerald-500": "#10b981",
  "bg-emerald-400": "#34d399",
  "bg-rose-400": "#fb7185",
  "bg-rose-500": "#f43f5e",
  "bg-amber-400": "#fbbf24",
  "bg-amber-500": "#f59e0b",
  "bg-orange-400": "#fb923c",
  "bg-orange-500": "#f97316",
  "bg-blue-400": "#60a5fa",
  "bg-blue-500": "#3b82f6",
  "bg-violet-400": "#a78bfa",
  "bg-violet-500": "#8b5cf6",
  "bg-slate-400": "#94a3b8",
  "bg-gray-400": "#9ca3af",
};

export function useDotColor() {
  function getDotColor(dotClass: string): string {
    if (!dotClass) return "#8b5cf6";
    if (dotClass.startsWith("#") || dotClass.startsWith("rgb")) return dotClass;
    return TAILWIND_COLORS[dotClass] ?? "#8b5cf6";
  }

  return { getDotColor };
}
