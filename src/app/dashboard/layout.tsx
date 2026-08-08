import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from './actions'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-line px-8 py-4">
        <div className="flex items-center gap-6">
          <span className="font-heading text-lg text-ink">Waypoint</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-ink hover:text-accent">
              Map
            </Link>
            <Link href="/dashboard/trips" className="text-ink hover:text-accent">
              Trips
            </Link>
            <Link href="/dashboard/settings" className="text-ink hover:text-accent">
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{user.email}</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-ink underline hover:text-accent">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 px-8 py-8">{children}</main>
    </div>
  )
}
