<template>
  <section class="flex space-x-12 p-24">
    <div class="hidden h-full max-h-screen w-64 overflow-auto rounded-sm bg-gray-50 lg:block">
      <EssentialLink :items="navigation" />
    </div>
    <ContentRenderer v-if="page" :value="page"
      class="prose mx-auto max-w-3xl dark:prose-invert prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900" />
  </section>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const { data: page } = await useAsyncData(() => queryCollection('docs').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>