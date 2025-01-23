'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { clsx } from 'clsx'
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline'
import ThemeSwitch from '@/app/_components/theme-switch'
import { headerList } from '@/lib/data'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="container mx-auto p-4 flex justify-between items-center">
      <div className="inline-flex items-center justify-between w-full lg:w-1/4">
        <Link href="/" >
          <Image
            src="/logo.png"
            className="rounded-full"
            alt="logo"
            width={40}
            height={40}
            style={{
              objectFit: 'contain',
              objectPosition: "center"
            }} />
        </Link>
        <button title='bar' type='button' className="xl:hidden focus:outline-hidden">
          <Bars3Icon className="h-6 w-6 text-neutral-700 dark:text-neutral-300" aria-hidden="true" />
        </button>
      </div>
      <nav className='hidden lg:inline-flex'>
        <ul className="flex justify-between items-center space-x-6">
          {headerList.map(item => (
            <Link
              href={item.path}
              className={clsx('text-md xl:text-base py-2 transition-transform duration-200 font-semibold hover:text-lime-600',
                pathname === item.path ? 'text-lime-600' : 'text-neutral-700 dark:text-neutral-300')}
              rel="noopener noreferrer"
              id={item.title}
              aria-expanded="false"
              key={item.title}>
              <span>{item.title}</span>
            </Link>))}
        </ul>
      </nav>
      <div className="hidden lg:inline-flex lg:w-1/4 items-center justify-end space-x-1">
        <div className="relative">
          <button type="button" title='search_button' className="w-9 h-9 rounded-full hover:bg-lime-50 dark:hover:bg-neutral-800 focus:outline-hidden flex items-center justify-center transition-colors duration-200" id="dark" aria-expanded="false">
            <MagnifyingGlassIcon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" aria-hidden="true" />
          </button>
        </div>
        <ThemeSwitch />
        <div className="relative">
          <Link href="https://github.com/little3201" target="_blank" className="w-9 h-9 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-lime-50 dark:hover:bg-neutral-800 focus:outline-hidden flex items-center justify-center transition-colors duration-200" id="search" type="button" aria-expanded="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </Link>
        </div>
      </div>
    </header >
  )
}