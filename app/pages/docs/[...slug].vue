<template>
  <section class="flex space-x-12 p-6">
    <div class="hidden h-full max-h-screen w-64 shrink-0 overflow-auto rounded-sm bg-gray-50 lg:block">
      <EssentialLink :items="navigation" />
    </div>

    <div class="inline-flex flex-1 h-full flex-col items-center overflow-hidden lg:pb-16">
      <div class="w-full grow rounded-md md:shadow-lg dark:shadow-lime-700/40 max-w-5xl md:py-16">
        <ContentRenderer v-if="page" :value="page"
          class="prose ma-auto max-w-3xl dark:prose-invert prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 mx-auto" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData(() => queryCollectionNavigation('docs'))
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