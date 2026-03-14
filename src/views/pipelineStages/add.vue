<template>
  <UiForm
    mode="create"
    :breadcrumbs="breadcrumbs"
    :submitting="stageStore.isLoading"
    :has-changes="meta.dirty"
    :error-message="stageStore.hasError ? stageStore.errorMessage : null"
    submit-label="Create Stage"
    @submit="onSubmit"
    @cancel="router.back()"
  >
    <!-- ── Sidebar ───────────────────────────────────────────────────────── -->
    <template #sidebar>
      <Card class="border-border rounded-lg">
        <CardHeader class="pb-2 px-5">
          <div class="flex items-center gap-2">
            <div class="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Radio class="h-3.5 w-3.5 text-primary" />
            </div>
            <CardTitle class="text-[13px] font-semibold">Status Guide</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="px-5 pb-5 pt-2 space-y-2.5">
          <div v-if="statusesLoading" class="space-y-2">
            <div v-for="i in 2" :key="i" class="h-8 bg-muted animate-pulse rounded" />
          </div>
          <div
            v-for="s in stageStore.statuses"
            :key="s.value"
            class="flex items-start gap-2.5"
          >
            <span :class="['h-2 w-2 rounded-full shrink-0 mt-1.5', s.dot]" />
            <div>
              <p class="text-[12px] font-semibold text-foreground">{{ s.label }}</p>
              <p class="text-[11px] text-muted-foreground leading-relaxed">{{ s.description }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border-border rounded-lg">
        <CardContent class="px-5 py-4 space-y-3">
          <div class="flex items-center gap-2">
            <Lightbulb class="h-3.5 w-3.5 text-amber-500" />
            <p class="text-[12px] font-semibold text-foreground">Tips</p>
          </div>
          <ul class="space-y-1.5">
            <li
              v-for="tip in tips"
              :key="tip"
              class="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed"
            >
              <ChevronRight class="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
              {{ tip }}
            </li>
          </ul>
        </CardContent>
      </Card>
    </template>

    <!-- ── Fields ────────────────────────────────────────────────────────── -->
    <template #fields>
      <form @submit.prevent>
        <!-- Header -->
        <div class="px-10 pt-8 pb-6 border-b">
          <div class="flex items-start gap-4">
            <div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CirclePlus class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 class="text-[18px] font-bold tracking-tight text-foreground leading-tight">
                Add Stage
              </h1>
              <p class="text-[13px] text-muted-foreground mt-0.5">
                Add a new stage to this pipeline. Stages define the steps tasks move through.
              </p>
            </div>
          </div>
        </div>

        <!-- Name + Status -->
        <div class="px-8 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3 items-start">
            <FormField v-slot="{ componentField, meta: fieldMeta }" name="name">
              <UiFormField
                label="Stage Name"
                required
                hint="2–255 characters. E.g. 'In Review', 'Done'."
                :show-success="fieldMeta.valid && fieldMeta.touched"
                :icon="Tag"
              >
                <Input
                  placeholder="e.g. In Progress, Review, Done"
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                  v-bind="componentField"
                />
              </UiFormField>
            </FormField>

            <FormField v-slot="{ componentField }" name="status">
              <UiFormField label="Status" required :icon="Activity">
                <Select
                  :disabled="statusesLoading"
                  :model-value="String(values.status ?? '')"
                  @update:model-value="(v) => setFieldValue('status', Number(v))"
                >
                  <SelectTrigger class="h-10 w-full bg-muted border-border focus:bg-card transition-colors text-[13px]">
                    <SelectValue placeholder="Select…">
                      <span v-if="selectedStatus" class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full shrink-0" :class="selectedStatus.dot" />
                        <span class="text-[13px]">{{ selectedStatus.label }}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="s in stageStore.statuses"
                      :key="s.value"
                      :value="String(s.value)"
                    >
                      <span class="flex items-center gap-2.5 py-0.5">
                        <span class="h-2 w-2 rounded-full shrink-0" :class="s.dot" />
                        <span class="text-[13px]">{{ s.label }}</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </UiFormField>
            </FormField>
          </div>
        </div>

        <!-- Display Name + Order + WIP -->
        <div class="px-8 pb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            <FormField v-slot="{ componentField }" name="display_name">
              <UiFormField
                label="Display Name"
                badge="Optional"
                hint="Overrides the name in the UI."
                :icon="Pencil"
              >
                <Input
                  placeholder="e.g. In Review"
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                  v-bind="componentField"
                />
              </UiFormField>
            </FormField>

            <FormField v-slot="{ componentField }" name="display_order">
              <UiFormField
                label="Order"
                badge="Optional"
                hint="Lower = leftmost column."
                :icon="ArrowUpDown"
              >
                <Input
                  type="number"
                  min="0"
                  placeholder="Auto"
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                  v-bind="componentField"
                />
              </UiFormField>
            </FormField>

            <FormField v-slot="{ componentField }" name="wip_limit">
              <UiFormField
                label="WIP Limit"
                badge="Optional"
                hint="Max tasks in this stage. Leave blank for unlimited."
                :icon="Hash"
              >
                <Input
                  type="number"
                  min="1"
                  max="9999"
                  placeholder="Unlimited"
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                  v-bind="componentField"
                />
              </UiFormField>
            </FormField>
          </div>
        </div>

        <!-- Color -->
        <div class="px-8 pb-8">
          <FormField v-slot="{ componentField }" name="color">
            <UiFormField
              label="Color"
              badge="Optional"
              hint="Hex color code for the stage chip (e.g. #3B82F6)."
              :icon="Palette"
            >
              <div class="flex items-center gap-3">
                <Input
                  placeholder="#3B82F6"
                  maxlength="7"
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px] font-mono w-40"
                  v-bind="componentField"
                />
                <div
                  v-if="values.color && /^#[0-9A-Fa-f]{6}$/.test(values.color)"
                  class="h-10 w-10 rounded-lg border border-border/60 shrink-0 shadow-sm"
                  :style="`background:${values.color}`"
                />
              </div>
            </UiFormField>
          </FormField>
        </div>
      </form>
    </template>
  </UiForm>
</template>

<script setup lang="ts">
import { notify } from "@/helpers/toast";
import { toTypedSchema } from "@vee-validate/zod";
import {
  Activity, ArrowUpDown, ChevronRight, CirclePlus,
  Hash, Lightbulb, Palette, Pencil, Radio, Tag,
} from "lucide-vue-next";
import { useForm } from "vee-validate";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";

import type { FormBreadcrumb } from "@/components/common/UiForm.vue";
import UiForm      from "@/components/common/UiForm.vue";
import UiFormField from "@/components/common/UiFormField.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { usePipelineStageStore } from "@/stores/pipelineStages";

const route      = useRoute();
const router     = useRouter();
const stageStore = usePipelineStageStore();

const pipelineId    = computed(() => Number(route.params.pipelineId));
const statusesLoading = ref(true);

const selectedStatus = computed(() =>
  stageStore.statuses.find((s) => s.value === values.status),
);

const tips = [
  "Give stages clear, action-oriented names like 'In Review' or 'Done'.",
  "Use Display Name for a friendlier label without changing the slug.",
  "Set a WIP limit to prevent bottlenecks in your workflow.",
  "Color-code stages to make your Kanban board easier to scan.",
  "Stages are sorted by Order — lower numbers appear first (leftmost).",
];

// ── Validation ────────────────────────────────────────────────────────────────
const formSchema = toTypedSchema(
  z.object({
    name: z
      .string({ required_error: "Stage name is required." })
      .min(2, "Must be at least 2 characters.")
      .max(255, "Must not exceed 255 characters."),
    display_name:  z.string().max(255).optional().nullable(),
    display_order: z.number().int().min(0).optional().nullable(),
    status:        z.number({ required_error: "Please select a status." }),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex code (e.g. #3B82F6).")
      .optional()
      .nullable(),
    wip_limit: z.number().int().min(1).max(9999).optional().nullable(),
  }),
);

const { handleSubmit, meta, values, setFieldValue } = useForm({
  validationSchema: formSchema,
});

onMounted(async () => {
  await stageStore.fetchStatuses();
  statusesLoading.value = false;
  const active = stageStore.statuses.find((s) => s.value === 1);
  if (active) setFieldValue("status", active.value);
});

// ── Submit ────────────────────────────────────────────────────────────────────
const onSubmit = handleSubmit(async (formValues) => {
  stageStore.clearError();
  try {
    const stage = await stageStore.createStage(pipelineId.value, {
      name:          formValues.name,
      display_name:  formValues.display_name  || null,
      display_order: formValues.display_order  ?? undefined,
      status:        formValues.status,
      color:         formValues.color          || null,
      wip_limit:     formValues.wip_limit       || null,
    });
    notify.success("Stage created", `"${stage.display_label}" is now ready to use.`);
    router.push({ name: "pipeline-stage-detail", params: { id: stage.id } });
  } catch {
    notify.error("Failed to create stage", "Please check the form and try again.");
  }
});

const breadcrumbs: FormBreadcrumb[] = [{ label: "New Stage" }];
</script>