<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card class="hover:shadow-md transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted-foreground mb-1">Total</p>
              <p class="text-3xl font-bold text-foreground">{{ totalWorkspaces }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Workspaces</span>
            <Badge variant="secondary" class="gap-1 text-emerald-600">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              12%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-md transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted-foreground mb-1">Active</p>
              <p class="text-3xl font-bold text-foreground">{{ activeCount }}</p>
            </div>
          </div>
          <div class="w-full bg-muted rounded-full h-1.5">
            <div
              class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              :style="{ width: `${progressPercentage.active}%` }"
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-md transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted-foreground mb-1">Archived</p>
              <p class="text-3xl font-bold text-foreground">{{ archivedCount }}</p>
            </div>
          </div>
          <div class="w-full bg-muted rounded-full h-1.5">
            <div
              class="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
              :style="{ width: `${progressPercentage.archived}%` }"
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:shadow-md transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <Badge variant="secondary" class="text-primary bg-primary/20">🏆 MVP</Badge>
          </div>
          <div class="text-sm">
            <p class="text-muted-foreground text-xs mb-1">Top Contributor</p>
            <p class="font-bold text-foreground truncate">{{ topContributor?.name }}</p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ topContributor?.workspaceCount }} workspaces created
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card class="overflow-hidden">
        <CardHeader class="p-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle class="text-sm font-semibold flex items-center gap-2">
            <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Pinned Workspaces
          </CardTitle>
          <Badge variant="secondary">{{ pinnedWorkspaces.length }}</Badge>
        </CardHeader>
        <CardContent class="p-4 max-h-72 overflow-y-auto">
          <div v-if="pinnedWorkspaces.length === 0" class="text-center py-8">
            <svg class="w-10 h-10 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
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
                <Button variant="ghost" size="icon" class="opacity-0 group-hover:opacity-100" @click.stop="emit('togglePin', workspace.id)">
                  <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="overflow-hidden">
        <CardHeader class="p-5 border-b border-border bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardTitle class="text-sm font-semibold flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent class="p-4 max-h-72 overflow-y-auto">
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
        </CardContent>
      </Card>

      <Card class="overflow-hidden">
        <CardHeader class="p-5 border-b border-border bg-gradient-to-r from-orange-500/5 to-transparent">
          <CardTitle class="text-sm font-semibold flex items-center gap-2">
            <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent class="p-4">
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-muted-foreground">Most Active</span>
                <Badge variant="secondary">47 activities</Badge>
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
                <Badge variant="secondary">{{ recentFiles.length }}</Badge>
              </div>
              <div class="space-y-2">
                <div
                  v-for="file in recentFiles.slice(0, 2)"
                  :key="file.id"
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <div :class="file.iconBg" class="h-7 w-7 rounded flex items-center justify-center flex-shrink-0">
                    <svg class="w-3.5 h-3.5" :class="file.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="file.iconPath" />
                    </svg>
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
                <Badge variant="secondary" class="text-primary">{{ formatEventDate(upcomingEvents[0]?.date) }}</Badge>
              </div>
              <div v-if="upcomingEvents[0]" class="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p class="text-sm font-medium text-foreground">{{ upcomingEvents[0].title }}</p>
                <p class="text-xs text-muted-foreground">{{ upcomingEvents[0].workspace }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  iconPath: string;
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
