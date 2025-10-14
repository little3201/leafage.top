import { Suspense } from 'react'
import Link from 'next/link'
import Pagination from '@/app/ui/pagination'
import { queryCollectionNavigation } from '@/lib/api'

export default async function Index() {
  const navigation = await queryCollectionNavigation('blogs')

  const pagination = { totalPages: navigation.length / 12, page: 1 }
  return (
    <Suspense>


      <div className='flex space-x-24'>
        <div>
          <ul>
            {navigation.map((item) =>
              <li key={item.slug} className="flex flex-col space-y-2 xl:space-y-0 p-5 rounded-sm hover:bg-gray-50 group">
                <dl>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={item.date}>{new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }).format(new Date(item.date))}</time>
                  </dd>
                </dl>
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-bold leading-8 tracking-tight">
                      <Link href={item.path} className="text-gray-900 group-hover:text-lime-600 dark:text-gray-100">
                        {item.title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap space-x-2 mt-1">
                      {item.seo.tags?.map((tag) => <span key={tag} className="finline-block text-xs font-medium tracking-wider uppercase text-lime-600">{tag}</span>)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.excerpt}
                  </div>
                </div>
              </li>
            )}
          </ul>
          {pagination && pagination.totalPages > 1 && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages} />
          )}
        </div>
      </div>
    </Suspense>
  )
}