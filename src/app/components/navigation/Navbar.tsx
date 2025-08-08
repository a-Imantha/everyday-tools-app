import Link from 'next/link'
import { cn } from '../../lib/utils'
import { Wrench } from 'lucide-react'

export function Navbar() {
  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur')}>      
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <Wrench className="h-5 w-5 text-primary" />
          <span>Everyday Tools</span>
        </Link>
        <nav className="text-sm text-muted-foreground">
          <Link href="/tools" className="hover:text-foreground transition-colors">All tools</Link>
        </nav>
      </div>
    </header>
  )
}

