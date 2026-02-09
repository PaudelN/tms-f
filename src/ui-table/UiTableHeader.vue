<template>
  <div class="bg-card border-border border-b px-5 py-4 rounded-lg shadow-soft">
    <div class="flex items-center justify-between gap-4">
      <!-- Left: Search -->
      <div class="flex-1 max-w-md">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Input
            type="text"
            :value="searchValue"
            @input="handleSearchInput"
            :placeholder="searchPlaceholder"
            class="block w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border-input bg-background text-foreground placeholder-muted-foreground focus:ring-ring focus:ring-2 focus:outline-none transition-all"
          />
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <!-- Refresh Button -->
        <Button
          v-if="showRefresh"
          @click="$emit('refresh')"
          :disabled="loading"
          variant="outline"
          class="h-9 px-4 flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh"
        >
          <svg
            :class="['h-4 w-4', loading && 'animate-spin']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </Button>

        <!-- Column Visibility Dropdown -->
        <div class="relative">
          <Button
            @click="columnDropdownOpen = !columnDropdownOpen"
            variant="outline"
            class="h-9 px-4 flex items-center gap-2 text-sm font-medium"
            title="Show/hide columns"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <span>Columns</span>
          </Button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="columnDropdownOpen"
              v-click-outside="closeColumnDropdown"
              class="absolute right-0 mt-2 w-56 rounded-lg shadow-soft bg-card border-border z-10"
            >
              <div class="py-1">
                <div class="px-3 py-2 text-xs font-semibold text-card-foreground border-b border-border">
                  Toggle columns
                </div>
                <button
                  v-for="column in columns"
                  :key="column.key"
                  @click="$emit('toggle-column', column.key)"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 text-card-foreground"
                >
                  <span
                    :class="[
                      'h-4 w-4 rounded border flex items-center justify-center transition-all',
                      column.visible
                        ? 'bg-primary border-primary'
                        : 'border-muted'
                    ]"
                  >
                    <svg
                      v-if="column.visible"
                      class="h-3 w-3 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{{ column.label }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { TableColumn } from "./types/table.types";
import Input from "@/components/ui/input/Input.vue";
import Button from "@/components/ui/button/Button.vue";

interface Props {
  searchValue: string;
  searchPlaceholder?: string;
  columns: TableColumn[];
  showRefresh?: boolean;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  searchPlaceholder: "Search...",
  showRefresh: true,
  loading: false,
});

const emit = defineEmits<{
  "update:search": [value: string];
  refresh: [];
  "toggle-column": [columnKey: string];
}>();

const columnDropdownOpen = ref(false);

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:search", target.value);
}

function closeColumnDropdown() {
  columnDropdownOpen.value = false;
}

</script>
