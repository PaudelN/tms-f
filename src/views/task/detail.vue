<template>
  <UiDetail
    :loading="taskStore.isDetailLoading"
    loading-text="Loading task…"
    :breadcrumbs="breadcrumbs"
    :status-badge="priorityBadge"
    :actions="actions"
    :meta-fields="metaFields"
    :meta-default-size="22"
    :delete-open="deleteModalOpen"
    :delete-loading="deleteLoading"
    :delete-dialog="deleteDialog"
    activity-coming-soon
    @update:delete-open="deleteModalOpen = $event"
    @confirm-delete="confirmDelete"
  >
    <template #content>
      <!-- Description -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <AlignLeft class="h-3.5 w-3.5 text-muted-foreground" />
          <h2
            class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"
          >
            Description
          </h2>
        </div>
        <div
          v-if="task?.description"
          class="text-[13px] text-foreground/80 leading-relaxed rounded-lg bg-muted/20 border border-border/40 px-4 py-3.5"
        >
          {{ task.description }}
        </div>
        <div
          v-else
          class="text-[12px] text-muted-foreground/60 italic rounded-lg bg-muted/10 border border-dashed border-border/40 px-4 py-3.5 cursor-pointer hover:bg-muted/20 transition-all duration-200"
          @click="handleEdit"
        >
          No description yet — click to add one.
        </div>
      </div>

      <!-- Context: stage + pipeline -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <Columns3 class="h-3.5 w-3.5 text-muted-foreground" />
          <h2
            class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"
          >
            Context
          </h2>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <!-- Stage -->
          <div class="rounded-lg border border-border/40 bg-muted/10 px-4 py-3">
            <p
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
            >
              Stage
            </p>
            <div v-if="task?.stage" class="flex items-center gap-1.5">
              <span
                class="h-2 w-2 rounded-full shrink-0"
                :style="{ background: task.stage.color ?? '#94a3b8' }"
              />
              <!-- display_label can be null — fall back to name -->
              <span class="text-[13px] font-medium">
                {{ task.stage.display_label ?? task.stage.name }}
              </span>
            </div>
            <span v-else class="text-[13px] text-muted-foreground">—</span>
          </div>

          <!-- Pipeline -->
          <div class="rounded-lg border border-border/40 bg-muted/10 px-4 py-3">
            <p
              class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
            >
              Pipeline
            </p>
            <!--
              pipeline relation may be null even when pipeline_id is present
              (relation not eager-loaded, or pipeline was soft-deleted).
              Show the name if loaded, a human-readable fallback if only the
              ID is available, or a dash when neither exists.
            -->
            <span class="text-[13px] font-medium">
              {{ pipelineLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Project -->
      <div v-if="task?.project" class="space-y-2.5">
        <div class="flex items-center gap-2">
          <Layers class="h-3.5 w-3.5 text-muted-foreground" />
          <h2
            class="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"
          >
            Project
          </h2>
        </div>
        <div class="rounded-lg border border-border/40 bg-muted/10 px-4 py-3">
          <span class="text-[13px] font-medium">{{ task.project.name }}</span>
        </div>
      </div>
    </template>

    <template #delete-body>
      <span>
        Task <strong class="font-semibold">{{ task?.task_number }}</strong>
        will be permanently removed. This cannot be undone.
      </span>
    </template>
  </UiDetail>
</template>

<script setup lang="ts">
  import { useTaskStore } from "@/stores/task";
  import { computed, onMounted, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import type {
    ActionButton,
    BreadcrumbItem,
    MetaField,
  } from "@/components/common/UiDetail.vue";
  import UiDetail from "@/components/common/UiDetail.vue";
  import { notify } from "@/helpers/toast";
  import {
    AlignLeft,
    CalendarDays,
    Clock,
    Columns3,
    Hash,
    Layers,
    RefreshCcw,
    SquarePen,
    Trash2,
    User,
  } from "lucide-vue-next";

  const route = useRoute();
  const router = useRouter();
  const taskStore = useTaskStore();

  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);
  const task = computed(() => taskStore.activeTask);

  // ─── Pipeline label ──────────────────────────────────────────────────────────
  // Three tiers:
  //   1. pipeline relation is loaded  → use its name
  //   2. pipeline is null but pipeline_id exists → show "Pipeline #<id>"
  //   3. neither exists               → "—"
  const pipelineLabel = computed<string>(() => {
    if (task.value?.pipeline?.name) return task.value.pipeline.name;
    if (task.value?.pipeline_id) return `Pipeline #${task.value.pipeline_id}`;
    return "—";
  });

  // ─── Breadcrumbs ─────────────────────────────────────────────────────────────
  const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    {
      label:
        task.value?.pipeline?.name ??
        (task.value?.pipeline_id
          ? `Pipeline #${task.value.pipeline_id}`
          : "Pipeline"),
      onClick: () => {
        if (task.value?.pipeline_id)
          router.push({
            name: "pipeline-detail",
            params: { id: task.value.pipeline_id },
          });
      },
    },
    { label: task.value?.task_number ?? "Task" },
  ]);

  // ─── Priority badge ───────────────────────────────────────────────────────────
  const priorityBadge = computed(() => {
    const p = task.value?.priority;
    if (!p || typeof p !== "object" || !("badge" in p)) return undefined;
    return { label: p.label, dot: p.dot, class: p.badge };
  });

  // ─── Actions ──────────────────────────────────────────────────────────────────
  const actions = computed<ActionButton[]>(() => [
    {
      id: "refresh",
      label: "Refresh",
      icon: RefreshCcw,
      onClick: handleRefresh,
    },
    { id: "edit", label: "Edit", icon: SquarePen, onClick: handleEdit },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: () => {
        deleteModalOpen.value = true;
      },
    },
  ]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ─── Meta fields ──────────────────────────────────────────────────────────────
  const metaFields = computed<MetaField[]>(() => [
    { label: "Task Number", value: task.value?.task_number ?? "—", icon: Hash },
    {
      label: "Creator",
      type: "avatar",
      avatarData: task.value?.creator
        ? {
            initials: task.value.creator.name.charAt(0).toUpperCase(),
            name: task.value.creator.name,
            sub: task.value.creator.email ?? " ",
          }
        : undefined,
    },

    {
      label: "Due Date",
      value: task.value?.due_date
        ? formatDate(task.value.due_date) +
          (task.value.is_overdue ? " (Overdue)" : "")
        : "—",
      icon: CalendarDays,
    },
    {
      label: "Created",
      value: formatDate(task.value?.created_at),
      icon: Clock,
    },
    {
      label: "Last Updater",
      value: task.value?.updater?.name ?? "—",
      icon: User,
    },
  ]);

  // ─── Delete dialog config ─────────────────────────────────────────────────────
  const deleteDialog = {
    title: "Delete Task",
    description: "This action cannot be undone.",
    confirmLabel: "Delete Task",
  };

  // ─── Lifecycle ────────────────────────────────────────────────────────────────
  onMounted(async () => {
    const id = Number(route.params.id);
    if (!id) {
      router.back();
      return;
    }
    await Promise.all([taskStore.fetchPriorities(), taskStore.fetchTask(id)]);
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  function handleEdit() {
    router.push({ name: "task-edit", params: { id: task.value?.id } });
  }

  async function handleRefresh() {
    const id = Number(route.params.id);
    if (id) await taskStore.fetchTask(id);
  }

  async function confirmDelete() {
    if (!task.value) return;
    deleteLoading.value = true;
    try {
      const pipelineId = task.value.pipeline_id;
      const num = task.value.task_number;
      await taskStore.deleteTask(task.value.id);
      notify.success("Task deleted", `"${num}" was removed.`, {
        position: "bottom-right",
      });
      router.push({ name: "pipeline-detail", params: { id: pipelineId } });
    } catch {
      notify.error("Delete failed", "We couldn't delete this task.", {
        position: "bottom-right",
      });
    } finally {
      deleteLoading.value = false;
    }
  }
</script>
