'use server'

import { createClient } from '@/lib/supabase/server'

export type SignupActionState = { error: string | null; success: boolean }

export async function signup(
  _prevState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message, success: false }
  }

  // Email confirmation is required (see docs/ROADMAP.md 1a decision), so
  // the user isn't signed in yet - show a "check your inbox" message
  // instead of redirecting to /dashboard.
  return { error: null, success: true }
}
