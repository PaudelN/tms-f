<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Folder class="w-6 h-6 text-primary" />
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground mb-1">Total</p>
            <p class="text-3xl font-bold text-foreground">{{ totalWorkspaces }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Workspaces</span>
          <span class="text-green-600 font-medium flex items-center gap-1">
            <TrendingUp class="w-3 h-3" />
            12%
          </span>
        </div>
      </div>

      <div class="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
            <CheckCircle2 class="w-6 h-6 text-green-600" />
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground mb-1">Active</p>
            <p class="text-3xl font-bold text-foreground">{{ activeCount }}</p>
          </div>
        </div>
        <Progress
          :model-value="progressPercentage.active"
          class="h-1.5"
          indicator-class="bg-green-500"
        />
      </div>

      <div class="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
            <Archive class="w-6 h-6 text-orange-600" />
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground mb-1">Archived</p>
            <p class="text-3xl font-bold text-foreground">{{ archivedCount }}</p>
          </div>
        </div>
        <Progress
          :model-value="progressPercentage.archived"
          class="h-1.5"
          indicator-class="bg-orange-500"
        />
      </div>

      <div class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 shadow-sm border border-primary/20 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles class="w-6 h-6 text-primary" />
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 bg-primary/20 text-primary rounded-full">
            🏆 MVP
          </span>
        </div>
        <div class="text-sm">
          <p class="text-muted-foreground text-xs mb-1">Top Contributor</p>
          <p class="font-bold text-foreground truncate">{{ topContributor?.name }}</p>
          <p class="text-xs text-muted-foreground mt-1">
            {{ topContributor?.workspaceCount }} workspaces created
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div class="p-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
          <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <Star class="w-4 h-4 text-primary" />
            Pinned Workspaces
          </h3>
          <span class="text-xs text-muted-foreground">{{ pinnedWorkspaces.length }}</span>
        </div>
        <div class="p-4 max-h-72 overflow-y-auto">
          <div v-if="pinnedWorkspaces.length === 0" class="text-center py-8">
            <Star class="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p class="text-xs text-muted-foreground">No pinned workspaces yet</p>
          </div>
          <div class="space-y-2">
            <div
              v-for="workspace in pinnedWorkspaces"
              :key="workspace.id"
              class="p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer group"
              @click="emit('view', workspace.id)"
            >
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-primary text-sm font-bold">{{ workspace.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground truncate">{{ workspace.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(workspace.created_at) }}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  @click.stop="emit('togglePin', workspace.id)"
                >
                  <Star class="w-4 h-4 text-primary" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div class="p-5 border-b border-border bg-gradient-to-r from-green-500/5 to-transparent flex items-center justify-between">
          <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock class="w-4 h-4 text-green-600" />
            Recent Activity
          </h3>
        </div>
        <div class="p-4 max-h-72 overflow-y-auto">
          <div class="space-y-3">
            <div
              v-for="activity in teamActivities.slice(0, 5)"
              :key="activity.id"
              class="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary text-xs font-semibold">
                {{ activity.user.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-foreground">
                  <span class="font-medium">{{ activity.user }}</span>
                  <span class="text-muted-foreground"> {{ activity.action }}</span>
                </p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ getRelativeTime(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div class="p-5 border-b border-border bg-gradient-to-r from-orange-500/5 to-transparent">
          <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 class="w-4 h-4 text-orange-600" />
            Activity Overview
          </h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-muted-foreground">Most Active</span>
                <span class="text-xs font-semibold text-foreground">47 activities</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <span class="text-orange-600 text-xs font-bold">M</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground truncate">Marketing Campaign 2024</p>
                  <p class="text-xs text-muted-foreground">Last updated 2h ago</p>
                </div>
                <span class="text-lg">🔥</span>
              </div>
            </div>

            <div class="pt-3 border-t border-border">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-muted-foreground">Files Uploaded Today</span>
                <span class="text-xs font-semibold text-foreground">{{ recentFiles.length }}</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="file in recentFiles.slice(0, 2)"
                  :key="file.id"
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <div :class="file.iconBg" class="h-7 w-7 rounded flex items-center justify-center flex-shrink-0">
                    <component :is="file.icon" class="w-3.5 h-3.5" :class="file.iconColor" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-foreground truncate">{{ file.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ file.size }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-border">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-muted-foreground">Next Event</span>
                <span class="text-xs font-medium text-primary">{{ formatEventDate(upcomingEvents[0]?.date) }}</span>
              </div>
              <div v-if="upcomingEvents[0]" class="p-2 rounded-lg bg-primary/5 border-l-2 border-primary">
                <p class="text-sm font-medium text-foreground">{{ upcomingEvents[0].title }}</p>
                <p class="text-xs text-muted-foreground">{{ upcomingEvents[0].workspace }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Archive,
  BarChart3,
  CheckCircle2,
  Clock,
  Folder,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-vue-next";
import type { Workspace } from "@/stores/workspace";

type TopContributor = {
  name: string;
  workspaceCount: number;
};

type ProgressPercentage = {
  active: number;
  archived: number;
};

type TeamActivity = {
  id: number;
  user: string;
  action: string;
  timestamp: Date;
};

type RecentFile = {
  id: number;
  name: string;
  size: string;
  iconBg: string;
  iconColor: string;
  icon: any;
};

type UpcomingEvent = {
  id: number;
  title: string;
  workspace: string;
  date: Date;
};

defineProps<{
  totalWorkspaces: number;
  activeCount: number;
  archivedCount: number;
  progressPercentage: ProgressPercentage;
  topContributor: TopContributor | null;
  pinnedWorkspaces: Workspace[];
  teamActivities: TeamActivity[];
  recentFiles: RecentFile[];
  upcomingEvents: UpcomingEvent[];
  formatDate: (value: string) => string;
  formatEventDate: (value: Date | undefined) => string;
  getRelativeTime: (value: Date) => string;
}>();

const emit = defineEmits<{
  (e: "view", id: number): void;
  (e: "togglePin", id: number): void;
}>();
</script>
