import { Link } from 'react-router'
import type { Employee } from '@/types/employee'
import { formatDate } from '@/utils/format'
import { Avatar } from '@/components/ui/Avatar'

export function RecentHiresList({ employees }: { employees: Employee[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {employees.map((employee) => (
        <li key={employee.id}>
          <Link
            to={`/employees/${employee.id}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 focus-visible:bg-slate-50"
          >
            <Avatar name={employee.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{employee.name}</p>
              <p className="truncate text-xs text-slate-500">
                {employee.designation} · {employee.country}
              </p>
            </div>
            <span className="text-xs whitespace-nowrap text-slate-500">{formatDate(employee.hireDate)}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
