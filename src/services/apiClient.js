import axios from 'axios'

// Create axios instance with base configuration
// For development, use relative path when running through Vite proxy
// For production, use full URL
const getBaseURL = () => {
  // If we're in development and running through Vite proxy, use relative path
  if (import.meta.env.DEV) {
    return '/api'
  }
  // For production or direct API access, use full URL
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  withCredentials: true, // Enable secure cookies
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
  },
})

// Request fingerprinting for enhanced security
const generateRequestFingerprint = (config) => {
  const timestamp = Date.now()
  const method = config.method?.toUpperCase()
  const url = config.url
  const dataHash = config.data ? btoa(JSON.stringify(config.data)).slice(0, 16) : ''
  return btoa(`${method}:${url}:${timestamp}:${dataHash}`)
}

// Request interceptor to add auth token and security headers
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage directly to avoid store issues
    const authData = localStorage.getItem('job-update-auth')
    let token = null
    let sessionStartTime = null

    if (authData) {
      try {
        const parsedData = JSON.parse(authData)
        token = parsedData.token
        sessionStartTime = parsedData.sessionStartTime

        // Check if session is still valid (24 hours)
        const sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours
        if (sessionStartTime && Date.now() - sessionStartTime > sessionTimeout) {
          console.warn('Session expired, clearing auth data')
          localStorage.removeItem('job-update-auth')
          token = null
        }
      } catch (e) {
        console.error('Failed to parse auth data:', e)
        localStorage.removeItem('job-update-auth') // Clean up corrupted data
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken
    }

    // Add security headers
    config.headers['X-Timestamp'] = Date.now().toString()
    config.headers['X-Request-ID'] = generateRequestFingerprint(config)

    // Add user agent info for security tracking
    if (navigator.userAgent) {
      config.headers['X-Client-Info'] = btoa(navigator.userAgent.slice(0, 100))
    }

    // Sanitize sensitive data from logs
    const logHeaders = { ...config.headers }
    if (logHeaders.Authorization) {
      logHeaders.Authorization = 'Bearer [REDACTED]'
    }
    if (logHeaders['X-CSRF-TOKEN']) {
      logHeaders['X-CSRF-TOKEN'] = '[REDACTED]'
    }

    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: logHeaders,
      timestamp: new Date().toISOString(),
    })

    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  },
)

// Response interceptor for security and error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses (without sensitive data)
    console.log(
      `✅ API Response: ${response.status} ${response.config?.method?.toUpperCase()} ${response.config?.url}`,
    )

    // Check for security warnings in response headers
    const securityWarning = response.headers['x-security-warning']
    if (securityWarning) {
      console.warn('Security Warning:', securityWarning)
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Enhanced error logging
    const errorInfo = {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    }

    console.error('❌ API Error:', errorInfo)

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('Authentication failed, clearing stored auth data')
      localStorage.removeItem('job-update-auth')

      // Don't retry login requests to avoid infinite loops
      if (!originalRequest.url?.includes('/auth/login')) {
        // Redirect to login or trigger auth modal
        window.dispatchEvent(new CustomEvent('auth-required'))
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      console.warn(`Rate limited. Retry after: ${retryAfter} seconds`)

      if (retryAfter && !originalRequest._retryCount) {
        originalRequest._retryCount = 1
        const delay = parseInt(retryAfter) * 1000

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(apiClient(originalRequest))
          }, delay)
        })
      }
    }

    // Handle CSRF token mismatch
    if (error.response?.status === 419) {
      console.warn('CSRF token mismatch, attempting to refresh')
      // Could implement CSRF token refresh here
    }

    // Handle server errors with exponential backoff
    if (error.response?.status >= 500 && !originalRequest._retryCount) {
      originalRequest._retryCount = 1
      const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount), 10000)

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          apiClient(originalRequest).then(resolve).catch(reject)
        }, delay)
      })
    }

    return Promise.reject(error)
  },
)

// Helper functions for common API patterns
export const apiHelpers = {
  /**
   * Get data with error handling
   */
  async get(url, config = {}) {
    try {
      const response = await apiClient.get(url, config)
      return response.data
    } catch (error) {
      console.error(`Failed to GET ${url}:`, error)
      throw error
    }
  },

  /**
   * Post data with error handling
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await apiClient.post(url, data, config)
      return response.data
    } catch (error) {
      console.error(`Failed to POST ${url}:`, error)
      throw error
    }
  },

  /**
   * Put data with error handling
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await apiClient.put(url, data, config)
      return response.data
    } catch (error) {
      console.error(`Failed to PUT ${url}:`, error)
      throw error
    }
  },

  /**
   * Delete with error handling
   */
  async delete(url, config = {}) {
    try {
      const response = await apiClient.delete(url, config)
      return response.data
    } catch (error) {
      console.error(`Failed to DELETE ${url}:`, error)
      throw error
    }
  },

  /**
   * Upload file with progress tracking
   */
  async upload(url, formData, onUploadProgress = null) {
    try {
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      })
      return response.data
    } catch (error) {
      console.error(`Failed to upload to ${url}:`, error)
      throw error
    }
  },

  /**
   * Check if error is authentication related
   */
  isAuthError(error) {
    return error.response?.status === 401 || error.response?.status === 403
  },

  /**
   * Check if error is rate limit related
   */
  isRateLimitError(error) {
    return error.response?.status === 429
  },

  /**
   * Check if error is server related
   */
  isServerError(error) {
    return error.response?.status >= 500
  },

  /**
   * Extract error message from response
   */
  getErrorMessage(error) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Ein unbekannter Fehler ist aufgetreten'
    )
  },

  /**
   * Extract validation errors from response
   */
  getValidationErrors(error) {
    return error.response?.data?.errors || {}
  },
}

export default apiClient
