// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

// Future: Workspace Types
export interface Workspace {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

// Future: Project Types
export interface Project {
  id: number;
  workspace_id: number;
  name: string;
  description?: string;
  status: "active" | "archived" | "on-hold";
  created_at: string;
  updated_at: string;
}

// Future: Pipeline Types
export interface Pipeline {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// Future: Pipeline Stage Types
export interface PipelineStage {
  id: number;
  pipeline_id: number;
  name: string;
  color: string;
  order: number;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}

// Future: Task Types
export interface Task {
  id: number;
  pipeline_stage_id: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to?: number;
  due_date?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// Form State Types
export interface FormErrors {
  [key: string]: string[];
}

// Table Column Type
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}
