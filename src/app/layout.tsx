import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

import Header from '@/app/_components/header'

export const metadata: Metadata = {
  title: {
    template: '%s | Leafage',
    default: 'Leafage',
  },
  description: "A website of leafage",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>
            {children}
          </main>
          <footer className="container mx-auto p-4">
            <div className=" text-gray-700 dark:text-gray-300 text-opacity-70">
              <div className='flex items-center justify-center text-sm'>
                <span>
                  Copyright &copy; {new Date().getFullYear()} Leafage. - License By
                  <a href="https://github.com/little3201/leafage-pw/blob/main/LICENSE"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="hover:text-lime-600"> MIT</a>.
                </span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
