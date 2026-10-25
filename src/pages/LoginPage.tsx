import { Navigate, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, LockKeyhole } from 'lucide-react'
import { canSignIn } from '@/features/authentication/permissions'
import { useCurrentUser, useSignIn } from '@/features/authentication/useCurrentUser'
import { fieldMessageId } from '@/utils/fieldMessageId'
import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormControls'
import { FullPageSpinner } from '@/components/ui/Spinner'

const signInSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
})

type SignInValues = z.infer<typeof signInSchema>

const CURRENT_YEAR = new Date().getFullYear()

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: currentUser, isPending } = useCurrentUser()
  const signIn = useSignIn()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } })

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  if (isPending) return <FullPageSpinner label="Checking your session" />
  if (canSignIn(currentUser)) return <Navigate to={redirectTo} replace />

  function onSubmit(values: SignInValues) {
    signIn.mutate(values, { onSuccess: () => navigate(redirectTo, { replace: true }) })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>

        <main className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Welcome to Paywise</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Manage employee records and compensation for your organisation in one secure place. Available to Admin,
            HR and HR Manager accounts.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Sign in" className="mt-6 space-y-4">
            {signIn.error && (
              <p role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {signIn.error.message}
              </p>
            )}

            <FormField htmlFor="email" label="Email" required error={errors.email?.message}>
              <TextInput
                id="email"
                type="email"
                autoComplete="username"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? fieldMessageId('email') : undefined}
                {...register('email')}
              />
            </FormField>

            <FormField htmlFor="password" label="Password" required error={errors.password?.message}>
              <TextInput
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? fieldMessageId('password') : undefined}
                {...register('password')}
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={signIn.isPending}>
              {signIn.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/*
            Google SSO is postponed — we use email/password sign-in for now.
            <button type="button" onClick={() => authApi.startGoogleSignIn()}>Continue with Google</button>
          */}

          <p className="mt-6 flex gap-2 text-xs leading-relaxed text-slate-500">
            <LockKeyhole className="mt-px size-4 shrink-0 text-slate-400" aria-hidden="true" />
            Access to compensation data is limited by role. You'll be asked to sign in again when your session
            expires.
          </p>
        </main>

        <p className="mt-6 text-center text-xs text-slate-400">© {CURRENT_YEAR} Paywise</p>
      </div>
    </div>
  )
}
