// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  return [{
    slug: '1',
  }]
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  return (
    <article className="flex min-h-screen flex-col items-center justify-center overflow-hidden py-8 md:py-16">
      <div>{slug}</div>
      <div className="w-full grow rounded-sm bg-white md:shadow-2xl dark:bg-gray-900 dark:shadow-gray-500 max-w-4xl p-2 md:py-16">
        <div
          className='mx-auto prose prose-green lg:prose-lg dark:prose-invert'
          dangerouslySetInnerHTML={{ __html: 'xxxx内容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试容测试' }}
        />
      </div>
    </article>
  )
}