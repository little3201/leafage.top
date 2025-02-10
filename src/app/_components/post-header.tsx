import Tag from '@/app/_components/tag'

type Props = {
  title: string
  tags: string[]
  date: string
}

export default function PostHeader({ title, tags, date }: Props) {
  return (
    <section>
      <h1 className="text-4xl mx-auto max-w-2xl font-semibold tracking-tight text-center lg:text-4xl lg:leading-snug">
        {title}
      </h1>

      <div className='flex flex-row justify-center space-x-2 my-2'>
        {tags.map((tag) => <Tag key={tag} text={tag} />)}
      </div>

      <div className="flex items-center justify-center text-sm">
        <time
          className="text-neutral-500 dark:text-neutral-400"
          dateTime={date}>
          {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(new Date(date))}
        </time>
      </div>
    </section>)
}