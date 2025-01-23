import './highlight-theme.css'

export default function PostBody({ content }: { content: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden py-8 lg:py-16">
      <div className="w-full grow rounded-sm md:shadow-lg dark:shadow-lime-700/40 max-w-4xl p-2 md:py-16">
        <div
          className='mx-auto prose prose-a:text-lime-600 dark:prose-invert dark:prose-pre:bg-neutral-800'
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}