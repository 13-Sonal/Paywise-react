import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'The data could not be loaded. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw className="size-3.5" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}
