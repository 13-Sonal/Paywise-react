import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { useUpdateSalary } from '@/features/salaries/useSalaries'
import type { SalaryRecord } from '@/types/salary'
import { fieldMessageId } from '@/utils/fieldMessageId'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormControls'
import { Modal } from '@/components/ui/Modal'

const salaryFormSchema = z.object({
  compensation: z
    .string()
    .trim()
    .min(1, 'Compensation is required')
    .refine((value) => Number(value) > 0, 'Compensation must be greater than 0'),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Use a 3-letter currency code, e.g. INR'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
})

type SalaryFormValues = z.infer<typeof salaryFormSchema>

interface EditSalaryDialogProps {
  record: SalaryRecord
  onClose: () => void
}

export function EditSalaryDialog({ record, onClose }: EditSalaryDialogProps) {
  const updateSalary = useUpdateSalary()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      compensation: String(record.compensation),
      currency: record.currency,
      effectiveDate: record.effectiveDate,
    },
  })

  function onSubmit(values: SalaryFormValues) {
    updateSalary.mutate(
      {
        id: record.id,
        update: {
          compensation: Number(values.compensation),
          currency: values.currency.toUpperCase(),
          effectiveDate: values.effectiveDate,
        },
      },
      { onSuccess: onClose },
    )
  }

  /** id, register() and accessibility attributes for one field. */
  function fieldProps(name: keyof SalaryFormValues) {
    return {
      id: name,
      ...register(name),
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? fieldMessageId(name) : undefined,
    }
  }

  return (
    <Modal title="Update salary" description={`${record.employeeName} · ${record.designation}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4 px-5 py-5">
          {updateSalary.error && (
            <p role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {updateSalary.error.message}
            </p>
          )}
          <div className="grid grid-cols-3 gap-3">
            <FormField
              htmlFor="compensation"
              label="Annual compensation"
              required
              error={errors.compensation?.message}
              className="col-span-2"
            >
              <TextInput {...fieldProps('compensation')} type="number" inputMode="decimal" min="0" step="any" />
            </FormField>
            <FormField htmlFor="currency" label="Currency" required error={errors.currency?.message}>
              <TextInput {...fieldProps('currency')} maxLength={3} className="uppercase" />
            </FormField>
          </div>
          <FormField htmlFor="effectiveDate" label="Effective from" required error={errors.effectiveDate?.message}>
            <TextInput {...fieldProps('effectiveDate')} type="date" />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button variant="secondary" onClick={onClose} disabled={updateSalary.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateSalary.isPending}>
            {updateSalary.isPending ? 'Saving…' : 'Save salary'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
