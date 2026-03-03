<script setup lang="ts">
  import { cn } from "@/lib/utils";
  import { useVModel } from "@vueuse/core";
  import type { HTMLAttributes } from "vue";

  const props = defineProps<{
    class?: HTMLAttributes["class"];
    defaultValue?: string | number;
    modelValue?: string | number;
  }>();

  const emits = defineEmits<{
    (e: "update:modelValue", payload: string | number): void;
  }>();

  const modelValue = useVModel(props, "modelValue", emits, {
    passive: true,
    defaultValue: props.defaultValue,
  });
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :class="
      cn(
        'flex h-20 w-full rounded-sm border px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'bg-input shadow-xs text-foreground border-border placeholder:text-gray-500 focus-visible:ring-ring',
        props.class,
      )
    "
  />
</template>
