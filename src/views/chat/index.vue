<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background px-4 py-12"
  >
    <div class="text-center w-full max-w-lg">
      <div
        class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-card border border-border shadow-subtle mb-5 mx-auto"
      >
        <MessageSquare class="w-5 h-5 text-primary" />
      </div>

      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-10 text-primary text-xs font-medium mb-4"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        In development
      </div>

      <h1 class="text-2xl font-medium text-foreground mb-2">Team chat</h1>
      <p
        class="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md mx-auto"
      >
        Real-time messaging for your team is on the way. Discuss tasks, share
        updates, and collaborate without leaving your workspace.
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

      <div class="bg-card border border-border rounded-xl p-5 text-left">
        <p
          class="text-xs text-muted-foreground text-center uppercase tracking-widest mb-4"
        >
          Preview
        </p>
        <div class="flex gap-2.5 mb-3 items-end">
          <div
            class="w-7 h-7 rounded-full bg-primary-10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0"
          >
            AK
          </div>
          <div
            class="bg-secondary text-foreground rounded-2xl px-3 py-2 text-sm max-w-xs"
          >
            The design sprint is ready for review 👀
          </div>
        </div>
        <div class="flex gap-2.5 mb-3 flex-row-reverse items-end">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
            style="background: rgb(16 185 129/0.12); color: rgb(16 185 129)"
          >
            ME
          </div>
          <div
            class="rounded-2xl px-3 py-2 text-sm max-w-xs bg-primary-10 text-primary"
          >
            Looks great — leaving feedback now.
          </div>
        </div>
        <div class="flex gap-2.5 items-end">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
            style="background: rgb(59 130 246/0.12); color: rgb(59 130 246)"
          >
            JS
          </div>
          <div
            class="bg-secondary rounded-2xl px-4 py-3 flex gap-1 items-center"
          >
            <span
              class="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]"
            />
            <span
              class="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]"
            />
            <span
              class="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { MessageSquare, Paperclip, Users2 } from "lucide-vue-next";
  const features = [
    {
      name: "Direct messages",
      icon: MessageSquare,
      bg: "rgb(139 92 246 / 0.10)",
      color: "rgb(139 92 246)",
    },
    {
      name: "Group channels",
      icon: Users2,
      bg: "rgb(59 130 246 / 0.10)",
      color: "rgb(59 130 246)",
    },
    {
      name: "File sharing",
      icon: Paperclip,
      bg: "rgb(16 185 129 / 0.10)",
      color: "rgb(16 185 129)",
    },
  ];
</script>
