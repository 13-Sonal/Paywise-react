/** Id of the hint/error text under a form control, for linking it with `aria-describedby`. */
export function fieldMessageId(fieldId: string): string {
  return `${fieldId}-message`
}
