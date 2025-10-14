import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EssentialLink from '@/app/ui/essential-link'
import { parseMarkdown } from "@/lib/md-convert"
import { queryCollectionNavigation, queryCollection } from '@/lib/api'
import type { NavigationItem } from '@/interfaces'



export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const navigation = await queryCollectionNavigation('docs')

  const slug = (await params).slug
  const data = await queryCollection('docs').path(slug)

  if (!data) {
    return notFound()
  }

  const content = await parseMarkdown(data.content || "")
  return (
    <div>
      <EssentialLink items={navigation} />
      <article className="flex min-h-screen flex-col items-center justify-center overflow-hidden py-8 md:py-16">
        <div className="w-full grow rounded-sm md:shadow-lg dark:shadow-lime-700/40 max-w-4xl 2xl:max-w-7xl p-4 md:py-16">
          <div
            className='mx-auto prose 2xl:prose-xl prose-a:text-lime-600 dark:prose-invert dark:prose-pre:bg-gray-800'
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </article>
    </div>
  )
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata | undefined> {
  const slug = (await params).slug
  const data = await queryCollection('docs').path(slug);

  if (!data) {
    return notFound()
  }

  return {
    title: data.title,
    description: data.title
  };
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const docs = await queryCollectionNavigation('docs')

  return docs.map((doc: NavigationItem) => doc.slug)
}