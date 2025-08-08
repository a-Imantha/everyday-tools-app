import Link from 'next/link'
import { ToolCard } from '../components/tools/ToolCard'
import { TOOLS } from '../lib/constants'

export default function ToolsIndexPage() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {TOOLS.map((tool) => (
        <Link key={tool.slug} href={`/tools/${tool.slug}`}>
          <ToolCard title={tool.name} description={tool.description} icon={tool.icon} />
        </Link>
      ))}
    </div>
  )
}

