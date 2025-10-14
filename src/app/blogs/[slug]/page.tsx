import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { parseMarkdown } from "@/lib/md-convert"
import { queryCollectionNavigation, queryCollection } from '@/lib/api'
import type { NavigationItem } from '@/interfaces'
import '@/app/highlight-theme.css'


export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const data = await queryCollection('blogs').path(slug)

  if (!data) {
    return notFound()
  }

  const content = await parseMarkdown(data.content || "");
  return (
    <article>
      <h1 className="container mx-auto p-4 text-4xl font-semibold tracking-tight text-center lg:text-4xl lg:leading-snug">
        {data.title}
      </h1>

      <div className="flex items-center justify-center text-sm">
        <time
          className="text-gray-500 dark:text-gray-400"
          dateTime={data.date}>
          {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(new Date(data.date))}
        </time>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden py-8 lg:pb-16">
        <div className="w-full grow rounded-sm md:shadow-lg dark:shadow-lime-700/40 max-w-4xl 2xl:max-w-6xl p-4 md:py-16">
          <div
            className='mx-auto prose 2xl:prose-xl prose-a:text-lime-600 dark:prose-invert dark:prose-pre:bg-gray-800'
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </article>
  )
}
