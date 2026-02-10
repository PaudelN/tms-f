<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
defineProps<{ items: string[] }>();
</script>
<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in items" :key="item">
        <BreadcrumbItem>
          <BreadcrumbPage>{{ item }}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < items.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
