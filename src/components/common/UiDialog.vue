<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent
      :class="[
        'ui-dialog-shell fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden border bg-background p-0 shadow-2xl duration-200',
        sizeClass,
      ]"
      :show-close="false"
    >
      <div class="flex h-full min-h-0 flex-col">
        <div class="border-b bg-muted/30 px-5 py-3">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="truncate text-lg font-semibold">{{ title }}</h2>
                <Badge :class="modeBadgeClass">{{ modeLabel }}</Badge>
              </div>
              <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <slot name="header-actions" />
              <Button variant="outline" size="sm" class="gap-2" @click="goFullscreen">
                <Expand class="h-4 w-4" />
                Full screen
              </Button>
              <Button variant="ghost" size="icon" @click="sidebarCollapsed = !sidebarCollapsed">
                <PanelLeftClose v-if="!sidebarCollapsed" class="h-4 w-4" />
                <PanelLeftOpen v-else class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="emit('update:open', false)">
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal" class="min-h-0 flex-1">
          <ResizablePanel v-if="!sidebarCollapsed" :default-size="28" :min-size="20" :max-size="35" class="min-w-[220px] border-r bg-muted/20">
            <div class="h-full overflow-auto p-4">
              <slot name="sidebar">
                <component
                  :is="sidebarComponent"
                  v-if="sidebarComponent"
                  v-bind="resolvedSidebarProps"
                />
              </slot>
            </div>
          </ResizablePanel>
          <ResizableHandle v-if="!sidebarCollapsed" with-handle />
          <ResizablePanel :default-size="sidebarCollapsed ? 100 : 72" class="min-w-0">
            <div class="flex h-full min-h-0 flex-col">
              <div class="flex-1 overflow-auto p-5">
                <slot>
                  <component :is="component" v-if="component" v-bind="resolvedComponentProps" />
                </slot>
              </div>
              <div v-if="$slots.footer" class="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur">
                <slot name="footer" />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Expand, PanelLeftClose, PanelLeftOpen, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import '@/assets/ui-dialog.css'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'add' | 'edit' | 'detail'
    title: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    fullscreenRoute?: { name: string; params?: Record<string, string | number> }
    component?: unknown
    componentProps?: Record<string, unknown>
    sidebarComponent?: unknown
    sidebarProps?: Record<string, unknown>
  }>(),
  {
    size: 'xl',
    componentProps: () => ({}),
    sidebarProps: () => ({}),
  },
)

const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

const router = useRouter()
const sidebarCollapsed = ref(false)

const modeLabel = computed(() => {
  if (props.mode === 'add') return 'New'
  if (props.mode === 'edit') return 'Editing'
  return 'Viewing'
})

const modeBadgeClass = computed(() => {
  if (props.mode === 'add') return 'bg-emerald-500/15 text-emerald-600'
  if (props.mode === 'edit') return 'bg-amber-500/15 text-amber-600'
  return 'bg-blue-500/15 text-blue-600'
})

const sizeClass = computed(() => {
  const map = {
    sm: 'max-w-2xl h-[70vh]',
    md: 'max-w-4xl h-[78vh]',
    lg: 'max-w-5xl h-[82vh]',
    xl: 'max-w-6xl h-[86vh]',
    full: 'max-w-[98vw] h-[95vh]',
  }
  return map[props.size]
})

const resolvedComponentProps = computed(() => ({ ...props.componentProps, inDialog: true }))
const resolvedSidebarProps = computed(() => ({ ...props.sidebarProps }))

function goFullscreen() {
  if (!props.fullscreenRoute) return
  emit('update:open', false)
  router.push(props.fullscreenRoute)
}

function onOpenChange(value: boolean) {
  emit('update:open', value)
}
</script>
