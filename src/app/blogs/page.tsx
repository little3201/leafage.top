import Link from 'next/link'
import { queryCollectionNavigation } from '@/lib/api'

export default async function Index() {
  const navigation = await queryCollectionNavigation('blogs')

  return (
    <div className="container mx-auto lg:py-24">
      <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3 dark:border-gray-700">
        {navigation.map((item) => (
          <article key={item.slug} className="flex max-w-xl flex-col items-start justify-between">
            <div className="flex items-center gap-x-4 text-xs">
              <time dateTime={item.date}>{new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).format(new Date(item.date))}
              </time>
            </div>
            <div className="group relative grow">
              <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-lime-600 dark:text-white dark:group-hover:text-gray-300">
                <Link href={item.path}>
                  <span className="absolute inset-0" />
                  {item.title}
                </Link>
              </h3>
              <div className="flex flex-wrap space-x-2 my-2">
                {item.seo.tags?.map((tag) => <span key={tag} className="finline-block text-xs font-medium tracking-wider uppercase text-lime-600">{tag}</span>)}
              </div>
              <p className="mt-3 line-clamp-3 text-sm/6 text-gray-600 dark:text-gray-400">{item.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}