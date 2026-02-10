<script setup lang="ts">
import { computed } from 'vue'
import { Select } from '@/components/ui/select'

const props = defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | null | undefined] }>()

const safeValue = computed(() => (props.modelValue === '' ? undefined : props.modelValue ?? undefined))

function handleUpdate(value: unknown) {
  if (typeof value === "string" || value === null || value === undefined) {
    emit('update:modelValue', value)
    return
  }

  emit('update:modelValue', String(value))
}
</script>

<template>
  <Select :model-value="safeValue" @update:model-value="handleUpdate">
    <slot />
  </Select>
</template>
