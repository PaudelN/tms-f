<template>
  <div ref="searchRef" class="relative hidden md:flex items-center h-10">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <Button
        v-if="!isExpanded"
        type="button"
        class="relative flex items-center justify-center w-10 h-10 rounded-sm transition-all duration-200 bg-primary-20 text-primary hover:text-foreground hover:bg-background/60"
        aria-label="Open search"
        @click="expandSearch"
      >
        <Search class="h-4.5 w-4.5" />
      </Button>
    </Transition>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-linear"
      enter-from-class="opacity-0 scale-90 translate-x-2"
      enter-to-class="opacity-100 scale-100 translate-x-0"
      leave-from-class="opacity-10 scale-10 duration-200 translate-x-0"
      leave-to-class="opacity-0 scale-0 translate-x-[-5px]"
    >
      <div v-if="isExpanded" class="absolute right-0 origin-right z-50">
        <div class="relative group">
          <Search
            class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none"
          />
          <Input
            ref="inputRef"
            :model-value="modelValue"
            :placeholder="searchPlaceholder || 'Search...'"
            class="w-56 pl-10 pr-16 text-sm rounded-sm border-primary-thin"
            @update:model-value="(v) => emit('update:modelValue', String(v))"
            @keydown.esc="closeSearch"
          />

          <div
            class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
          >
            <Kbd
              v-if="!modelValue && isExpanded"
              class="hidden lg:inline-flex pointer-events-none h-6 px-2 text-[10px] bg-linear-to-br from-muted/60 to-muted/40 border-muted-foreground/20 shadow-sm"
            >
              <span class="text-[11px] font-medium">⌘</span>K
            </Kbd>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import Button from "@/components/ui/button/Button.vue";
  import { Input } from "@/components/ui/input";
  import { Kbd } from "@/components/ui/kbd";
  import { onClickOutside } from "@vueuse/core";
  import { Search } from "lucide-vue-next";
  import { nextTick, onMounted, onUnmounted, ref } from "vue";

  const props = defineProps<{
    modelValue: string;
    searchPlaceholder?: string;
    defaultExpanded?: boolean;
  }>();

  const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
  }>();

  const isExpanded = ref(props.defaultExpanded ?? false);
  const searchRef = ref<HTMLDivElement | null>(null);
  const inputRef = ref<InstanceType<typeof Input> | null>(null);

  // Open input
  function expandSearch() {
    isExpanded.value = true;
    nextTick(() => {
      setTimeout(() => {
        (inputRef.value as any)?.$el?.querySelector("input")?.focus() ??
          (inputRef.value as any)?.focus();
      }, 30);
    });
  }

  // Close input smoothly back into button
  function closeSearch() {
    isExpanded.value = false;
    // Clear after the leave animation finishes
    setTimeout(() => {
      emit("update:modelValue", "");
    }, 400); // match leave-active-class duration
  }

  // Click outside: close if empty
  onClickOutside(searchRef, () => {
    if (isExpanded.value && !props.modelValue) {
      closeSearch();
    }
  });

  // Shortcut ⌘K / Ctrl+K
  function handleShortcut(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (isExpanded.value) {
        (inputRef.value as any)?.$el?.querySelector("input")?.focus() ??
          (inputRef.value as any)?.focus();
      } else {
        expandSearch();
      }
    }
  }

  onMounted(() => window.addEventListener("keydown", handleShortcut));
  onUnmounted(() => window.removeEventListener("keydown", handleShortcut));
</script>
