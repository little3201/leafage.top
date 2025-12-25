import fs from "fs"
import matter from "gray-matter"
import { join, posix } from "path"
import type { NavigationItem, NavigationWithContent } from '@/interfaces'

type SortOrder = 'ASC' | 'DESC'

class CollectionQuery {
  private dir: string
  private files: NavigationItem[] = []
  private filesWithContent: Map<string, NavigationWithContent> = new Map()

  constructor(dir: string) {
    this.dir = dir
  }

  /** 递归读取文件夹内容并构建目录树 */
  private async loadFiles(dirPath: string): Promise<NavigationItem[]> {
    const filesAndDirs = fs.readdirSync(dirPath)

    const fileData = await Promise.all(
      filesAndDirs.map(async (fileOrDir) => {
        const fullPath = join(dirPath, fileOrDir)
        const stat = fs.statSync(fullPath)

        // 如果是文件夹，递归读取该文件夹
        if (stat.isDirectory()) {
          const children = await this.loadFiles(fullPath)
          return {
            slug: fileOrDir,
            title: fileOrDir,
            children
          } as NavigationItem
        } else if (fileOrDir.endsWith(".md")) {
          const fileContents = fs.readFileSync(fullPath, "utf8")
          const { data, content } = matter(fileContents)

          const slug = fileOrDir.replace(/\.md$/, "")
          const navigation = {
            slug,
            path: slug.toLocaleLowerCase() === 'index' ? "" : posix.join(this.dir, fileOrDir.replace(/\.md$/, "")),
            ...data
          } as NavigationItem
          this.filesWithContent.set(slug, { ...navigation, content })
          return navigation
        }
      })
    )

    // 过滤掉为 null 的无效数据
    return (fileData.filter(file => file != null) as NavigationItem[]).sort((a, b) => a.slug.localeCompare(b.slug))
  }

  /** 加载并缓存指定目录下的所有 Markdown 文件路径 */
  private async initializeFiles() {
    const dirPath = join(process.cwd(), "src", `_${this.dir}`)
    if (!fs.existsSync(dirPath)) {
      console.warn(`[CollectionQuery] 目录不存在: ${dirPath}`)
      return
    }

    this.files = await this.loadFiles(dirPath)
  }

  /** 获取全部文件（只含路径信息） */
  async all(): Promise<NavigationItem[]> {
    if (this.files.length === 0) {
      await this.initializeFiles()
    }
    return this.files
  }

  /** 获取第一个文件（只含路径信息） */
  async first(): Promise<NavigationWithContent | null> {
    if (this.files.length === 0) {
      await this.initializeFiles()
    }
    return this.filesWithContent.get(this.files[0].slug) ?? null
  }

  /** 根据 slug 获取指定文件 */
  async path(slug: string): Promise<NavigationWithContent | null> {
    if (this.files.length === 0) {
      await this.initializeFiles()
    }
    return this.filesWithContent.get(slug) ?? null
  }

  /** 只返回 frontmatter data（不含 excerpt 与 content） */
  async navigation(): Promise<NavigationItem[]> {
    if (this.files.length === 0) {
      await this.initializeFiles()
    }
    return this.files
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