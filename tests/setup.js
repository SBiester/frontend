import { beforeEach, vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock global objects
global.console = {
  ...console,
  // Suppress console output in tests unless needed
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock fetch globally
global.fetch = vi.fn()

// Setup Vue Test Utils global config
config.global.stubs = {
  // Stub out router-link and router-view if needed
  'router-link': true,
  'router-view': true,
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()

  // Reset fetch mock
  fetch.mockClear()
})