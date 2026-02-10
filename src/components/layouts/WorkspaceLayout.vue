<script setup lang="ts">
import WorkspaceSidebar from '@/components/workspace/WorkspaceSidebar.vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileNavOpen = ref(false)

// Keep a small contextual title for the content area.
const sectionTitle = computed(() => {
  const titles: Record<string, string> = {
    'workspace-overview': 'Overview',
    'workspace-work': 'Work',
    'workspace-activity': 'Activity',
    'workspace-files': 'Files',
    'workspace-members': 'Members',
    'workspace-analytics': 'Analytics',
    'workspace-settings': 'Settings',
    'workspace-access': 'Access',
  }

  return titles[String(route.name)] ?? 'Workspace'
})
</script>

<template>
  <!--
    Workspace detail shell:
    - Desktop: static left sidebar + content pane.
    - Mobile/tablet: sidebar is moved into a sheet toggled by a burger button.
  -->
  <div class="min-h-full">
    <div class="mx-auto grid max-w-7xl gap-6 p-4 md:p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <!-- Desktop sidebar -->
      <aside class="hidden rounded-xl border bg-card p-3 lg:block">
        <WorkspaceSidebar />
      </aside>

      <!-- Main content area with nested route outlet -->
      <section class="min-w-0 rounded-xl border bg-card p-4 md:p-6">
        <header class="mb-4 flex items-center gap-3 border-b pb-4 lg:mb-6">
          <!-- Mobile burger button -->
          <Button
            variant="outline"
            size="icon"
            class="lg:hidden"
            @click="mobileNavOpen = true"
          >
            <Menu class="h-4 w-4" />
            <span class="sr-only">Open workspace menu</span>
          </Button>

          <h1 class="text-lg font-semibold tracking-tight">{{ sectionTitle }}</h1>
        </header>

        <!-- Child section content is rendered here via nested router config. -->
        <RouterView />
      </section>
    </div>

    <!-- Mobile/tablet sidebar drawer -->
    <Sheet v-model:open="mobileNavOpen">
      <SheetContent side="left" class="w-[280px] p-0">
        <SheetHeader class="border-b p-4 text-left">
          <SheetTitle>Workspace navigation</SheetTitle>
          <SheetDescription>Switch between workspace sections.</SheetDescription>
        </SheetHeader>

        <div class="p-3">
          <WorkspaceSidebar @navigate="mobileNavOpen = false" />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
