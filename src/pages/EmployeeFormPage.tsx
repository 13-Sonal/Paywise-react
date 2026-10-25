import { useNavigate, useParams } from 'react-router'
import {
  EMPTY_EMPLOYEE_FORM,
  toEmployeeFormValues,
  toEmployeeInput,
  type EmployeeFormValues,
} from '@/features/employees/employeeFormSchema'
import {
  useCreateEmployee,
  useEmployee,
  useEmployeeOptions,
  useUpdateEmployee,
} from '@/features/employees/useEmployees'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'

/** `/employees/new` and `/employees/:id/edit` both render this page. */
export function EmployeeFormPage() {
  const { id } = useParams()
  return id ? <EditEmployee id={id} /> : <CreateEmployee />
}

function CreateEmployee() {
  const navigate = useNavigate()
  const createEmployee = useCreateEmployee()
  const options = useEmployeeOptions()

  function handleSubmit(values: EmployeeFormValues) {
    createEmployee.mutate(toEmployeeInput(values), {
      onSuccess: (employee) => navigate(`/employees/${employee.id}`),
    })
  }

  return (
    <>
      <PageHeader
        title="Add employee"
        description="Create a new employee record."
        breadcrumbs={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Employees', to: '/employees' },
          { label: 'Add employee' },
        ]}
      />
      <EmployeeForm
        defaultValues={EMPTY_EMPLOYEE_FORM}
        designationOptions={options.designations}
        countryOptions={options.countries}
        submitLabel="Create employee"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employees')}
        isSubmitting={createEmployee.isPending}
        submitError={createEmployee.error?.message ?? null}
      />
    </>
  )
}

function EditEmployee({ id }: { id: string }) {
  const navigate = useNavigate()
  const { data: employee, isPending, isError, error, refetch } = useEmployee(id)
  const updateEmployee = useUpdateEmployee(id)
  const options = useEmployeeOptions()

  const breadcrumbs = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Employees', to: '/employees' },
    ...(employee ? [{ label: employee.name, to: `/employees/${id}` }] : []),
    { label: 'Edit' },
  ]

  function handleSubmit(values: EmployeeFormValues) {
    updateEmployee.mutate(toEmployeeInput(values), {
      onSuccess: () => navigate(`/employees/${id}`),
    })
  }

  return (
    <>
      <PageHeader title="Edit employee" description="Update this employee's record." breadcrumbs={breadcrumbs} />
      {isPending ? (
        <div className="flex justify-center py-24">
          <Spinner label="Loading employee" />
        </div>
      ) : isError || !employee ? (
        <Card>
          <ErrorState
            title={isError ? "We couldn't load this employee" : 'Employee not found'}
            message={error?.message ?? "This employee doesn't exist or was removed."}
            onRetry={() => void refetch()}
          />
        </Card>
      ) : (
        <EmployeeForm
          // `key` makes React create a fresh form if a different employee is loaded.
          key={employee.id}
          defaultValues={toEmployeeFormValues(employee)}
          designationOptions={options.designations}
          countryOptions={options.countries}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/employees/${id}`)}
          isSubmitting={updateEmployee.isPending}
          submitError={updateEmployee.error?.message ?? null}
        />
      )}
    </>
  )
}
