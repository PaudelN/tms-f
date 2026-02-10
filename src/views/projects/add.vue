<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UiSelect } from '@/components/shared'

const emit = defineEmits<{ cancel: []; success: [payload: { name: string; owner: string; status: string; budget: string }] }>()

const name = ref('')
const owner = ref('')
const budget = ref('')
const status = ref<string | undefined>(undefined)

function submit() {
  if (!name.value || !owner.value || !status.value) return
  emit('success', { name: name.value, owner: owner.value, status: status.value, budget: budget.value || '$0' })
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Create project</h2>
    <div class="space-y-2"><Label>Name</Label><Input v-model="name" /></div>
    <div class="space-y-2"><Label>Owner</Label><Input v-model="owner" /></div>
    <div class="space-y-2"><Label>Budget</Label><Input v-model="budget" placeholder="$35,000" /></div>
    <div class="space-y-2">
      <Label>Status</Label>
      <UiSelect v-model="status">
        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Planning">Planning</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Blocked">Blocked</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </UiSelect>
    </div>
    <div class="flex justify-end gap-2"><Button variant="outline" @click="emit('cancel')">Cancel</Button><Button @click="submit">Save</Button></div>
  </div>
</template>
