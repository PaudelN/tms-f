<script setup lang="ts">
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PanelLeft, PanelRight } from "lucide-vue-next"
import { useSidebar } from "./utils"
import type { HTMLAttributes } from "vue"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar, state } = useSidebar()
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <PanelLeft v-if="state === 'expanded'" class="h-4 w-4" />
    <PanelRight v-else class="h-4 w-4" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>