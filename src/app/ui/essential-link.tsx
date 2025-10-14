'use client'

import Link from 'next/link'
import type { NavigationItem } from '@/interfaces'


export default function EssentialLink({ items }: { items: NavigationItem[] }) {
  return (
    <div className="hidden h-full max-h-screen w-72 flex-wrap overflow-auto rounded-sm pt-5 bg-gray-50 sm:flex">
      <ul className='px-4'>
        {items.map((item) => {
          return (
            <li key={item.slug} className="mb-2">
              <Link
                key={item.title}
                href={`${item.path}`}
                className="px-3 py-2 text-sm font-medium uppercase text-gray-500 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
              >
                {`${item.title}`}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>)
}