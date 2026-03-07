<template>
  <UiForm
    mode="edit"
    :loading="loading"
    loading-text="Loading workspace…"
    :breadcrumbs="breadcrumbs"
    :submitting="workspaceStore.isLoading"
    :has-changes="meta.dirty"
    :error-message="workspaceStore.hasError ? workspaceStore.errorMessage : null"
    submit-label="Save Changes"
    @submit="onSubmit"
    @cancel="router.back()"
  >
    <!-- ── Sidebar ────────────────────────────────────────────────────────── -->
    <template #sidebar>
      <Card v-if="workspace" class="border-border">
        <CardHeader class="pb-2 pt-5 px-5">
          <div class="flex items-center gap-2">
            <div class="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Info class="h-3.5 w-3.5 text-primary" />
            </div>
            <CardTitle class="text-[13px] font-semibold">Record Info</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="px-5 pb-5 pt-2 space-y-3">
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Workspace ID
            </dt>
            <dd class="text-[12px] font-mono text-foreground bg-muted px-2 py-1 rounded inline-block">
              #{{ workspace.id }}
            </dd>
          </div>
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Current Status
            </dt>
            <dd>
              <span
                v-if="currentStatusObj"
                class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                :class="currentStatusObj.badge"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="currentStatusObj.dot" />
                {{ currentStatusObj.label }}
              </span>
              <span
                v-else-if="workspace.status"
                class="text-[12px] font-mono text-muted-foreground capitalize"
              >
                {{ workspace.status }}
              </span>
              <span v-else class="text-[12px] text-muted-foreground">—</span>
            </dd>
          </div>
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Owner
            </dt>
            <dd class="text-[12px] text-foreground">
              {{ workspace.user?.name ?? "—" }}
            </dd>
          </div>
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Created
            </dt>
            <dd class="text-[12px] text-muted-foreground">
              {{ formatDate(workspace.created_at) }}
            </dd>
          </div>
        </CardContent>
      </Card>
    </template>

    <!-- ── Fields ──────────────────────────────────────────────────────────── -->
    <template #fields>
      <form @submit.prevent>
        <!-- Header -->
        <div class="px-8 pt-8 pb-6 border-b">
          <div class="flex items-start gap-4">
            <div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <SquarePen class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 class="text-[18px] font-bold tracking-tight text-foreground leading-tight">
                {{ workspace?.name ?? "Edit Workspace" }}
              </h1>
              <p class="text-[13px] text-muted-foreground mt-0.5">
                Update this workspace's identity, status, and description.
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
                hint="3–255 characters."
                :show-success="fieldMeta.valid && fieldMeta.touched"
                :icon="Tag"
              >
                <Input
                  placeholder="e.g. Marketing Q3"
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
                placeholder="Describe this workspace's purpose…"
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
import { Activity, FileText, Info, SquarePen, Tag } from "lucide-vue-next";
import { useForm } from "vee-validate";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { notify } from "@/helpers/toast";
import { z } from "zod";

import type { FormBreadcrumb } from "@/components/common/UiForm.vue";
import UiForm      from "@/components/common/UiForm.vue";
import UiFormField from "@/components/common/UiFormField.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form";
import { Input }     from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/stores/workspace";

const route  = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();

const loading        = ref(true);
const statusesLoading = ref(true);

// activeWorkspace is the computed alias for currentWorkspace in the store
const workspace = computed(() => workspaceStore.activeWorkspace);

// The status object matching the current saved status (for the sidebar badge)
const currentStatusObj = computed(() =>
  workspaceStore.statuses.find((s) => s.value === workspace.value?.status),
);

// The status object matching the current form value (for the select trigger)
const selectedStatus = computed(() =>
  workspaceStore.statuses.find((s) => s.value === values.status),
);

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string({ required_error: "Workspace name is required." })
      .min(3, "Must be at least 3 characters.")
      .max(255, "Must not exceed 255 characters."),
    status:      z.string({ required_error: "Please select a status." }),
    description: z.string().max(1000, "Must not exceed 1000 characters.").optional(),
  }),
);

const { handleSubmit, meta, values, resetForm, setFieldValue } = useForm({
  validationSchema: formSchema,
});

onMounted(async () => {
  const id = Number(route.params.id);
  if (!id || isNaN(id)) {
    router.push({ name: "workspace" });
    return;
  }

  try {
    await Promise.all([
      workspaceStore.fetchStatuses(),
      workspaceStore.fetchWorkspace(id),
    ]);

    if (workspace.value) {
      resetForm({
        values: {
          name:        workspace.value.name,
          status:      workspace.value.status ?? "",
          description: workspace.value.description ?? "",
        },
      });
      // Explicitly set the status field so vee-validate picks it up
      setFieldValue("status", workspace.value.status ?? "");
    }
  } catch {
    router.push({ name: "workspace" });
  } finally {
    loading.value         = false;
    statusesLoading.value = false;
  }
});

const onSubmit = handleSubmit(async (formValues) => {
  if (!workspace.value) return;
  workspaceStore.clearError();
  try {
    await workspaceStore.updateWorkspace(workspace.value.id, {
      name:        formValues.name,
      status:      formValues.status,
      description: formValues.description || undefined,
    });
    // Re-sync the form's baseline so dirty tracking resets
    resetForm({ values: formValues });
    notify.success("Workspace updated", "Changes have been saved successfully.");
    router.push({ name: "workspace-detail", params: { id: workspace.value.id } });
  } catch (e) {
    notify.error("Update failed", "An error occurred. Please try again.");
    console.error(e);
  }
});

const breadcrumbs = computed<FormBreadcrumb[]>(() => [
  { label: "Workspaces", onClick: () => router.push({ name: "workspace" }) },
  {
    label:   workspace.value?.name ?? "Workspace",
    onClick: () =>
      router.push({ name: "workspace-detail", params: { id: workspace.value?.id } }),
  },
  { label: "Edit" },
]);
</script>