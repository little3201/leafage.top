<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>


<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en'
  },
  title: 'Leafage',
})
</script>