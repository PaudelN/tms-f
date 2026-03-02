<template>
  <div class="space-y-2">

    <!-- Label row -->
    <div class="flex items-center justify-between gap-2">
      <label :for="id" class="text-[13px] font-semibold text-foreground">
        {{ label }}<span v-if="required" class="text-destructive ml-0.5">*</span>
      </label>
      <slot name="label-right" />
    </div>

    <!-- Input -->
    <slot />

    <!-- Error / hint -->
    <div class="flex items-start justify-between gap-2 min-h-[18px]">
      <p v-if="error" class="text-[12px] text-destructive flex items-center gap-1.5">
        <AlertCircle class="h-3.5 w-3.5 flex-shrink-0" />{{ error }}
      </p>
      <p v-else-if="hint" class="text-[11px] text-muted-foreground/55 leading-relaxed">{{ hint }}</p>
      <span v-else />
      <slot name="hint-right" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
defineProps<{ label: string; id?: string; required?: boolean; error?: string; hint?: string }>()
</script>