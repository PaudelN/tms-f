<script setup lang="ts">
  import { cn } from "@/lib/utils";
  import { reactiveOmit } from "@vueuse/core";
  import type { PrimitiveProps } from "reka-ui";
  import { Primitive } from "reka-ui";
  import type { HTMLAttributes } from "vue";
  import { computed } from "vue";
  import type { BadgeVariants } from ".";
  import { badgeVariants } from ".";

  const props = defineProps<
    PrimitiveProps & {
      variant?: BadgeVariants["variant"];
      class?: HTMLAttributes["class"];
      // Pass any valid CSS color: "#22c55e", "rgb(...)", "hsl(...)"
      color?: string;
    }
  >();

  const delegatedProps = reactiveOmit(props, "class", "color");

  // When a color is provided, auto-switch to "status" variant and inject inline styles
  const resolvedVariant = computed(() =>
    props.color ? "status" : (props.variant ?? "default"),
  );

  const colorStyle = computed(() => {
    if (!props.color) return undefined;
    return {
      backgroundColor: `color-mix(in srgb, ${props.color} 10%, transparent)`,
      color: props.color,
      borderColor: `color-mix(in srgb, ${props.color} 20%, transparent)`,
      borderWidth: "1px",
      borderStyle: "solid",
    };
  });
</script>

<template>
  <Primitive
    data-slot="badge"
    :class="cn(badgeVariants({ variant: resolvedVariant }), props.class)"
    :style="colorStyle"
    v-bind="delegatedProps"
  >
    <slot />
  </Primitive>
</template>
