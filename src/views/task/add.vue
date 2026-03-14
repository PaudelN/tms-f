<template>
  <UiForm
    mode="create"
    :breadcrumbs="breadcrumbs"
    :submitting="taskStore.isLoading"
    :has-changes="meta.dirty"
    :error-message="taskStore.hasError ? taskStore.errorMessage : null"
    submit-label="Create Task"
    @submit="onSubmit"
    @cancel="router.back()"
  >
    <!-- ── Sidebar ─────────────────────────────────────────────────────────── -->
    <template #sidebar>
      <Card class="border-border rounded-lg">
        <CardHeader class="pb-2 px-5">
          <div class="flex items-center gap-2">
            <div class="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap class="h-3.5 w-3.5 text-primary" />
            </div>
            <CardTitle class="text-[13px] font-semibold">Priority Guide</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="px-5 pb-5 pt-2 space-y-2.5">
          <div v-if="prioritiesLoading" class="space-y-2">
            <div v-for="i in 4" :key="i" class="h-8 bg-muted animate-pulse rounded" />
          </div>
          <div
            v-for="p in taskStore.priorities"
            :key="p.value"
            class="flex items-start gap-2.5"
          >
            <span class="h-2 w-2 rounded-full shrink-0 mt-1.5" :class="p.dot" />
            <p class="text-[12px] font-semibold text-foreground">{{ p.label }}</p>
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

    <!-- ── Fields ─────────────────────────────────────────────────────────── -->
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
                Add Task
              </h1>
              <p class="text-[13px] text-muted-foreground mt-0.5">
                Create a new task in this pipeline.
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
                hint="A clear, concise title for this task."
                :show-success="fieldMeta.valid && fieldMeta.touched"
                :icon="Tag"
              >
                <Input
                  placeholder="e.g. Review Q3 contract"
                  class="h-10 bg-muted border-border focus-visible:bg-card transition-colors text-[13px]"
                  v-bind="componentField"
                />
              </UiFormField>
            </FormField>

            <FormField v-slot="{ componentField }" name="priority">
              <UiFormField label="Priority" required :icon="AlertCircle">
                <Select v-bind="componentField" :disabled="prioritiesLoading">
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
            <UiFormField
              label="Description"
              badge="Optional"
              hint="Describe the task's goal, acceptance criteria, or any context."
              :icon="FileText"
            >
              <Textarea
                placeholder="What needs to be done, and how will we know it's done?"
                :rows="5"
                class="resize-none bg-muted border-border focus-visible:bg-card transition-colors text-[13px] leading-relaxed"
                v-bind="componentField"
              />
              <template #hint-right>
                <span
                  class="text-[11px] tabular-nums font-semibold transition-colors duration-200"
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
  AlertCircle, CalendarDays, ChevronRight, CirclePlus,
  Columns3, FileText, Lightbulb, Tag, Zap,
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

const pipelineId        = computed(() => Number(route.params.pipelineId))
const stagesLoading     = ref(true)
const prioritiesLoading = ref(true)
const stages            = ref<{ id: number; name: string; display_label: string; color: string | null }[]>([])

const selectedPriority = computed(() =>
  taskStore.priorities.find((p) => p.value === values.priority),
)

const tips = [
  "Use a clear title — your team should understand the task without reading the description.",
  "Set the correct stage so the task appears in the right kanban column.",
  "Assign a due date to help with sprint planning and prioritisation.",
]

const formSchema = toTypedSchema(
  z.object({
    title:             z.string({ required_error: "Task title is required." }).min(1).max(255),
    priority:          z.string({ required_error: "Please select a priority." }),
    pipeline_stage_id: z.string({ required_error: "Please select a stage." }),
    due_date:          z.string().optional().nullable(),
    description:       z.string().max(5000).optional().nullable(),
  }),
)

const { handleSubmit, meta, values } = useForm({ validationSchema: formSchema })

onMounted(async () => {
  await Promise.all([
    taskStore.fetchPriorities().finally(() => { prioritiesLoading.value = false }),
    axios
      .get(`/pipelines/${pipelineId.value}/stages`, {
        params: { per_page: 200, sort_by: "display_order", sort_order: "asc" },
      })
      .then(({ data }) => { stages.value = data.data ?? [] })
      .finally(() => { stagesLoading.value = false }),
  ])
})

const onSubmit = handleSubmit(async (formValues) => {
  taskStore.clearError()
  try {
    const task = await taskStore.createTask(pipelineId.value, {
      title:             formValues.title,
      priority:          formValues.priority,
      pipeline_stage_id: Number(formValues.pipeline_stage_id),
      due_date:          formValues.due_date   || null,
      description:       formValues.description || null,
    })
    notify.success("Task created", `"${task.task_number}" is ready.`)
    router.push({ name: "task-detail", params: { id: task.id } })
  } catch {
    notify.error("Failed to create task", "Please check the form and try again.")
  }
})

const breadcrumbs: FormBreadcrumb[] = [{ label: "New Task" }]
</script>