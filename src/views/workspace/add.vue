<template>
  <UiForm
    mode="create"
    :breadcrumbs="breadcrumbs"
    :submitting="workspaceStore.isLoading"
    :has-changes="meta.dirty"
    :error-message="workspaceStore.hasError ? workspaceStore.errorMessage : null"
    submit-label="Create Workspace"
    @submit="onSubmit"
    @cancel="router.back()"
  >
    <!-- ── Sidebar ───────────────────────────────────────────────────────── -->
    <template #sidebar>
      <Card class="border-border rounded-lg">
        <CardHeader class="pb-2 px-5">
          <div class="flex items-center gap-2">
            <div class="h-7 w-7 rounded-lg bg-primary-20 flex items-center justify-center">
              <Flashlight class="h-3.5 w-3.5 text-primary" />
            </div>
            <CardTitle class="text-[13px] font-semibold">Status Guide</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="px-5 pb-5 pt-2 space-y-2.5">
          <div v-if="statusesLoading" class="space-y-2">
            <div v-for="i in 4" :key="i" class="h-8 bg-muted animate-pulse rounded" />
          </div>
          <div
            v-for="s in workspaceStore.statuses"
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
            <div class="h-10 w-10 rounded-xl bg-primary-20 flex items-center justify-center shrink-0">
              <CirclePlus class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 class="text-[18px] font-bold tracking-tight text-foreground leading-tight">
                Add Workspace
              </h1>
              <p class="text-[13px] text-muted-foreground mt-0.5">
                Set up a shared environment for your team to collaborate and manage assets.
              </p>
            </div>
          </div>
        </div>

        <!-- Name + Status -->
        <div class="px-8 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3 items-start">
            <FormField v-slot="{ componentField, meta: fieldMeta }" name="name">
              <UiFormField
                label="Workspace Name"
                required
                hint="3–255 characters. Use a descriptive, unique name."
                :show-success="fieldMeta.valid && fieldMeta.touched"
                :icon="Tag"
              >
                <Input
                  placeholder="e.g. Marketing Q3, Platform Backend"
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                  v-bind="componentField"
                />
              </UiFormField>
            </FormField>

            <FormField v-slot="{ componentField }" name="status">
              <UiFormField label="Status" required :icon="Activity">
                <Select v-bind="componentField" :disabled="statusesLoading">
                  <SelectTrigger
                    class="h-10 w-full bg-muted border-border focus:bg-card transition-colors text-[13px]"
                  >
                    <SelectValue placeholder="Select…">
                      <span v-if="values.status && selectedStatus" class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full shrink-0" :class="selectedStatus.dot" />
                        <span class="text-[13px]">{{ selectedStatus.label }}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="s in workspaceStore.statuses"
                      :key="s.value"
                      :value="s.value"
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

        <!-- Description -->
        <div class="px-8 py-1">
          <FormField v-slot="{ componentField }" name="description">
            <UiFormField
              label="Description"
              badge="Optional"
              hint="Describe the purpose, audience, and scope of this workspace."
              :icon="FileText"
            >
              <Textarea
                placeholder="Describe what this workspace is for, who uses it, and what kind of assets it will contain…"
                :rows="5"
                class="resize-none bg-muted border-border focus-visible:bg-card transition-colors text-[13px] leading-relaxed"
                v-bind="componentField"
              />
              <template #hint-right>
                <span
                  class="text-[11px] tabular-nums font-semibold transition-colors duration-200"
                  :class="(values.description?.length ?? 0) > 900 ? 'text-amber-500' : 'text-muted-foreground'"
                >
                  {{ values.description?.length ?? 0 }}
                  <span class="text-muted-foreground font-normal">/1000</span>
                </span>
              </template>
            </UiFormField>
          </FormField>
        </div>
      </form>
    </template>
  </UiForm>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import {
  Activity,
  ChevronRight,
  CirclePlus,
  FileText,
  Flashlight,
  Lightbulb,
  Tag,
} from "lucide-vue-next";
import { useForm } from "vee-validate";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { notify } from "@/helpers/toast";
import { z } from "zod";

import type { FormBreadcrumb } from "@/components/common/UiForm.vue";
import UiForm from "@/components/common/UiForm.vue";
import UiFormField from "@/components/common/UiFormField.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/stores/workspace";

const router = useRouter();
const workspaceStore = useWorkspaceStore();

const statusesLoading = ref(true);

onMounted(async () => {
  await workspaceStore.fetchStatuses();
  statusesLoading.value = false;
});

const selectedStatus = computed(() =>
  workspaceStore.statuses.find((s) => s.value === values.status)
);

const tips = [
  "Choose a clear, descriptive name that your team will instantly recognize.",
  'Set the status to "Pending" while setting up, then switch to "Active" when ready.',
  "A good description helps new team members understand the workspace purpose.",
];

const formSchema = computed(() =>
  toTypedSchema(
    z.object({
      name: z
        .string({ required_error: "Workspace name is required." })
        .min(3, "Must be at least 3 characters.")
        .max(255, "Must not exceed 255 characters."),
      status: z.string({ required_error: "Please select a status." }),
      description: z.string().max(1000, "Must not exceed 1000 characters.").optional(),
    })
  )
);

const { handleSubmit, meta, values } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (formValues) => {
  workspaceStore.clearError();
  try {
    const ws = await workspaceStore.createWorkspace({
      name: formValues.name,
      status: formValues.status,
      description: formValues.description || undefined,
    });
    notify.success("Workspace created successfully.");
    router.push({ name: "workspace-detail", params: { id: ws.id } });
  } catch (e) {
    notify.error("Failed to create workspace", "Please check the form and try again.");
    console.error(e);
  }
});

const breadcrumbs: FormBreadcrumb[] = [
  { label: "Workspaces", onClick: () => router.push({ name: "workspace" }) },
  { label: "New Workspace" },
];
</script>