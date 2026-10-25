import { z } from 'zod'
import { BLOOD_GROUPS, type Employee } from '@/types/employee'

/**
 * Shape of one user in `GET /api/v1/users` (Rails `as_json`, snake_case).
 *
 * Zod checks the response at the boundary, so a contract change in Rails
 * shows up as a clear error instead of blank cells. Unknown keys (such as
 * `password_digest`, which Rails should stop sending) are dropped here.
 */
const railsUserSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  name: z.string(),
  email: z.string(),
  role_id: z.number().nullable().optional(),
  // Present once Rails includes the role: `include: { role: { only: [:id, :name] } }`.
  role: z.object({ name: z.string() }).nullable().optional(),
  hire_date: z.string().nullable(),
  country_code: z.string().nullable(),
  primary_contact_number: z.string().nullable(),
  emergency_contact_number: z.string().nullable(),
  address: z.string().nullable(),
  blood_group: z.string().nullable(),
})

type RailsUser = z.infer<typeof railsUserSchema>

export const railsUserListSchema = z.array(railsUserSchema)

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })

/** "IN" → "India". Falls back to the raw code if it isn't a known region. */
export function countryNameFromCode(code: string | null): string {
  if (!code) return 'Unknown'
  try {
    return countryNames.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

function toBloodGroup(value: string | null): Employee['bloodGroup'] {
  const normalized = value?.trim().toUpperCase()
  return BLOOD_GROUPS.find((group) => group === normalized) ?? null
}

/** Converts a Rails user into the frontend `Employee` type. */
export function toEmployee(user: RailsUser): Employee {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    designation: user.role?.name ?? (user.role_id ? `Role #${user.role_id}` : 'Unassigned'),
    country: countryNameFromCode(user.country_code),
    hireDate: user.hire_date ?? '',
    primaryContactNumber: user.primary_contact_number ?? '',
    emergencyContactNumber: user.emergency_contact_number || null,
    address: user.address || null,
    bloodGroup: toBloodGroup(user.blood_group),
  }
}
