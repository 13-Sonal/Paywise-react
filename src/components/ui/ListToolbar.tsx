import { Search, X } from 'lucide-react'
import { SelectInput, TextInput } from './FormControls'

export interface ToolbarFilter {
  id: string
  label: string
  /** Text of the empty option, e.g. "All countries". */
  allLabel: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}

interface ListToolbarProps {
  searchLabel: string
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters: ToolbarFilter[]
  hasActiveCriteria: boolean
  onClear: () => void
}

/** Search box + dropdown filters shown above a data table. */
export function ListToolbar({
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  hasActiveCriteria,
  onClear,
}: ListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
      <div className="relative lg:max-w-xs lg:flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <TextInput
          type="search"
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {filters.map((filter) => (
          <SelectInput
            key={filter.id}
            aria-label={filter.label}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            className="sm:w-52"
          >
            <option value="">{filter.allLabel}</option>
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        ))}
      </div>

      {hasActiveCriteria && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 self-start rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:self-auto"
        >
          <X className="size-4" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  )
}
