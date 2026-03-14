<template>
  <UiForm
    mode="edit"
    :loading="loading"
    loading-text="Loading task…"
    :breadcrumbs="breadcrumbs"
    :submitting="taskStore.isLoading"
    :has-changes="meta.dirty"
    :error-message="taskStore.hasError ? taskStore.errorMessage : null"
    submit-label="Save Changes"
    @submit="onSubmit"
    @cancel="router.back()"
  >
    <!-- ── Sidebar ─────────────────────────────────────────────────────────── -->
    <template #sidebar>
      <Card v-if="task" class="border-border">
        <CardHeader class="pb-2 pt-5 px-5">
          <div class="flex items-center gap-2">
            <div class="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Info class="h-3.5 w-3.5 text-primary" />
            </div>
            <CardTitle class="text-[13px] font-semibold">Task Info</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="px-5 pb-5 pt-2 space-y-3">
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Task ID
            </dt>
            <dd class="text-[12px] font-mono text-foreground bg-muted px-2 py-1 rounded inline-block">
              {{ task.task_number }}
            </dd>
          </div>
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Current Stage
            </dt>
            <dd>
              <span v-if="task.stage" class="flex items-center gap-1.5 text-[12px] font-medium">
                <span
                  class="h-1.5 w-1.5 rounded-full shrink-0"
                  :style="{ background: task.stage.color ?? '#94a3b8' }"
                />
                {{ task.stage.display_label }}
              </span>
              <span v-else class="text-[12px] text-muted-foreground">—</span>
            </dd>
          </div>
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Pipeline
            </dt>
            <dd class="text-[12px] text-foreground">{{ task.pipeline?.name ?? "—" }}</dd>
          </div>
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Created
            </dt>
            <dd class="text-[12px] text-muted-foreground">{{ formatDate(task.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Creator
            </dt>
            <dd class="text-[12px] text-foreground">{{ task.creator?.name ?? "—" }}</dd>
          </div>
        </CardContent>
      </Card>
    </template>

    <!-- ── Fields ─────────────────────────────────────────────────────────── -->
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
                {{ task?.task_number ?? "Edit Task" }}
              </h1>
              <p class="text-[13px] text-muted-foreground mt-0.5">
                Update this task's details, stage, or priority.
              </p>
            </div>
          </div>
        </div>

        <!-- Title + Priority -->
        <div class="px-8 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3 items-start">
            <FormField v-slot="{ componentField, meta: fieldMeta }" name="title">
              <UiFormField
                label="Task Title"
                required
                :show-success="fieldMeta.valid && fieldMeta.touched"
                :icon="Tag"
              >
                <Input
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                  v-bind="componentField"
                />
              </UiFormField>
            </FormField>

            <FormField v-slot="{ componentField }" name="priority">
              <UiFormField label="Priority" required :icon="AlertCircle">
                <Select v-bind="componentField">
                  <SelectTrigger class="h-10 w-full bg-muted border-border focus:bg-card transition-colors text-[13px]">
                    <SelectValue placeholder="Select…">
                      <span v-if="values.priority && selectedPriority" class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full shrink-0" :class="selectedPriority.dot" />
                        <span class="text-[13px]">{{ selectedPriority.label }}</span>
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
                        <span class="h-2 w-2 rounded-full shrink-0" :class="p.dot" />
                        <span class="text-[13px]">{{ p.label }}</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </UiFormField>
            </FormField>
          </div>
        </div>

        <!-- Stage + Due Date -->
        <div class="px-8 pb-6">
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3 items-start">
            <FormField v-slot="{ componentField }" name="pipeline_stage_id">
              <UiFormField label="Stage" required :icon="Columns3">
                <Select v-bind="componentField" :disabled="stagesLoading">
                  <SelectTrigger class="h-10 w-full bg-muted border-border focus:bg-card transition-colors text-[13px]">
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
                        <span class="text-[13px]">{{ s.display_label ?? s.name }}</span>
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
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                  v-bind="componentField"
                />
              </UiFormField>
            </FormField>
          </div>
        </div>

        <!-- Description -->
        <div class="px-8 pb-8">
          <FormField v-slot="{ componentField }" name="description">
            <UiFormField label="Description" badge="Optional" :icon="FileText">
              <Textarea
                placeholder="Task details, acceptance criteria, notes…"
                :rows="5"
                class="resize-none bg-muted border-border focus-visible:bg-card transition-colors text-[13px] leading-relaxed"
                v-bind="componentField"
              />
              <template #hint-right>
                <span
                  class="text-[11px] tabular-nums font-semibold transition-colors"
                  :class="(values.description?.length ?? 0) > 4500 ? 'text-amber-500' : 'text-muted-foreground'"
                >
                  {{ values.description?.length ?? 0 }}
                  <span class="text-muted-foreground font-normal">/5000</span>
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
import { notify }        from "@/helpers/toast"
import { toTypedSchema } from "@vee-validate/zod"
import {
  AlertCircle, CalendarDays, Columns3,
  FileText, Info, SquarePen, Tag,
} from "lucide-vue-next"
import { useForm }       from "vee-validate"
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter }      from "vue-router"
import { z }             from "zod"
import axios             from "@/lib/axios"

import type { FormBreadcrumb } from "@/components/common/UiForm.vue"
import UiForm                  from "@/components/common/UiForm.vue"
import UiFormField             from "@/components/common/UiFormField.vue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField }           from "@/components/ui/form"
import { Input }               from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea }            from "@/components/ui/textarea"
import { useTaskStore }        from "@/stores/task"

const route     = useRoute()
const router    = useRouter()
const taskStore = useTaskStore()

const loading       = ref(true)
const stagesLoading = ref(true)
const stages        = ref<{ id: number; name: string; display_label: string; color: string | null }[]>([])
const task          = computed(() => taskStore.activeTask)

const selectedPriority = computed(() =>
  taskStore.priorities.find((p) => p.value === values.priority),
)

const formSchema = toTypedSchema(
  z.object({
    title:             z.string().min(1).max(255),
    priority:          z.string(),
    pipeline_stage_id: z.string(),
    due_date:          z.string().optional().nullable(),
    description:       z.string().max(5000).optional().nullable(),
  }),
)

const { handleSubmit, meta, values, resetForm, setFieldValue } = useForm({
  validationSchema: formSchema,
})

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) { router.back(); return }

  try {
    await Promise.all([
      taskStore.fetchPriorities(),
      taskStore.fetchTask(id),
    ])

    if (task.value) {
      // Load stages for this task's pipeline
      axios
        .get(`/pipelines/${task.value.pipeline_id}/stages`, {
          params: { per_page: 200, sort_by: "display_order", sort_order: "asc" },
        })
        .then(({ data }) => { stages.value = data.data ?? [] })
        .finally(() => { stagesLoading.value = false })

      const priority = task.value.priority
      const priorityValue =
        typeof priority === "object" && priority !== null
          ? (priority as any).value
          : priority ?? "medium"

      resetForm({
        values: {
          title:             task.value.title,
          priority:          priorityValue,
          pipeline_stage_id: String(task.value.pipeline_stage_id),
          due_date:          task.value.due_date ?? "",
          description:       task.value.description ?? "",
        },
      })
      setFieldValue("pipeline_stage_id", String(task.value.pipeline_stage_id))
    }
  } catch {
    router.back()
  } finally {
    loading.value = false
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  if (!task.value) return
  taskStore.clearError()
  try {
    await taskStore.updateTask(task.value.id, {
      title:             formValues.title,
      priority:          formValues.priority,
      pipeline_stage_id: Number(formValues.pipeline_stage_id),
      due_date:          formValues.due_date    || null,
      description:       formValues.description || null,
    })
    resetForm({ values: formValues })
    notify.success("Changes saved", `"${task.value.task_number}" has been updated.`)
    router.push({ name: "task-detail", params: { id: task.value.id } })
  } catch {
    notify.error("Update failed", "An error occurred. Please try again.")
  }
})

function formatDate(d: string | null | undefined): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

const breadcrumbs = computed<FormBreadcrumb[]>(() => [{ label: "Edit Task" }])
</script>