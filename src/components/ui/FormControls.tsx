import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { fieldMessageId } from '@/utils/fieldMessageId'

/**
 * Plain styled form controls. They accept every native attribute, including
 * `ref`, so React Hook Form's `register()` can be spread straight onto them.
 */
const controlClasses =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs ' +
  'placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none ' +
  'aria-invalid:border-red-400 aria-invalid:focus:ring-red-500/20 disabled:bg-slate-50 disabled:text-slate-500'

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, 'h-9', className)} {...props} />
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClasses, 'h-9 pr-8', className)} {...props} />
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClasses, 'py-2', className)} {...props} />
}

interface FormFieldProps {
  /** Must match the `id` of the control inside. */
  htmlFor: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}

/** Label + control + hint/error message. Pass `aria-describedby={fieldMessageId(id)}` to the control. */
export function FormField({ htmlFor, label, required, error, hint, className, children }: FormFieldProps) {
  const message = error ?? hint
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-red-600">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {children}
      {message && (
        <p id={fieldMessageId(htmlFor)} className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-slate-500')}>
          {message}
        </p>
      )}
    </div>
  )
}
