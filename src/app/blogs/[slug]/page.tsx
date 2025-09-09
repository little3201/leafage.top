import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { parseMarkdown } from "@/lib/md-convert"
import { getAllBlogs, getBlogBySlug } from '@/lib/api'
import type { Blog } from '@/interfaces/blog'
import Tag from '@/app/_components/tag'

import '@/app/highlight-theme.css'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    return notFound()
  }

  const content = await parseMarkdown(blog.content || "");

  return (
    <article>
      <h1 className="text-4xl mx-auto max-w-2xl font-semibold tracking-tight text-center lg:text-4xl lg:leading-snug">
        {blog.title}
      </h1>

      <div className='flex flex-row justify-center space-x-2 my-2'>
        {blog.tags.map((tag) => <Tag key={tag} text={tag} />)}
      </div>

      <div className="flex items-center justify-center text-sm">
        <time
          className="text-gray-500 dark:text-gray-400"
          dateTime={blog.date}>
          {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(new Date(blog.date))}
        </time>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden py-8 lg:pb-16">
        <div className="w-full grow rounded-sm md:shadow-lg dark:shadow-lime-700/40 max-w-4xl p-2 md:py-16">
          <div
            className='mx-auto prose prose-a:text-lime-600 dark:prose-invert dark:prose-pre:bg-gray-800'
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata | undefined> {
  const slug = (await params).slug
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return notFound()
  }

  return {
    title: blog.title,
    description: blog.title
  };
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const blogs = await getAllBlogs()

  return blogs.map((blog: Blog) => ({
    slug: String(blog.slug)
  }))
}