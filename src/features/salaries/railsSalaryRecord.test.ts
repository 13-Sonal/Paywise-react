import { describe, expect, it } from 'vitest'
import { railsSalaryRecordListSchema, toSalaryRecord } from './railsSalaryRecord'

describe('toSalaryRecord', () => {
  it('maps a record exactly as Rails returns it today', () => {
    const [record] = railsSalaryRecordListSchema.parse([
      {
        id: 10002,
        user_id: 2,
        compensation: '4465183.0',
        currency: 'INR',
        effective_from: '2023-05-22',
        created_at: '2026-10-25T10:32:43.631Z',
        updated_at: '2026-10-25T10:32:43.631Z',
        role_id: 10,
        role: { id: 10, name: 'Technical Manager' },
      },
    ])

    expect(toSalaryRecord(record)).toEqual({
      id: '10002',
      employeeId: '2',
      employeeName: 'User #2',
      designation: 'Technical Manager',
      country: 'Unknown',
      compensation: 4465183,
      currency: 'INR',
      effectiveDate: '2023-05-22',
    })
  })
})
