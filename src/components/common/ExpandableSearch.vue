<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Kbd } from "@/components/ui/kbd";
  import { onClickOutside } from "@vueuse/core";
  import { Search, X } from "lucide-vue-next";
  import { onMounted, onUnmounted, ref } from "vue";

  const isExpanded = ref(false);
  const searchValue = ref("");
  const searchRef = ref<HTMLDivElement | null>(null);
  const inputRef = ref<HTMLInputElement | null>(null);

  const expandSearch = () => {
    isExpanded.value = true;
    setTimeout(() => {
      inputRef.value?.focus();
    }, 50);
  };

  const closeSearch = () => {
    isExpanded.value = false;
    setTimeout(() => {
      searchValue.value = "";
    }, 200);
  };

  // Click outside to close
  onClickOutside(searchRef, () => {
    if (isExpanded.value && !searchValue.value) {
      closeSearch();
    }
  });

  // Keyboard shortcut: Cmd/Ctrl + K
  onMounted(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isExpanded.value) {
          inputRef.value?.focus();
        } else {
          expandSearch();
        }
      }
    };
    window.addEventListener("keydown", handleShortcut);

    onUnmounted(() => {
      window.removeEventListener("keydown", handleShortcut);
    });
  });
</script>

<template>
  <div ref="searchRef" class="relative hidden md:flex items-center h-10">
    <!-- Collapsed State - Search Button with Clay Effect -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <Button
        v-if="!isExpanded"
        variant="ghost"
        size="icon"
        class="h-10 w-10 rounded-sm bg-linear-to-br from-background/80 to-background/40 backdrop-blur-xl hover:h-3 transition-all duration-300 active:scale-95"
        @click="expandSearch"
        aria-label="Open search"
      >
        <Search class="h-5 w-5 text-foreground/70" />
      </Button>
    </Transition>

    <!-- Expanded State - Search Input with Clay Morphism -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 scale-95 translate-x-2"
      enter-to-class="opacity-100 scale-100 translate-x-0"
      leave-from-class="opacity-100 scale-100 translate-x-0"
      leave-to-class="opacity-0 scale-95 translate-x-2"
    >
      <div v-if="isExpanded" class="absolute right-0 z-50">
        <div class="relative group">
          <Search
            class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 z-10"
          />
          <Input
            ref="inputRef"
            v-model="searchValue"
            placeholder="Search tasks, projects, or team members..."
            class="w-90 pl-11 pr-20 h-10 ] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 focus-visible:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_16px_rgba(0,0,0,0.12),0_0_0_3px_rgba(var(--primary)/0.1)] placeholder:text-muted-foreground/50 text-sm"
            @keydown.esc="closeSearch"
          />
          <div
            class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
          >
            <!-- Keyboard Shortcut Badge -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out delay-100"
              leave-active-class="transition-all duration-150 ease-in"
              enter-from-class="opacity-0 scale-90"
              enter-to-class="opacity-100 scale-100"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-90"
            >
              <Kbd
                v-if="!searchValue"
                class="hidden lg:inline-flex pointer-events-none h-6 px-2 opacity-40 group-focus-within:opacity-0 transition-opacity duration-200 text-[10px] bg-linear-to-br from-muted/60 to-muted/40 border-muted-foreground/20 shadow-sm"
              >
                <span class="text-[11px] font-medium">⌘</span>K
              </Kbd>
            </Transition>

            <!-- Clear Button -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              leave-active-class="transition-all duration-150 ease-in"
              enter-from-class="opacity-0 scale-75 rotate-90"
              enter-to-class="opacity-100 scale-100 rotate-0"
              leave-from-class="opacity-100 scale-100 rotate-0"
              leave-to-class="opacity-0 scale-75 rotate-90"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  /* Smooth spring-like transitions */
  @keyframes gentle-bounce {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }

  /* Add subtle animation on focus */
  .group:focus-within .z-10 {
    animation: gentle-bounce 0.3s ease-out;
  }
</style>
