<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>


<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  title: 'Leafage',
})

provide('navigation', navigation)
</script>