export default function PostLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <section className="container mx-auto lg:py-24">{children}</section>
}