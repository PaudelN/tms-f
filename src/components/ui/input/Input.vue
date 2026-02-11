<script setup lang="ts">
  import { cn } from "@/lib/utils";
  import { useVModel } from "@vueuse/core";
  import { X } from "lucide-vue-next";
  import { computed, type HTMLAttributes } from "vue";

  const props = defineProps<{
    defaultValue?: string | number;
    modelValue?: string | number;
    class?: HTMLAttributes["class"];
  }>();

  const emits = defineEmits<{
    "update:modelValue": [value: string | number];
  }>();

  const modelValue = useVModel(props, "modelValue", emits, {
    passive: true,
    defaultValue: props.defaultValue,
  });

  const clearInput = () => {
    modelValue.value = "";
  };

  const hasValue = computed(() => {
    return (
      modelValue.value !== undefined &&
      modelValue.value !== null &&
      modelValue.value !== ""
    );
  });
</script>

<template>
  <div class="relative">
    <input
      v-model="modelValue"
      v-bind="$attrs"
      :class="
        cn(
          'flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'bg-input text-foreground border-border placeholder:text-gray-500 focus-visible:ring-ring',
          hasValue && 'pr-10',
          props.class,
        )
      "
    />
    <button
      v-if="hasValue"
      type="button"
      @click="clearInput"
      class="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-purple-900/70 text-white dark:hover:text-white transition-colors duration-200"
      aria-label="Clear input"
    >
      <X :size="13" />
    </button>
  </div>
</template>
