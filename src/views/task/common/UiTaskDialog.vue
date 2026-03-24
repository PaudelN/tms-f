<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[560px] p-0 gap-0 overflow-hidden">
      <!-- Header -->
      <DialogHeader class="px-6 pt-6 pb-4 border-b">
        <div class="flex items-center gap-3">
          <div
            class="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          >
            <CirclePlus class="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <DialogTitle
              class="text-[15px] font-bold tracking-tight leading-tight"
            >
              Add Task
            </DialogTitle>
            <DialogDescription class="text-[12px] text-muted-foreground mt-0.5">
              Create a new task in this pipeline.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <!-- Form body -->
      <form class="px-6 py-5 space-y-4" @submit.prevent="onSubmit">
        <!-- Title + Priority -->
        <div
          class="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 items-start"
        >
          <FormField v-slot="{ componentField, meta: fieldMeta }" name="title">
            <UiFormField
              label="Task Title"
              required
              :show-success="fieldMeta.valid && fieldMeta.touched"
              :icon="Tag"
            >
              <Input
                placeholder="e.g. Review Q3 contract"
                class="h-9 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                v-bind="componentField"
              />
            </UiFormField>
          </FormField>

          <FormField v-slot="{ componentField }" name="priority">
            <UiFormField label="Priority" required :icon="AlertCircle">
              <Select v-bind="componentField" :disabled="prioritiesLoading">
                <SelectTrigger
                  class="h-9 w-full bg-muted border-border focus:bg-card transition-colors text-[13px]"
                >
                  <SelectValue placeholder="Select…">
                    <span
                      v-if="values.priority && selectedPriority"
                      class="flex items-center gap-2"
                    >
                      <span
                        class="h-2 w-2 rounded-full shrink-0"
                        :class="selectedPriority.dot"
                      />
                      <span class="text-[13px]">{{
                        selectedPriority.label
                      }}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="p in taskStore.priorities"
                    :key="p.value"
                    :value="p.value"
                  >
                    <span class="flex items-center gap-2.5 py-0.5">
                      <span
                        class="h-2 w-2 rounded-full shrink-0"
                        :class="p.dot"
                      />
                      <span class="text-[13px]">{{ p.label }}</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </UiFormField>
          </FormField>
        </div>

        <!-- Stage + Due Date -->
        <div
          class="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 items-start"
        >
          <FormField v-slot="{ componentField }" name="pipeline_stage_id">
            <UiFormField label="Stage" required :icon="Columns3">
              <Select v-bind="componentField" :disabled="stagesLoading">
                <SelectTrigger
                  class="h-9 w-full bg-muted border-border focus:bg-card transition-colors text-[13px]"
                >
                  <SelectValue placeholder="Select stage…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="s in stages"
                    :key="s.id"
                    :value="String(s.id)"
                  >
                    <span class="flex items-center gap-2.5 py-0.5">
                      <span
                        class="h-2 w-2 rounded-full shrink-0"
                        :style="{ background: s.color ?? '#94a3b8' }"
                      />
                      <span class="text-[13px]">{{
                        s.display_label ?? s.name
                      }}</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </UiFormField>
          </FormField>

          <FormField v-slot="{ componentField }" name="due_date">
            <UiFormField label="Due Date" badge="Optional" :icon="CalendarDays">
              <Input
                type="date"
                class="h-9 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                v-bind="componentField"
              />
            </UiFormField>
          </FormField>
        </div>

        <!-- Description -->
        <FormField v-slot="{ componentField }" name="description">
          <UiFormField label="Description" badge="Optional" :icon="FileText">
            <Textarea
              placeholder="What needs to be done, and how will we know it's done?"
              :rows="3"
              class="resize-none bg-muted border-border focus-visible:bg-card transition-colors text-[13px] leading-relaxed"
              v-bind="componentField"
            />
            <template #hint-right>
              <span
                class="text-[11px] tabular-nums font-semibold transition-colors duration-200"
                :class="
                  (values.description?.length ?? 0) > 4500
                    ? 'text-amber-500'
                    : 'text-muted-foreground'
                "
              >
                {{ values.description?.length ?? 0 }}
                <span class="text-muted-foreground font-normal">/5000</span>
              </span>
            </template>
          </UiFormField>
        </FormField>

        <!-- Error banner -->
        <div
          v-if="taskStore.hasError"
          class="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-[12px] text-destructive font-medium"
        >
          {{
            taskStore.errorMessage ?? "Something went wrong. Please try again."
          }}
        </div>
      </form>

      <!-- Footer -->
      <DialogFooter class="px-6 pb-6 pt-2 gap-2">
        <Button
          type="button"
          variant="outline"
          class="h-9 text-[13px]"
          :disabled="taskStore.isLoading"
          @click="emit('update:open', false)"
        >
          Cancel
        </Button>
        <Button
          type="button"
          class="h-9 text-[13px] gap-2 min-w-[110px]"
          :disabled="taskStore.isLoading || !meta.valid"
          @click="onSubmit"
        >
          <Spinner v-if="taskStore.isLoading" class="h-3.5 w-3.5" />
          {{ taskStore.isLoading ? "Creating…" : "Create Task" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { notify } from "@/helpers/toast";
  import axios from "@/lib/axios";
  import { toTypedSchema } from "@vee-validate/zod";
  import {
    AlertCircle,
    CalendarDays,
    CirclePlus,
    Columns3,
    FileText,
    Tag,
  } from "lucide-vue-next";
  import { useForm } from "vee-validate";
  import { computed, onMounted, ref, watch } from "vue";
  import { z } from "zod";

  import UiFormField from "@/components/common/UiFormField.vue";
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { FormField } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import Spinner from "@/components/ui/spinner/Spinner.vue";
  import { Textarea } from "@/components/ui/textarea";
  import { useTaskStore } from "@/stores/task";

  // ── Props & emits ────────────────────────────────────────────────────────────
  const props = defineProps<{
    open: boolean;
    pipelineId: number;
  }>();

  const emit = defineEmits<{
    (e: "update:open", value: boolean): void;
    (e: "created"): void;
  }>();

  // ── Store & local state ──────────────────────────────────────────────────────
  const taskStore = useTaskStore();

  const stagesLoading = ref(false);
  const prioritiesLoading = ref(false);
  const stages = ref<
    {
      id: number;
      name: string;
      display_label: string;
      color: string | null;
    }[]
  >([]);

  // ── Form ─────────────────────────────────────────────────────────────────────
  const formSchema = toTypedSchema(
    z.object({
      title: z
        .string({ required_error: "Task title is required." })
        .min(1)
        .max(255),
      priority: z.string({ required_error: "Please select a priority." }),
      pipeline_stage_id: z.string({
        required_error: "Please select a stage.",
      }),
      due_date: z.string().optional().nullable(),
      description: z.string().max(5000).optional().nullable(),
    }),
  );

  const { handleSubmit, meta, values, resetForm } = useForm({
    validationSchema: formSchema,
  });

  const selectedPriority = computed(() =>
    taskStore.priorities.find((p) => p.value === values.priority),
  );

  // ── Load data when dialog opens ──────────────────────────────────────────────
  async function loadData() {
    stagesLoading.value = true;
    prioritiesLoading.value = true;

    await Promise.all([
      taskStore.fetchPriorities().finally(() => {
        prioritiesLoading.value = false;
      }),
      axios
        .get(`/pipelines/${props.pipelineId}/stages`, {
          params: {
            per_page: 200,
            sort_by: "display_order",
            sort_order: "asc",
          },
        })
        .then(({ data }) => {
          stages.value = data.data ?? [];
        })
        .finally(() => {
          stagesLoading.value = false;
        }),
    ]);
  }

  watch(
    () => props.open,
    (val) => {
      if (val) {
        resetForm();
        taskStore.clearError?.();
        loadData();
      }
    },
    { immediate: false },
  );

  onMounted(() => {
    if (props.open) loadData();
  });

  // ── Submit ────────────────────────────────────────────────────────────────────
  const onSubmit = handleSubmit(async (formValues) => {
    taskStore.clearError?.();
    try {
      const task = await taskStore.createTask(props.pipelineId, {
        title: formValues.title,
        priority: formValues.priority,
        pipeline_stage_id: Number(formValues.pipeline_stage_id),
        due_date: formValues.due_date || null,
        description: formValues.description || null,
      });
      notify.success("Task created", `"${task.task_number}" is ready.`);
      emit("update:open", false);
      emit("created");
    } catch {
      notify.error(
        "Failed to create task",
        "Please check the form and try again.",
      );
    }
  });
</script>
