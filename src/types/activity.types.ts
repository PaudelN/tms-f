export interface ActivityCauser {
  id: number;
  name: string;
  avatar: string | null;
}

export interface ActivityItem {
  id: number;
  event: string;
  category: string;
  label: string;
  description: string;
  causer: ActivityCauser | null;
  properties: Record<string, unknown>;
  created_at: string;
  time_ago: string;
  date_label: string;
}

export interface ActivityPaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export type ActivityCategory =
  | "all"
  | "lifecycle"
  | "assignment"
  | "priority"
  | "status";

export const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string }[] =
  [
    { value: "all", label: "All" },
    // { value: "lifecycle", label: "Lifecycle" },
    // { value: "assignment", label: "Assignment" },
    // { value: "priority", label: "Priority" },
    // { value: "status", label: "Status" },
  ];

export const CATEGORY_COLORS: Record<string, string> = {
  lifecycle: "rgb(var(--color-primary))",
  kanban_card: "#10b981",
  kanban_stage: "#06b6d4",
  assignment: "#f59e0b",
  priority: "#ef4444",
  due_date: "#8b5cf6",
  status: "#6366f1",
  other: "#94a3b8",
};
