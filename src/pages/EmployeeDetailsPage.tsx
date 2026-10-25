import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import { ArrowLeft, Pencil, UserX } from 'lucide-react'
import { useEmployee } from '@/features/employees/useEmployees'
import { formatDate } from '@/utils/format'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'

export function EmployeeDetailsPage() {
  const { id = '' } = useParams()
  const { data: employee, isPending, isError, error, refetch } = useEmployee(id)
  const notFound = !isPending && !isError && employee === null

  const breadcrumbs = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Employees', to: '/employees' },
    { label: employee?.name ?? 'Employee details' },
  ]

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading employee" />
      </div>
    )
  }

  if (isError || notFound) {
    return (
      <>
        <PageHeader title="Employee details" breadcrumbs={breadcrumbs} />
        <Card>
          {notFound ? (
            <EmptyState icon={UserX} title="Employee not found" description="This employee doesn't exist or was removed." />
          ) : (
            <ErrorState title="We couldn't load this employee" message={error?.message} onRetry={() => void refetch()} />
          )}
          <div className="flex justify-center pb-8">
            <ButtonLink to="/employees" variant="ghost" size="sm">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to employees
            </ButtonLink>
          </div>
        </Card>
      </>
    )
  }

  if (!employee) return null

  return (
    <>
      <PageHeader
        title={employee.name}
        breadcrumbs={breadcrumbs}
        actions={
          <ButtonLink to={`/employees/${employee.id}/edit`}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </ButtonLink>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:row-span-2">
          <div className="flex flex-col items-center text-center">
            <Avatar name={employee.name} size="lg" />
            <p className="mt-3 text-base font-semibold text-slate-900">{employee.name}</p>
            <p className="text-sm text-slate-500">{employee.email}</p>
            <div className="mt-3">
              <Badge tone="brand">{employee.designation}</Badge>
            </div>
          </div>
          <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <SummaryRow label="Employee ID" value={employee.id} />
            <SummaryRow label="Country" value={employee.country} />
            <SummaryRow label="Hire date" value={employee.hireDate ? formatDate(employee.hireDate) : '—'} />
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Employment" />
          <DetailList>
            <DetailItem label="Designation" value={employee.designation} />
            <DetailItem label="Hire date" value={employee.hireDate ? formatDate(employee.hireDate) : null} />
            <DetailItem label="Country" value={employee.country} />
          </DetailList>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Contact & personal" description="Visible only on this page, not in employee lists." />
          <DetailList>
            <DetailItem label="Work email" value={employee.email} />
            <DetailItem label="Primary contact number" value={employee.primaryContactNumber || null} />
            <DetailItem label="Emergency contact number" value={employee.emergencyContactNumber} />
            <DetailItem label="Blood group" value={employee.bloodGroup} />
            <DetailItem label="Address" value={employee.address} wide />
          </DetailList>
        </Card>
      </div>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  )
}

function DetailList({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2">{children}</dl>
}

function DetailItem({ label, value, wide }: { label: string; value: string | null; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value ?? <span className="text-slate-400">Not provided</span>}</dd>
    </div>
  )
}
