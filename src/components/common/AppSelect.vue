<script setup lang="ts">
import { computed } from "vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AppSelectOption {
  label: string;
  value: string;
}

const EMPTY_TOKEN = "__all__";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder: string;
    options: AppSelectOption[];
    class?: string;
  }>(),
  {
    modelValue: "",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const internalValue = computed(() =>
  props.modelValue === "" ? EMPTY_TOKEN : props.modelValue,
);

function onValueChange(value: any) {
  emit("update:modelValue", value === null || value === EMPTY_TOKEN ? "" : value);
}
</script>

<template>
  <Select :model-value="internalValue" @update:model-value="onValueChange">
    <SelectTrigger :class="class">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem :value="EMPTY_TOKEN">{{ placeholder }}</SelectItem>
      <SelectItem v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
