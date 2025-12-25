'use client'

import Link from 'next/link'
import type { NavigationItem } from '@/interfaces'


export default function EssentialLink({ items }: Readonly<{ items: NavigationItem[] }>) {
  return (
    <div className="hidden h-full max-h-screen w-72 flex-wrap overflow-hidden rounded-sm pt-5 bg-gray-50 sm:flex">
      <ul className="px-4">
        {items.map((item) => (
          <li key={item.slug} className="mb-2">
            {item.path ? (
              <Link
                href={item.path}
                className="px-3 py-2 text-sm font-medium uppercase text-gray-500 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
              >
                {item.title}
              </Link>
            ) : (
              <span className="px-3 py-2 text-sm font-medium uppercase text-gray-500 dark:text-gray-300">
                {item.title}
              </span>
            )}

            {item.children && item.children.length > 0 && (
              <ul className="pl-4 mt-1 border-l border-gray-200 dark:border-gray-700">
                <EssentialLink items={item.children} />
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}