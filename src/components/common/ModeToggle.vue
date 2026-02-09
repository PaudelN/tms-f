<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Moon, Sun } from "lucide-vue-next"
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
    <Sun v-if="mode === 'dark'" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </Button>
</template>
