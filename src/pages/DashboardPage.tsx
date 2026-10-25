import { Briefcase, CalendarPlus, Globe2, UserPlus, Users } from 'lucide-react'
import { useEmployeeSummary } from '@/features/employees/useEmployees'
import { formatNumber } from '@/utils/format'
import { CountryDistribution } from '@/components/employees/CountryDistribution'
import { RecentHiresList } from '@/components/employees/RecentHiresList'
import { PageHeader } from '@/components/layout/PageHeader'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { StatCard } from '@/components/ui/StatCard'

// Computed once when the module loads; fine for a label like "October 2026".
const CURRENT_MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())

/** Headcount overview. Deliberately shows no compensation data. */
export function DashboardPage() {
  const { data: summary, isPending, isError, refetch } = useEmployeeSummary()

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your workforce."
        breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <ButtonLink to="/employees/new">
            <UserPlus className="size-4" aria-hidden="true" />
            Add employee
          </ButtonLink>
        }
      />

      {isError ? (
        <Card>
          <ErrorState title="We couldn't load the dashboard" onRetry={() => void refetch()} />
        </Card>
      ) : isPending ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total employees" value={formatNumber(summary.totalEmployees)} icon={Users} />
            <StatCard
              label="Hired this month"
              value={formatNumber(summary.hiredThisMonth)}
              icon={CalendarPlus}
              hint={CURRENT_MONTH_LABEL}
            />
            <StatCard label="Countries" value={formatNumber(summary.countryCount)} icon={Globe2} />
            <StatCard label="Designations" value={formatNumber(summary.designationCount)} icon={Briefcase} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader
                title="Recent hires"
                description="The newest members of the team."
                actions={
                  <ButtonLink to="/employees" variant="ghost" size="sm">
                    View all
                  </ButtonLink>
                }
              />
              <RecentHiresList employees={summary.recentHires} />
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Employees by country" description="Headcount distribution." />
              <div className="p-5">
                <CountryDistribution data={summary.employeesByCountry} total={summary.totalEmployees} />
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-[118px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-3" />
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-2" />
      </div>
    </div>
  )
}
