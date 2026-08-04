'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type AuthActionState } from './actions'

const initialState: AuthActionState = { error: null }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="flex flex-1 bg-bg">
      <div className="flex w-full max-w-md flex-col gap-6 px-8 py-24 md:px-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl text-ink">Log in</h1>
          <p className="text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent underline">
              Sign up
            </Link>
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4 border border-line rounded-md p-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </div>

          {state.error && <p className="text-sm text-accent">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-4 py-2 font-medium text-bg hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}
