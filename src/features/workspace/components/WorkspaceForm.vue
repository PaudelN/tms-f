<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import UiFormActions from '@/components/shared/UiFormActions.vue'
import UiInfoCallout from '@/components/shared/UiInfoCallout.vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    initialValue?: { name: string; description?: string | null }
    submitLabel: string
  }>(),
  {
    loading: false,
    initialValue: () => ({ name: '', description: '' }),
  },
)

const emit = defineEmits<{ submit: [{ name: string; description?: string }]; cancel: [] }>()

const form = reactive({
  name: props.initialValue.name,
  description: props.initialValue.description ?? '',
})

watch(
  () => props.initialValue,
  (next) => {
    form.name = next.name
    form.description = next.description ?? ''
  },
)

function onSubmit() {
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <UiInfoCallout text="Workspaces are the top-level containers for tasks, docs, and workload planning." />
    <div class="space-y-2">
      <Label for="workspace-name">Name</Label>
      <Input id="workspace-name" v-model="form.name" required placeholder="Platform modernization" />
    </div>
    <div class="space-y-2">
      <Label for="workspace-description">Description</Label>
      <Textarea id="workspace-description" v-model="form.description" placeholder="What is this workspace used for?" />
    </div>
    <UiFormActions :loading="loading" :submit-label="submitLabel" @cancel="emit('cancel')" />
  </form>
</template>
