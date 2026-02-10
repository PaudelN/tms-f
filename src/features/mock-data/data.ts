export interface ClientRecord extends Record<string, unknown> { id: number; name: string; tier: "Enterprise" | "Growth" | "Starter"; owner: string; }
export interface ReportRecord extends Record<string, unknown> { id: number; title: string; status: "Draft" | "Published"; period: string; }

export const clients: ClientRecord[] = [
  { id: 1, name: "Northwind Labs", tier: "Enterprise", owner: "Emma" },
  { id: 2, name: "Vertex Ops", tier: "Growth", owner: "Noah" },
  { id: 3, name: "Oceanic Inc", tier: "Starter", owner: "Ava" },
];

export const reports: ReportRecord[] = [
  { id: 1, title: "Velocity Overview", status: "Published", period: "Q1 2026" },
  { id: 2, title: "Risk Heatmap", status: "Draft", period: "Q1 2026" },
  { id: 3, title: "Delivery Forecast", status: "Published", period: "Q4 2025" },
];
