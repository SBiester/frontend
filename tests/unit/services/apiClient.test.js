import { describe, it, expect, beforeEach, vi } from 'vitest'
import apiClient from '@/services/apiClient'

// Mock fetch
global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    fetch.mockClear()
    // Clear any stored tokens
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('GET requests', () => {
    it('makes GET request successfully', async () => {
      const mockResponse = { data: 'test' }
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      })

      const result = await apiClient.get('/test-endpoint')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('includes authorization header when token is present', async () => {
      localStorage.setItem('auth_token', 'test-token')

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await apiClient.get('/test-endpoint')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('POST requests', () => {
    it('makes POST request with data', async () => {
      const testData = { name: 'test', value: 123 }
      const mockResponse = { success: true }

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      })

      const result = await apiClient.post('/test-endpoint', testData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(testData)
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('PUT requests', () => {
    it('makes PUT request with data', async () => {
      const testData = { id: 1, name: 'updated' }
      const mockResponse = { updated: true }

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      })

      const result = await apiClient.put('/test-endpoint/1', testData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(testData)
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('DELETE requests', () => {
    it('makes DELETE request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({})
      })

      await apiClient.delete('/test-endpoint/1')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint/1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Error handling', () => {
    it('throws error for HTTP error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Resource not found' })
      })

      await expect(apiClient.get('/non-existent')).rejects.toThrow()
    })

    it('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow('Network error')
    })

    it('handles 401 unauthorized responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Unauthorized' })
      })

      await expect(apiClient.get('/protected-endpoint')).rejects.toThrow()
    })

    it('handles 403 forbidden responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Insufficient permissions' })
      })

      await expect(apiClient.get('/admin-endpoint')).rejects.toThrow()
    })

    it('handles 422 validation errors', async () => {
      const validationErrors = {
        errors: {
          email: ['Email is required'],
          name: ['Name must be at least 2 characters']
        }
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => validationErrors
      })

      await expect(apiClient.post('/users', {})).rejects.toThrow()
    })
  })

  describe('Request configuration', () => {
    it('includes CSRF token when available', async () => {
      // Mock CSRF token in meta tag
      const mockMetaTag = { getAttribute: vi.fn().mockReturnValue('csrf-token-123') }
      vi.stubGlobal('document', {
        querySelector: vi.fn().mockReturnValue(mockMetaTag)
      })

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await apiClient.post('/test-endpoint', {})

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-TOKEN': 'csrf-token-123'
          })
        })
      )
    })

    it('handles requests without CSRF token gracefully', async () => {
      vi.stubGlobal('document', {
        querySelector: vi.fn().mockReturnValue(null)
      })

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await expect(apiClient.post('/test-endpoint', {})).resolves.toBeDefined()
    })
  })
})