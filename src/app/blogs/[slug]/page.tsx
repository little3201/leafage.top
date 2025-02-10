import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { parseMarkdown } from "@/lib/md-convert"
import { getAllBlogs, getBlogBySlug } from '@/lib/api'
import type { Post } from '@/interfaces/post'

import PostHeader from '@/app/_components/post-header'
import PostBody from '@/app/_components/post-body'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const post = await getBlogBySlug(slug)

  if (!post) {
    return notFound()
  }

  const content = await parseMarkdown(post.content || "");

  return (
    <article>
      <PostHeader
        title={post.title}
        tags={['Technology', 'Lifestyle']}
        date={post.date}
      />
      <PostBody content={content} />
    </article>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata | undefined> {
  const slug = (await params).slug
  const post = await getBlogBySlug(slug);

  if (!post) {
    return notFound()
  }

  return {
    title: post.title,
    description: post.title
  };
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const blogs = await getAllBlogs()

  return blogs.map((post: Post) => ({
    slug: String(post.slug)
  }))
}