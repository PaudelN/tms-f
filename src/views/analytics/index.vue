<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background px-4 py-12"
  >
    <div class="text-center w-full max-w-xl">
      <div
        class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-card border border-border shadow-subtle mb-5 mx-auto"
      >
        <BarChart2 class="w-5 h-5 text-primary" />
      </div>

      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-10 text-primary text-xs font-medium mb-4"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        In development
      </div>

      <h1 class="text-2xl font-medium text-foreground mb-2">Analytics</h1>
      <p
        class="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md mx-auto"
      >
        Powerful insights for your workspace are on the way. Track performance,
        spot bottlenecks, and make data-driven decisions.
      </p>

      <div class="grid grid-cols-3 gap-3 mb-3">
        <div
          v-for="feat in features"
          :key="feat.name"
          class="bg-card border border-border rounded-xl p-4 text-left"
        >
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
            :style="{ background: feat.bg }"
          >
            <component
              :is="feat.icon"
              class="w-4 h-4"
              :style="{ color: feat.color }"
            />
          </div>
          <p
            class="text-xs text-muted-foreground uppercase tracking-wide mb-1 font-medium"
          >
            Coming soon
          </p>
          <p class="text-sm font-medium text-foreground">{{ feat.name }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-card border border-border rounded-xl p-4 text-left">
          <p class="text-xs text-muted-foreground mb-1">Tasks completed</p>
          <p class="text-xl font-medium text-foreground mb-1">—</p>
          <p class="text-xs text-muted-foreground">
            Data available after launch
          </p>
          <div class="h-1.5 bg-secondary rounded-full mt-3 overflow-hidden">
            <div class="h-full w-2/5 rounded-full bg-primary opacity-40" />
          </div>
        </div>
        <div class="bg-card border border-border rounded-xl p-4 text-left">
          <p class="text-xs text-muted-foreground mb-1">Active projects</p>
          <p class="text-xl font-medium text-foreground mb-1">—</p>
          <p class="text-xs text-muted-foreground">
            Data available after launch
          </p>
          <div class="h-1.5 bg-secondary rounded-full mt-3 overflow-hidden">
            <div class="h-full w-3/5 rounded-full bg-primary opacity-40" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { BarChart2, Clock, TrendingUp, Users } from "lucide-vue-next";
  const features = [
    {
      name: "Task trends",
      icon: TrendingUp,
      bg: "rgb(139 92 246 / 0.10)",
      color: "rgb(139 92 246)",
    },
    {
      name: "Time tracking",
      icon: Clock,
      bg: "rgb(16 185 129 / 0.10)",
      color: "rgb(16 185 129)",
    },
    {
      name: "Team performance",
      icon: Users,
      bg: "rgb(59 130 246 / 0.10)",
      color: "rgb(59 130 246)",
    },
  ];
</script>
