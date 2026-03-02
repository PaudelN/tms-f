<template>
  <div class="space-y-2.5">
    <div class="flex items-center justify-between gap-2">
      <label :for="id" class="text-[13px] font-semibold tracking-tight text-foreground/95">
        {{ label }}<span v-if="required" class="ml-0.5 text-destructive">*</span>
      </label>
      <slot name="label-right" />
    </div>

    <slot />

    <div class="flex min-h-[18px] items-start justify-between gap-2">
      <p v-if="error" class="flex items-center gap-1.5 text-[12px] text-destructive">
        <AlertCircle class="h-3.5 w-3.5 flex-shrink-0" />{{ error }}
      </p>
      <p v-else-if="hint" class="text-[11px] leading-relaxed text-muted-foreground/65">{{ hint }}</p>
      <span v-else />

      <slot name="hint-right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

defineProps<{ label: string; id?: string; required?: boolean; error?: string; hint?: string }>()
</script>
