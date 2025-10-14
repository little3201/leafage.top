import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Docs",
  description: "Docs of leafage",
}

export default function DocLayout({ children }: { children: React.ReactNode }) {
  return <section className="container mx-auto lg:py-24">{children}</section>
}