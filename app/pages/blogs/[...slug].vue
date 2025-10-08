<script setup lang="ts">
const route = useRoute()
const { data: navigation } = await useAsyncData(() => queryCollectionNavigation('blogs'))

const { data: page } = await useAsyncData(route.path, () => queryCollection('blogs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <section class="flex space-x-12 p-6">
    <div class="hidden h-full max-h-screen w-64 shrink-0 overflow-auto rounded-sm bg-gray-50 dark:bg-gray-900 lg:block">
      <EssentialLink :items="navigation" />
    </div>

    <div class="flex h-full flex-1 flex-col items-center overflow-hidden lg:pb-16">
      <h1 className="text-2xl mx-auto max-w-2xl font-semibold tracking-tight text-center lg:text-4xl">
        {{ page?.title }}
      </h1>
      <div class="w-full grow rounded-sm md:shadow-lg dark:shadow-gray-700/40 max-w-5xl md:py-16">
        <ContentRenderer v-if="page" :value="page"
          class="prose ma-auto max-w-3xl dark:prose-invert prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 mx-auto" />
      </div>
    </div>
  </section>
</template>