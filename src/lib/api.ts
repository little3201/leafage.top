import fs from "fs"
import matter from "gray-matter"
import { join, posix } from "path"
import type { NavigationItem, NavigationWithContent } from '@/interfaces'


class CollectionQuery {
  private dir: string
  private files: NavigationWithContent[] = []

  constructor(dir: string) {
    this.dir = dir
  }

  /** 加载并缓存指定目录下的所有 Markdown 文件 */
  private async loadFiles() {
    if (this.files.length > 0) return

    const dirPath = join(process.cwd(), "src", `_${this.dir}`)
    if (!fs.existsSync(dirPath)) {
      return
    }

    const fileNames = fs.readdirSync(dirPath).filter(file => file.endsWith(".md"))

    this.files = fileNames.map(fileName => {
      const fullPath = join(dirPath, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data, content } = matter(fileContents)

      const slug = fileName.replace(/\.md$/, "")
      return {
        slug,
        path: slug.toLocaleLowerCase() === 'index' ? "" : posix.join(this.dir, fileName.replace(/\.md$/, "")),
        ...data,
        content
      } as NavigationWithContent
    })
  }

  /** 获取第一个文件 */
  async first(): Promise<NavigationWithContent | null> {
    await this.loadFiles()
    return this.files?.[0] ?? null
  }

  /** 根据 slug 获取指定文件 */
  async path(slug: string): Promise<NavigationWithContent | null> {
    await this.loadFiles()
    if (!this.files || this.files.length === 0) {
      return null
    }

    return this.files?.find(file => file.slug === slug) ?? null
  }

  /** 只返回 frontmatter data（不含 excerpt 与 content） */
  async navigation(): Promise<NavigationItem[]> {
    await this.loadFiles()
    return this.files!.map(({ slug, path, excerpt, ...data }) => ({
      slug,
      path,
      excerpt,
      ...data
    }))
  }
}

/** 返回一个 CollectionQuery 实例 */
export function queryCollection(dir: string): CollectionQuery {
  return new CollectionQuery(dir)
}

/** 仅返回导航数据（frontmatter） */
export async function queryCollectionNavigation(dir: string): Promise<NavigationItem[]> {
  const query = new CollectionQuery(dir)
  return query.navigation()
}