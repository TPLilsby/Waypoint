'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup, type SignupActionState } from './actions'

const initialState: SignupActionState = { error: null, success: false }

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState)

  return (
    <div className="flex flex-1 bg-bg">
      <div className="flex w-full max-w-md flex-col gap-6 px-8 py-24 md:px-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl text-ink">Sign up</h1>
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-accent underline">
              Log in
            </Link>
          </p>
        </div>

        {state.success ? (
          <div className="border border-line rounded-md p-6">
            <p className="text-ink">Check your inbox to confirm your email.</p>
            <p className="mt-2 text-sm text-muted">
              We sent a confirmation link - follow it to finish creating your
              account, then log in.
            </p>
          </div>
        ) : (
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
                minLength={6}
                autoComplete="new-password"
                className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </div>

            {state.error && <p className="text-sm text-accent">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-accent px-4 py-2 font-medium text-bg hover:opacity-90 disabled:opacity-60"
            >
              {pending ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
