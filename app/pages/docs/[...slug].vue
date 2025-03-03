<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`doc-${route.path}`, () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <article class="p-24">
    <ContentRenderer v-if="page" :value="page" class="prose dark:prose-invert" />
  </article>
</template>