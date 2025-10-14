'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

import type { Pagination } from '@/interfaces/pagination'

export default function Pagination({ totalPages, page }: Pagination) {
  const pathname = usePathname()
  const basePath = pathname.split('/')[1]
  const prevPage = page - 1 > 0
  const nextPage = page + 1 <= totalPages

  return (
    <div className="space-y-2 pb-8 pt-6 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={page - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${page - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {page} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${page + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}