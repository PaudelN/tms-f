<script setup lang="ts">
import { computed } from "vue";
import { Select } from "@/components/ui/select";

const props = defineProps<{
  modelValue?: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string | undefined];
}>();

const safeValue = computed(() => (props.modelValue === "" ? undefined : props.modelValue ?? undefined));

function handleUpdate(value: unknown) {
  const normalized = typeof value === "string" ? value : undefined;
  emit("update:modelValue", !normalized ? undefined : normalized);
}
</script>

<template>
  <Select :model-value="safeValue" @update:model-value="handleUpdate">
    <slot />
  </Select>
</template>
