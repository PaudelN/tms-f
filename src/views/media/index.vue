<template>
  <div class="flex flex-col h-full min-h-0 bg-background">
    <!-- ── Page Header ──────────────────────────────────────────────────────── -->
    <div
      class="flex items-center justify-between px-6 py-4 shrink-0 border-b border-border/40"
    >
      <div class="flex items-center gap-3">
        <div
          class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"
        >
          <ImageIcon class="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 class="text-[14px] font-semibold text-foreground leading-tight">
            Media Library
          </h1>
          <p class="text-[11px] text-muted-foreground leading-tight mt-0.5">
            All uploaded files across your workspace
          </p>
        </div>
      </div>
    </div>

    <!-- ── Body ───────────────────────────────────────────────────────────── -->
    <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5">
      <!--
        hardDelete=true  → clicking a card opens the detail modal inline
                           (appropriate for the standalone global library page
                           where there's no model to detach from).

        @view            → emitted when hardDelete=false (not used here).
                           In a model-scoped context you'd pass hardDelete=false
                           and handle @view to navigate to a detail route.
      -->
      <MediaLibrary :hard-delete="true" @view="navigateToDetail" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ImageIcon } from "lucide-vue-next";
  import { useRouter } from "vue-router";

  import type { Media } from "@/stores/media";
import { MediaLibrary } from "@/components/media";

  const router = useRouter();

  /**
   * Only called when hardDelete=false (not the case here, but wired up
   * so switching to a detail-route model is a one-line change).
   */
  function navigateToDetail(media: Media): void {
    router.push({ name: "media-detail", params: { id: media.id } });
  }
</script>
