<script setup lang="ts">
import { computed, watch } from "vue";
import { X } from "lucide-vue-next";

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  showClose: true,
});

const emit = defineEmits<{
  "update:open": [value: boolean];
  close: [];
}>();

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

const dialogClass = computed(() => sizeClasses[props.size]);

function close() {
  emit("update:open", false);
  emit("close");
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    close();
  }
}

// Prevent body scroll when modal is open
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            :class="['bg-white rounded-lg shadow-xl w-full', dialogClass]"
            role="dialog"
            aria-modal="true"
          >
            <!-- Header -->
            <div v-if="title || $slots.header" class="flex items-start justify-between p-6 border-b border-gray-200">
              <div class="flex-1">
                <slot name="header">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ title }}
                  </h3>
                  <p v-if="description" class="mt-1 text-sm text-gray-500">
                    {{ description }}
                  </p>
                </slot>
              </div>
              <button
                v-if="showClose"
                type="button"
                class="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
                @click="close"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-6">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="flex items-center justify-end gap-2 p-6 border-t border-gray-200">
              <slot name="footer" :close="close" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
