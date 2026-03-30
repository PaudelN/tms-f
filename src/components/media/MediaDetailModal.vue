<template>
  <Dialog :open="!!item" @update:open="(v) => !v && emit('close')">
    <DialogContent class="sm:max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl">
      <div class="flex h-full max-h-[85vh]">
        <!-- Preview pane -->
        <div
          class="flex-1 bg-muted/50 flex items-center justify-center overflow-hidden min-h-64 relative"
        >
          <!-- Image -->
          <img
            v-if="item?.aggregate_type === 'image'"
            :src="item.url"
            :alt="item.alt ?? ''"
            class="max-w-full max-h-full object-contain p-4"
          />

          <!-- Video -->
          <video
            v-else-if="item?.aggregate_type === 'video'"
            :src="item?.url"
            controls
            class="max-w-full max-h-full"
          />

          <!-- Audio -->
          <div
            v-else-if="item?.aggregate_type === 'audio'"
            class="flex flex-col items-center gap-4 p-8"
          >
            <div
              class="h-20 w-20 rounded-2xl bg-amber-500/10 flex items-center justify-center"
            >
              <FileAudio class="h-10 w-10 text-amber-500" />
            </div>
            <audio :src="item?.url" controls class="w-64" />
          </div>

          <!-- Document / Other -->
          <div v-else class="flex flex-col items-center gap-3 p-8 text-center">
            <div
              class="h-20 w-20 rounded-2xl flex items-center justify-center"
              :class="typeStyle?.bg"
            >
              <component
                :is="typeIcon"
                class="h-10 w-10"
                :class="typeStyle?.icon"
              />
            </div>
            <p class="text-sm font-semibold text-foreground">
              {{ item?.original_filename }}
            </p>
            <a
              :href="item?.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink class="h-3.5 w-3.5" />
              Open file
            </a>
          </div>
        </div>

        <!-- Detail sidebar -->
        <div
          class="w-72 flex flex-col border-l border-border overflow-y-auto shrink-0"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-border"
          >
            <h2 class="text-sm font-semibold text-foreground">File Details</h2>
          </div>

          <!-- Meta -->
          <div class="px-4 py-4 space-y-3 border-b border-border">
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
              >
                Filename
              </p>
              <p class="text-xs font-medium text-foreground break-all">
                {{ item?.original_filename ?? item?.filename }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                >
                  Type
                </p>
                <p class="text-xs font-medium capitalize">
                  {{ item?.aggregate_type }}
                </p>
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                >
                  Size
                </p>
                <p class="text-xs font-medium">{{ item?.human_size }}</p>
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                >
                  Extension
                </p>
                <p class="text-xs font-medium uppercase">
                  {{ item?.extension }}
                </p>
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
                >
                  Uploaded by
                </p>
                <p class="text-xs font-medium">
                  {{ item?.uploader?.name ?? "—" }}
                </p>
              </div>
            </div>
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5"
              >
                Uploaded
              </p>
              <p class="text-xs font-medium">{{ formattedDate }}</p>
            </div>
          </div>

          <!-- Alt text editor -->
          <div class="px-4 py-3 border-b border-border flex-1">
            <label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5"
            >
              Alt Text / Caption
            </label>
            <textarea
              v-model="altDraft"
              rows="3"
              placeholder="Describe this file…"
              class="w-full text-xs bg-muted/40 border border-border rounded-lg px-3 py-2 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          <!-- Actions -->
          <div class="px-4 py-3 flex flex-col gap-2">
            <button
              type="button"
              class="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              :disabled="saving || altDraft === (item?.alt ?? '')"
              @click="saveAlt"
            >
              <Loader2 v-if="saving" class="h-3.5 w-3.5 animate-spin" />
              <Save v-else class="h-3.5 w-3.5" />
              {{ saving ? "Saving…" : "Save Changes" }}
            </button>
            <button
              type="button"
              class="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              @click="emit('delete', item!)"
            >
              <Trash2 class="h-3.5 w-3.5" />
              Delete File
            </button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Media } from "@/stores/media";
import {
  ExternalLink,
  File,
  FileAudio,
  FileText,
  FileVideo,
  ImageIcon,
  Loader2,
  Save,
  Trash2,
} from "lucide-vue-next";
import { computed, ref, watch } from "vue";

  // ── Props / emits ─────────────────────────────────────────────────────────────

  const props = defineProps<{
    item: Media | null;
  }>();

  const emit = defineEmits<{
    (e: "close"): void;
    (e: "save", id: number, alt: string | null): void;
    (e: "delete", item: Media): void;
  }>();

  // ── State ─────────────────────────────────────────────────────────────────────

  const altDraft = ref<string>("");
  const saving = ref(false);

  watch(
    () => props.item,
    (newItem) => {
      altDraft.value = newItem?.alt ?? "";
    },
    { immediate: true },
  );

  // ── Type styling ──────────────────────────────────────────────────────────────

  const typeIconMap: Record<string, any> = {
    image: ImageIcon,
    video: FileVideo,
    audio: FileAudio,
    document: FileText,
    other: File,
  };

  const typeBgMap: Record<string, { bg: string; icon: string }> = {
    image: { bg: "bg-violet-500/10", icon: "text-violet-500" },
    video: { bg: "bg-rose-500/10", icon: "text-rose-500" },
    audio: { bg: "bg-amber-500/10", icon: "text-amber-500" },
    document: { bg: "bg-sky-500/10", icon: "text-sky-500" },
    other: { bg: "bg-slate-500/10", icon: "text-slate-500" },
  };

  const typeIcon = computed(
    () => typeIconMap[props.item?.aggregate_type ?? "other"] ?? File,
  );
  const typeStyle = computed(
    () => typeBgMap[props.item?.aggregate_type ?? "other"],
  );

  const formattedDate = computed(() => {
    if (!props.item?.created_at) return "—";
    return new Date(props.item.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  // ── Actions ───────────────────────────────────────────────────────────────────

  async function saveAlt() {
    if (!props.item) return;
    saving.value = true;
    try {
      emit("save", props.item.id, altDraft.value.trim() || null);
    } finally {
      saving.value = false;
    }
  }
</script>
