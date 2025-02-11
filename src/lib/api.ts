import { Blog } from "@/interfaces/blog"
import fs from "fs"
import matter from "gray-matter"
import { join } from "path"

const postsDirectory = join(process.cwd(), "src/_blogs");

export function getBlogSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getBlogBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Blog;
}

export function getAllBlogs(): Blog[] {
  const slugs = getBlogSlugs();
  const blogs = slugs
    .map((slug) => getBlogBySlug(slug))
    // sort blogs by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return blogs;
}