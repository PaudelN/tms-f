<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { Button } from '@/components/ui/button'

const mode = useColorMode({
  selector: 'html',
  attribute: 'class',
  modes: {
    light: 'light',
    dark: 'dark',
  },
  initialValue: 'light',
  storageKey: 'theme-mode',
})

const toggleMode = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button class="cursor-pointer" variant="ghost" size="icon" @click="toggleMode" aria-label="Toggle theme">
    <SunIcon v-if="mode === 'dark'" class="h-5 w-5" />
    <MoonIcon v-else class="h-5 w-5" />
  </Button>
</template>