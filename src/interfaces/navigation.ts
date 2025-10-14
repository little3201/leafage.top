export type NavigationItem = {
  slug: string
  path: string
  title: string
  date: string
  seo: Record<string, string | string[] | undefined> & {
    tags?: string[]
  }
  excerpt: string
  // children?: NavigationItem[]
}

export type NavigationWithContent = NavigationItem & {
  content: string
}