<template>
  <div
    class="relative shrink-0"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="w-full h-full rounded-full object-cover ring-1 ring-border/60 shadow-sm"
    />
    <div
      v-else
      class="w-full h-full rounded-full flex items-center justify-center ring-1 ring-border/60 shadow-sm"
      :style="{ background: avatarBg, color: avatarFg }"
    >
      <span
        class="font-bold leading-none select-none"
        :style="{ fontSize: Math.max(8, size * 0.38) + 'px' }"
      >
        {{ initials }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const props = withDefaults(
    defineProps<{
      name?: string;
      src?: string | null;
      size?: number;
    }>(),
    { name: "", src: null, size: 32 }, // slightly larger for enterprise feel
  );

  const initials = computed(() => {
    if (!props.name) return "?";
    const parts = props.name.trim().split(" ");
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  // Deterministic color from name
  const HUE_PALETTE = [221, 262, 142, 25, 199, 330, 160, 38, 291, 12];
  const avatarBg = computed(() => {
    if (!props.name) return "rgb(var(--color-muted))";
    let hash = 0;
    for (let i = 0; i < props.name.length; i++)
      hash = props.name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = HUE_PALETTE[Math.abs(hash) % HUE_PALETTE.length];
    return `hsl(${hue} 65% 55% / 0.15)`;
  });
  const avatarFg = computed(() => {
    if (!props.name) return "rgb(var(--color-muted-foreground))";
    let hash = 0;
    for (let i = 0; i < props.name.length; i++)
      hash = props.name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = HUE_PALETTE[Math.abs(hash) % HUE_PALETTE.length];
    return `hsl(${hue} 60% 45%)`;
  });
</script>
