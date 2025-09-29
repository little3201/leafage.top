<template>
  <section class="flex space-x-12 p-6">
    <div class="hidden h-full max-h-screen w-64 shrink-0 overflow-auto rounded-sm bg-gray-50 lg:block">
      <EssentialLink :items="navigation" />
    </div>
    <ul>
      <li v-for="item in blogs" :key="item.title"
        class="flex flex-col space-y-2 xl:space-y-0 p-5 rounded-sm hover:bg-gray-50 group">
        <dl>
          <dt class="sr-only">Published on</dt>
          <dd class="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400">
            <time dateTime={blog.date}>{{ new Intl.DateTimeFormat('en-US',
              { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(item.date)) }}
            </time>
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
              <span v-for="tag in item.seo.tags" :key="tag"
                class="finline-block text-xs tracking-wider bg-gray-200 text-lime-600 px-2 py-1 rounded-xl">
                {{ tag }}
              </span>
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
import type { ContentNavigationItem } from '@nuxt/content'


const { data: blogs } = await useAsyncData(() => queryCollection('blogs')
  .select('title', 'path', 'date', 'description', 'seo', 'id')
  .order('date', 'DESC')
  .all())

// 提取并统计标签
const tagsCount = ref<Record<string, number>>({})
watchEffect(() => {
  const tags: Record<string, number> = {}
  blogs.value?.forEach(blog => {
    if (blog.seo && Array.isArray(blog.seo.tags)) {
      blog.seo.tags.forEach(tag => {
        if (tags[tag]) {
          tags[tag]++
        } else {
          tags[tag] = 1
        }
      })
    }
  })
  tagsCount.value = tags
})

// 转换为数组格式便于显示
const navigation = computed<Array<ContentNavigationItem>>(() =>
  Object.keys(tagsCount.value).map(tag => ({
    title: tag + ' (' + tagsCount.value[tag] + ')',
    path: '/blogs?tag=' + tag
  }))
)
</script>