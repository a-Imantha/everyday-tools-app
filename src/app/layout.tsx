import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from './components/navigation/Navbar'

export const metadata: Metadata = {
  title: 'Everyday Tools',
  description: 'A collection of handy, professional web tools',
}

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <main className="container py-8">{children}</main>
      </body>
    </html>
  )
}

