<template>
  <div class="space-y-4 p-4">
    <Card class="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <Avatar class="h-12 w-12 border">
            <AvatarFallback class="bg-primary/10 text-primary font-semibold">
              {{ initials }}
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0">
            <p class="font-semibold truncate">{{ workspace?.name ?? "New Workspace" }}</p>
            <Badge :variant="workspace?.isArchived ? 'secondary' : 'default'" class="mt-1">
              {{ workspace?.isArchived ? "Archived" : "Active" }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-sm">Owner</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p class="font-medium">{{ workspace?.user?.name ?? "Unassigned" }}</p>
        <p class="text-muted-foreground break-all">{{ workspace?.user?.email ?? "No email" }}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-sm">Metadata</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">ID</span>
          <span class="font-medium">{{ workspace?.id ?? "Draft" }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Created</span>
          <span class="font-medium">{{ formatDate(workspace?.created_at) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Updated</span>
          <span class="font-medium">{{ formatDate(workspace?.updated_at) }}</span>
        </div>
      </CardContent>
    </Card>

    <slot name="quick-actions" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { Workspace } from "@/stores/workspace";
  import { Avatar, AvatarFallback } from "@/components/ui/avatar";
  import { Badge } from "@/components/ui/badge";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

  const props = defineProps<{ workspace?: Workspace | null }>();

  const initials = computed(() => (props.workspace?.name?.charAt(0) || "W").toUpperCase());

  function formatDate(value?: string) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>
