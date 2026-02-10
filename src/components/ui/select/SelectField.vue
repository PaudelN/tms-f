<script setup lang="ts">
import { computed } from "vue";
import Select from "./Select.vue";

const EMPTY_SENTINEL = "__placeholder__";

type Acceptable = string | number | bigint | null;

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    placeholderValue?: string;
  }>(),
  {
    modelValue: null,
    placeholderValue: EMPTY_SENTINEL,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
}>();

const internalValue = computed(() => props.modelValue ?? props.placeholderValue);

function handleUpdate(nextValue: Acceptable) {
  const value = nextValue === null ? props.placeholderValue : String(nextValue);
  emit("update:modelValue", value === props.placeholderValue ? null : value);
}
</script>

<template>
  <Select :model-value="internalValue" @update:model-value="handleUpdate">
    <slot :placeholder-value="placeholderValue" />
  </Select>
</template>
