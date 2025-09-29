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

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.seo.title,
  titleTemplate: '%s - Leafage',
  ogTitle: page.value.seo.title,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description,
  ogImage: 'https://docs-template.nuxt.dev/social-card.png',
  twitterImage: 'https://docs-template.nuxt.dev/social-card.png'
})
</script>