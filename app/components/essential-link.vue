<template>
  <ul class="isolate pl-4">
    <li v-for="item in items" :key="item.title" class="my-3">
      <div v-if="item.children && item.children.length > 0">
        <h3 class="inline px-3 py-2 text-sm font-bold">
          {{ item.title }}
        </h3>
        <EssentialLink :items="item.children" />
      </div>
      <NuxtLink v-else :to="item.path"
        :class="['px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500', $route.path === item.path ? 'text-lime-500' : '']">
        {{ item.title }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

defineProps({
  items: {
    type: Array<ContentNavigationItem>,
    default: []
  },
})
</script>
