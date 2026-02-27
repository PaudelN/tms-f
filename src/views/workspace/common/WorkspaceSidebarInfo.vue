<template>
  <Card class="border-dashed">
    <CardHeader class="pb-3">
      <CardTitle class="text-base">Workspace Profile</CardTitle>
      <CardDescription>Context and quick actions</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4 text-sm">
      <div class="flex items-center gap-3">
        <Avatar class="h-10 w-10">
          <AvatarFallback>{{ initials }}</AvatarFallback>
        </Avatar>
        <div>
          <p class="font-medium">{{ workspace?.name || "New workspace" }}</p>
          <Badge variant="outline">{{ workspace ? `#${workspace.id}` : "Draft" }}</Badge>
        </div>
      </div>

      <div class="rounded-lg border p-3 space-y-2">
        <div class="flex justify-between"><span class="text-muted-foreground">Owner</span><span>{{ workspace?.user?.name || "Unassigned" }}</span></div>
        <div class="flex justify-between"><span class="text-muted-foreground">Created</span><span>{{ formatDate(workspace?.created_at) }}</span></div>
        <div class="flex justify-between"><span class="text-muted-foreground">Updated</span><span>{{ formatDate(workspace?.updated_at) }}</span></div>
      </div>

      <slot />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Workspace } from "@/stores/workspace";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const props = defineProps<{ workspace?: Workspace | null }>();

const initials = computed(() => (props.workspace?.name?.[0] || "W").toUpperCase());

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
</script>
