import { COUNTRIES, DESIGNATIONS } from './sampleOptions'
import { BLOOD_GROUPS, type Employee } from '@/types/employee'
import { COUNTRY_PROFILES } from './countryProfiles'
import { createRandom } from './random'

/** Enough rows to exercise pagination; the UI never renders more than one page at once. */
export const MOCK_EMPLOYEE_COUNT = 1200

const DAY_IN_MS = 24 * 60 * 60 * 1000

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function toEmailPart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '')
}

/**
 * Builds a deterministic list of employees. Hire dates are relative to `today`
 * so the dashboard always shows some "hired this month" employees.
 */
export function generateMockEmployees(count = MOCK_EMPLOYEE_COUNT, today = new Date()): Employee[] {
  const random = createRandom(20261025)
  const usedEmails = new Set<string>()
  const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const daysIntoMonth = today.getUTCDate() - 1

  return Array.from({ length: count }, (_, index) => {
    const country = random.pick(COUNTRIES)
    const profile = COUNTRY_PROFILES[country]
    const firstName = random.pick(profile.firstNames)
    const lastName = random.pick(profile.lastNames)

    let email = `${toEmailPart(firstName)}.${toEmailPart(lastName)}@paywise.example`
    if (usedEmails.has(email)) {
      email = `${toEmailPart(firstName)}.${toEmailPart(lastName)}${index + 1}@paywise.example`
    }
    usedEmails.add(email)

    // The first few employees are recent hires so "hired this month" is never empty.
    const daysAgo = index < 9 ? random.integer(0, daysIntoMonth) : random.integer(0, 8 * 365)
    const phoneDigits = () => `${random.integer(100, 999)} ${random.integer(1000, 9999)}`

    return {
      id: `emp_${String(index + 1).padStart(5, '0')}`,
      name: `${firstName} ${lastName}`,
      email,
      designation: random.pick(DESIGNATIONS),
      country,
      hireDate: toIsoDate(new Date(startOfToday - daysAgo * DAY_IN_MS)),
      primaryContactNumber: `${profile.phonePrefix} ${phoneDigits()}`,
      emergencyContactNumber: random.next() < 0.85 ? `${profile.phonePrefix} ${phoneDigits()}` : null,
      address:
        random.next() < 0.9
          ? `${random.integer(1, 220)} ${random.pick(profile.streets)}, ${random.pick(profile.cities)}`
          : null,
      bloodGroup: random.next() < 0.9 ? random.pick(BLOOD_GROUPS) : null,
    }
  })
}
