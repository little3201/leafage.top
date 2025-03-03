<template>
  <section class="flex space-x-24 p-24">
    <TagList :tags="navigation" />
    <ContentRenderer v-if="page" :value="page" :prose="false" class="prose dark:prose-invert " />
  </section>
</template>

<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))

const { data: page } = await useAsyncData('docs', () => queryCollection('docs').path('/docs').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.seo.title,
  titleTemplate: null,
  ogTitle: page.value.seo.title,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description,
  ogImage: 'https://docs-template.nuxt.dev/social-card.png',
  twitterImage: 'https://docs-template.nuxt.dev/social-card.png'
})
</script>