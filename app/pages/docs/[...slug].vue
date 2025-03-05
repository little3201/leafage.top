<template>
  <section class="flex space-x-24 p-24">
    <div
      class="hidden h-full max-h-screen min-w-[200px] max-w-[280px] flex-wrap overflow-auto rounded-sm bg-gray-50 lg:flex">
      <EssentialLink :items="navigation" />
    </div>
    <ContentRenderer v-if="page" :value="page" :prose="false"
      class="prose dark:prose-invert prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900" />
  </section>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData('docs', () => queryCollection('docs').path(route.path).first())
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