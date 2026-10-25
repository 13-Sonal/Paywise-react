import { useId, type ReactNode } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { employeeFormSchema, type EmployeeFormValues } from '@/features/employees/employeeFormSchema'
import { BLOOD_GROUPS } from '@/types/employee'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FormField, SelectInput, TextArea, TextInput } from '@/components/ui/FormControls'
import { fieldMessageId } from '@/utils/fieldMessageId'

interface EmployeeFormProps {
  defaultValues: EmployeeFormValues
  designationOptions: readonly string[]
  countryOptions: readonly string[]
  submitLabel: string
  onSubmit: (values: EmployeeFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  /** Error returned by the server (or mock) after submitting. */
  submitError: string | null
}

/** Shared by the "Add employee" and "Edit employee" pages. */
export function EmployeeForm({
  defaultValues,
  designationOptions,
  countryOptions,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
    mode: 'onTouched',
  })

  /** Common props for each control: id, register() and accessibility attributes. */
  function fieldProps(name: FieldPath<EmployeeFormValues>) {
    return {
      id: name,
      ...register(name),
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? fieldMessageId(name) : undefined,
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Employee details">
      <Card>
        {submitError && (
          <div role="alert" className="m-5 mb-0 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {submitError}
          </div>
        )}

        <FormSection title="Personal details" description="Basic information used across Paywise.">
          <FormField htmlFor="name" label="Full name" required error={errors.name?.message}>
            <TextInput {...fieldProps('name')} autoComplete="off" />
          </FormField>
          <FormField htmlFor="email" label="Work email" required error={errors.email?.message}>
            <TextInput {...fieldProps('email')} type="email" autoComplete="off" />
          </FormField>
          <FormField htmlFor="bloodGroup" label="Blood group" error={errors.bloodGroup?.message}>
            <SelectInput {...fieldProps('bloodGroup')}>
              <option value="">Not specified</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </FormSection>

        <FormSection title="Employment" description="Role and location within the company.">
          <FormField htmlFor="designation" label="Designation" required error={errors.designation?.message}>
            <SelectInput {...fieldProps('designation')}>
              <option value="">Select a designation</option>
              {designationOptions.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField htmlFor="hireDate" label="Hire date" required error={errors.hireDate?.message}>
            <TextInput {...fieldProps('hireDate')} type="date" />
          </FormField>
          <FormField htmlFor="country" label="Country" required error={errors.country?.message}>
            <SelectInput {...fieldProps('country')}>
              <option value="">Select a country</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </FormSection>

        <FormSection title="Contact" description="How to reach the employee, or someone on their behalf.">
          <FormField
            htmlFor="primaryContactNumber"
            label="Primary contact number"
            required
            error={errors.primaryContactNumber?.message}
          >
            <TextInput {...fieldProps('primaryContactNumber')} type="tel" autoComplete="off" />
          </FormField>
          <FormField
            htmlFor="emergencyContactNumber"
            label="Emergency contact number"
            error={errors.emergencyContactNumber?.message}
          >
            <TextInput {...fieldProps('emergencyContactNumber')} type="tel" autoComplete="off" />
          </FormField>
          <FormField htmlFor="address" label="Address" error={errors.address?.message} className="sm:col-span-2">
            <TextArea {...fieldProps('address')} rows={3} />
          </FormField>
        </FormSection>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <p className="mr-auto text-xs text-slate-500">
            Fields marked <span className="text-red-600">*</span> are required.
          </p>
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  )
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const headingId = useId()
  return (
    <section
      aria-labelledby={headingId}
      className="grid gap-x-8 gap-y-4 border-b border-slate-100 px-5 py-6 lg:grid-cols-3"
    >
      <div>
        <h2 id={headingId} className="text-sm font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">{children}</div>
    </section>
  )
}
