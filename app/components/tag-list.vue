<template>
  <div
    class="hidden h-full max-h-screen min-w-[200px] max-w-[280px] flex-wrap overflow-auto rounded-sm pt-5 bg-gray-50 sm:flex">
    <div class="px-6 py-4">
      <h3 v-if="isBlog" class="font-bold uppercase text-primary-500">All Tags</h3>
      <NuxtLink v-else to="/docs"
        class="font-bold uppercase text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500">
        Document
      </NuxtLink>
      <ul>
        <li v-for="tag in tags" :key="tag.title" class="my-3">
          <h3 v-if="currentTag === tag.title" class="inline px-3 py-2 text-sm font-bold uppercase text-primary-500">
            {{ tag.title }}
          </h3>
          <NuxtLink v-else :to="tag.path"
            class="px-3 py-2 text-sm font-medium uppercase text-gray-500 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500">
            {{ tag.title }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

// Props
defineProps({
  tags: {
    type: Array,
    required: true,
  },
})

// Computed properties
const route = useRoute()
const isBlog = route.path.startsWith('/blogs')
const currentTag = route.path.split('/tags/')[1]
</script>
