import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist. It might have been removed or the URL might be incorrect.
          </p>
        </div>
        <div className="space-y-3">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white">
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" className="w-full border-border bg-transparent" asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
