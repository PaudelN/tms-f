<script setup lang="ts">
import { computed } from 'vue'
import { Select } from '@/components/ui/select'

const props = defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>()

const safeValue = computed(() => (props.modelValue === '' ? undefined : props.modelValue ?? undefined))

function handleUpdate(value: unknown) {
  emit('update:modelValue', value == null || value === '' ? undefined : String(value))
}
</script>

<template>
  <Select :model-value="safeValue" @update:model-value="handleUpdate">
    <slot />
  </Select>
</template>
