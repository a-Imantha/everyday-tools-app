import { cn } from '../../lib/utils'
import { Card } from '../ui/card'
import { ChevronRight } from 'lucide-react'

export function ToolCard({ title, description, icon: Icon }: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className={cn('group h-full p-4 transition-colors hover:border-primary')}>      
      <div className="flex items-start gap-3">
        <Icon className="h-6 w-6 text-primary" />
        <div className="space-y-1">
          <h3 className="font-medium leading-none">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Card>
  )
}

