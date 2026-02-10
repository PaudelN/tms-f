import {
  BarChart3,
  ClipboardList,
  Clock3,
  Columns3,
  FileText,
  FolderTree,
  GalleryHorizontalEnd,
  GalleryVertical,
  LayoutDashboard,
  Settings,
} from "lucide-vue-next";

export interface AppNavigationItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const appNavigation: AppNavigationItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Work Space", icon: GalleryVertical, href: "/workspace" },
  { name: "Project", icon: FolderTree, href: "/projects" },
  { name: "Board", icon: Columns3, href: "/pipeline" },
  { name: "Board Stage", icon: GalleryHorizontalEnd, href: "/pipeline-stage" },
  { name: "Task", icon: ClipboardList, href: "/tasks" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Timesheets", icon: Clock3, href: "/timesheets" },
  { name: "Report", icon: FileText, href: "/report" },
  { name: "Settings", icon: Settings, href: "/settings" },
];
