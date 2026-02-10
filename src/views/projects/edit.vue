<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Project } from '@/features/projects/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{ project?: Project | null }>()
const emit = defineEmits<{ cancel: []; success: [payload: Project] }>()

const name = ref('')
const owner = ref('')
const budget = ref('')

watch(
  () => props.project,
  (project) => {
    name.value = project?.name ?? ''
    owner.value = project?.owner ?? ''
    budget.value = project?.budget ?? ''
  },
  { immediate: true },
)

const canSave = computed(() => Boolean(props.project && name.value && owner.value))
function submit() {
  if (!props.project || !canSave.value) return
  emit('success', { ...props.project, name: name.value, owner: owner.value, budget: budget.value })
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Edit project</h2>
    <div class="space-y-2"><Label>Name</Label><Input v-model="name" /></div>
    <div class="space-y-2"><Label>Owner</Label><Input v-model="owner" /></div>
    <div class="space-y-2"><Label>Budget</Label><Input v-model="budget" /></div>
    <div class="flex justify-end gap-2"><Button variant="outline" @click="emit('cancel')">Cancel</Button><Button :disabled="!canSave" @click="submit">Update</Button></div>
  </div>
</template>
