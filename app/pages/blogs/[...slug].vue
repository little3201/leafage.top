<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`blog-${route.path}`, () => queryCollection('blogs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <article class="p-24">
    <h1 className="text-4xl mx-auto max-w-2xl font-semibold tracking-tight text-center lg:text-4xl lg:leading-snug">
      {{ page?.title }}
    </h1>

    <div class="flex min-h-screen flex-col items-center justify-center overflow-hidden py-8 lg:pb-16">
      <div class="w-full grow rounded-sm md:shadow-lg dark:shadow-lime-700/40 max-w-4xl p-2 md:py-16">
        <ContentRenderer v-if="page" :value="page"
          class="prose dark:prose-invert prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 mx-auto" />
      </div>
    </div>
  </article>
</template>