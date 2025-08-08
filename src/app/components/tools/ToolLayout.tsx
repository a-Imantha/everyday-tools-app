import { Card } from '../ui/card'

export function ToolLayout({ title, description, controls, children }: { title: string; description?: string; controls?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>

      {controls ? <Card className="p-4">{controls}</Card> : null}

      <Card className="p-4">{children}</Card>
    </div>
  )
}

