<template>
  <section class="flex space-x-24 p-24">
    <TagList :tags="navigation" />
    <ul>
      <li v-for="item in posts" :key="item.title"
        class="flex flex-col space-y-2 xl:space-y-0 p-5 rounded-sm hover:bg-gray-50 group">
        <dl>
          <dt class="sr-only">Published on</dt>
          <dd class="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400">
            <time dateTime={blog.date}>{{ new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(new Date(item.date)) }}</time>
          </dd>
        </dl>
        <div class="space-y-3">
          <div>
            <h2 class="text-xl font-bold leading-8 tracking-tight">
              <NuxtLink :to="item.path" class="text-gray-900 group-hover:text-lime-600 dark:text-gray-100">
                {{ item.title }}
              </NuxtLink>
            </h2>
            <div class="flex flex-wrap space-x-2 mt-1">
              <div v-for="tag in item.seo.tags" :key="tag">{{ tag }}</div>
            </div>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ item.description }}
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('blogs'))

const { data: posts } = await useAsyncData('blogs', () => queryCollection('blogs')
  .select('title', 'path', 'date', 'description', 'seo', 'id')
  .order('date', 'DESC')
  .all())
</script>