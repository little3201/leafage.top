'use client'

import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  return (
    <button type='button' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="theme_button"
      className="w-9 h-9 flex items-center justify-center rounded-full outline-none transition-colors duration-200">
      {theme === 'dark' ?
        <MoonIcon className="size-5 text-gray-700 dark:text-gray-300" />
        : <SunIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      }
    </button>
  )
}