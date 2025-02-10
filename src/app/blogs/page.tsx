import { Suspense } from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/api'

import TagList from '@/app/_components/tag-list'
import Tag from '@/app/_components/tag'
import Pagination from '@/app/_components/pagination'

export default async function Index() {
  const blogs = await getAllPosts()

  const pagination = { totalPages: blogs.length / 12, page: 1 }
  return (
    <Suspense>
      <div className='flex space-x-24'>
        <TagList tags={blogs[0].tags} />
        <div>
          <ul>
            {blogs.map((post) =>
              <li key={`/blogs/${post.slug}`} className="flex flex-col space-y-2 xl:space-y-0 p-5 rounded-sm hover:bg-neutral-50 group">
                <dl>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-sm font-medium leading-6 text-neutral-500 dark:text-neutral-400">
                    <time dateTime={post.date}>{new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }).format(new Date(post.date))}</time>
                  </dd>
                </dl>
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-bold leading-8 tracking-tight">
                      <Link href={`/blogs/${post.slug}`} className="text-neutral-900 group-hover:text-lime-600 dark:text-neutral-100">
                        {post.title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap space-x-2 mt-1">
                      {post.tags.map((tag) => <Tag key={tag} text={tag} />)}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {post.excerpt}
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