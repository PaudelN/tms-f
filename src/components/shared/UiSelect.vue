<script setup lang="ts">
import { computed } from 'vue'
import { Select } from '@/components/ui/select'

const props = defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>()

const safeValue = computed(() => (props.modelValue === '' || props.modelValue === null ? undefined : props.modelValue))

function handleUpdate(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    emit('update:modelValue', undefined)
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
