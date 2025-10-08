<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import {
  SunIcon, MoonIcon
} from '@heroicons/vue/24/outline'


const isDark = useDark()
const toggleDark = useToggle(isDark)

watchEffect(() => {
  useHead({
    htmlAttrs: {
      style: `color-scheme: ${isDark.value ? 'dark' : 'light'}`,
    }
  })
})
</script>

<template>
  <button id="theme" type="button" title="theme-toggle" @click="() => toggleDark()">
    <MoonIcon v-if="isDark" class="size-6" aria-hidden="true" />
    <SunIcon v-else class="size-6" aria-hidden="true" />
  </button>
</template>