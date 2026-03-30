<template>
  <div class="flex flex-col h-full min-h-0 bg-background">
    <!-- ── Page Header ──────────────────────────────────────────────────────── -->
    <div class="flex flex-col flex-1 min-h-0 w-full mx-auto p-8">
      <UiHeader
        title="Media Library"
        description="Manage your media assets here. You can upload, organize, and delete media files as needed."
      >
        <template #icon>
          <ImageIcon class="w-6 h-6" />
        </template>
      </UiHeader>
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
  </div>
</template>

<script setup lang="ts">
  import { ImageIcon } from "lucide-vue-next";
  import { useRouter } from "vue-router";

  import UiHeader from "@/components/common/UiHeader.vue";
  import { MediaLibrary } from "@/components/media";
  import type { Media } from "@/stores/media";

  const router = useRouter();

  /**
   * Only called when hardDelete=false (not the case here, but wired up
   * so switching to a detail-route model is a one-line change).
   */
  function navigateToDetail(media: Media): void {
    router.push({ name: "media-detail", params: { id: media.id } });
  }
</script>
