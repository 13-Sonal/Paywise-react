import { z } from 'zod'
import { BLOOD_GROUPS, type Employee, type EmployeeInput } from '@/types/employee'

// Digits, spaces, dashes, brackets and an optional leading "+", 7–20 characters.
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/
const PHONE_MESSAGE = 'Enter a valid phone number, e.g. +91 98765 43210'

/**
 * Client-side validation for the create/edit employee form. It gives quick
 * feedback only — Rails must validate again because browser checks can be
 * bypassed.
 *
 * Every field is a string because HTML inputs produce strings; empty optional
 * fields are converted to `null` in `toEmployeeInput`.
 */
export const employeeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  designation: z.string().min(1, 'Designation is required'),
  hireDate: z
    .string()
    .min(1, 'Hire date is required')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date'),
  country: z.string().min(1, 'Country is required'),
  primaryContactNumber: z.string().trim().min(1, 'Primary contact number is required').regex(PHONE_PATTERN, PHONE_MESSAGE),
  emergencyContactNumber: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_PATTERN.test(value), PHONE_MESSAGE),
  address: z.string().trim().max(250, 'Address must be 250 characters or fewer'),
  bloodGroup: z.union([z.enum(BLOOD_GROUPS), z.literal('')]),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  name: '',
  email: '',
  designation: '',
  hireDate: '',
  country: '',
  primaryContactNumber: '',
  emergencyContactNumber: '',
  address: '',
  bloodGroup: '',
}

export function toEmployeeFormValues(employee: Employee): EmployeeFormValues {
  return {
    name: employee.name,
    email: employee.email,
    designation: employee.designation,
    hireDate: employee.hireDate,
    country: employee.country,
    primaryContactNumber: employee.primaryContactNumber,
    emergencyContactNumber: employee.emergencyContactNumber ?? '',
    address: employee.address ?? '',
    bloodGroup: employee.bloodGroup ?? '',
  }
}

export function toEmployeeInput(values: EmployeeFormValues): EmployeeInput {
  return {
    ...values,
    email: values.email.toLowerCase(),
    emergencyContactNumber: values.emergencyContactNumber || null,
    address: values.address || null,
    bloodGroup: values.bloodGroup || null,
  }
}
