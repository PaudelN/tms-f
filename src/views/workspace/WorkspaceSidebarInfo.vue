<template>
  <div class="space-y-4">
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <Avatar class="h-12 w-12">
            <AvatarFallback>{{ initials }}</AvatarFallback>
          </Avatar>
          <div>
            <p class="font-semibold">{{ workspace?.name ?? 'New workspace' }}</p>
            <Badge variant="secondary" class="mt-1">{{ statusText }}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-sm">Owner</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm text-muted-foreground">
        <p>{{ workspace?.user?.name ?? 'Unassigned' }}</p>
        <p>{{ workspace?.user?.email ?? 'No email available' }}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-sm">Metadata</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">ID</span>
          <span class="font-medium">{{ workspace?.id ?? '-' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Workspace } from '@/stores/workspace'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  workspace?: Workspace | null
  mode: 'add' | 'edit' | 'detail'
}>()

const initials = computed(() => (props.workspace?.name?.charAt(0) || 'W').toUpperCase())

const statusText = computed(() => {
  if (props.mode === 'add') return 'Draft'
  if (props.mode === 'edit') return 'Being edited'
  return props.workspace?.isArchived ? 'Archived' : 'Active'
})

function formatDate(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}
</script>
