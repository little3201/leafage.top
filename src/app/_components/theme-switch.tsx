'use client'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
export default function ThemeSwitch() {
  const [theme, setTheme] = useState('light')
  return (
    <button type='button' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="theme_button" className="w-9 h-9 rounded-full hover:bg-lime-50 dark:hover:bg-neutral-800 focus:outline-hidden flex items-center justify-center transition-colors duration-200">
      {theme === 'dark' ? <SunIcon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" aria-hidden="true" />
        : <MoonIcon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" aria-hidden="true" />
      }
    </button>
  )
}