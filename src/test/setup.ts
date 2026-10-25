import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { clearSession } from '@/services/sessionStore'
import { stubRailsApi } from './railsApiStub'

// jsdom doesn't implement scrolling; React Router's <ScrollRestoration> calls it.
vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

beforeEach(() => {
  stubRailsApi()
})

afterEach(() => {
  cleanup()
  clearSession()
  vi.unstubAllGlobals()
})
