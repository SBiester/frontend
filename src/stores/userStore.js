import { defineStore } from 'pinia';
import { apiHelpers } from '@/services/apiClient';

export const useUserStore = defineStore('user', {
  state: () => ({
    // User information
    user: null,
    role: 'fach',

    // Authentication state
    isAuthenticated: false,
    token: null,
    tokenExpiry: null,
    refreshToken: null,
    sessionStartTime: null,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in ms
    autoRefreshInterval: null,

    // UI state
    isLoading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.role === 'admin',
    isPM: (state) => state.role === 'pm',
    isFach: (state) => state.role === 'fach',

    isTokenValid: (state) => {
      if (!state.token || !state.tokenExpiry) return false;
      const now = new Date().getTime();
      const expiry = new Date(state.tokenExpiry).getTime();
      const sessionExpiry = state.sessionStartTime + state.sessionTimeout;
      return now < expiry && now < sessionExpiry;
    },

    isTokenExpiringSoon: (state) => {
      if (!state.token || !state.tokenExpiry) return false;
      const now = new Date().getTime();
      const expiry = new Date(state.tokenExpiry).getTime();
      const fiveMinutes = 5 * 60 * 1000;
      return (expiry - now) < fiveMinutes;
    },

    sessionTimeRemaining: (state) => {
      if (!state.sessionStartTime) return 0;
      const now = new Date().getTime();
      const sessionExpiry = state.sessionStartTime + state.sessionTimeout;
      return Math.max(0, sessionExpiry - now);
    },

    userDisplayName: (state) => {
      return state.user?.name || state.user?.email || 'Unbekannter Benutzer';
    },

    userPermissions: (state) => {
      const permissions = [];

      if (state.isAuthenticated) {
        permissions.push('api:read', 'api:write');

        // Alle authentifizierten Benutzer können Job-Updates erstellen und Aufträge einsehen
        permissions.push('job:create', 'orders:view');

        if (state.role === 'admin') {
          permissions.push('admin:full', 'admin:dashboard', 'admin:users', 'admin:hardware', 'admin:software', 'admin:profiles', 'admin:masterdata', 'admin:orders');
        } else if (state.role === 'pm') {
          permissions.push('job:manage');
        } else if (state.role === 'fach') {
          permissions.push('job:basic');
        }
      }

      return permissions;
    },

    canAccessAdmin: (state) => state.role === 'admin',
    canAccessJobUpdates: (state) => ['admin', 'pm', 'fach'].includes(state.role),
    canAccessOrders: (state) => ['admin', 'pm', 'fach'].includes(state.role),

    hasPermission: (state) => (permission) => {
      return state.userPermissions.includes(permission);
    }
  },

  actions: {
    /**
     * Set user role (legacy compatibility)
     */
    setUserRole(role) {
      this.role = role;
      if (this.user) {
        this.user.role = role;
      }
    },

    /**
     * Switch role (legacy compatibility)
     */
    switchRole() {
      if (this.role === 'fach') {
        this.setUserRole('pm');
      } else {
        this.setUserRole('fach');
      }
    },

    /**
     * Get stored token
     */
    getToken() {
      if (!this.token) {
        this.loadFromStorage();
      }
      return this.isTokenValid ? this.token : null;
    },

    /**
     * Login with credentials
     */
    async login(credentials) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await apiHelpers.post('/auth/login', credentials);

        if (response.success && response.data) {
          this.setAuthData(response.data);
          this.startSession();
          this.setupAutoRefresh();
          this.saveToStorage();
          return { success: true, user: this.user };
        } else {
          throw new Error(response.message || 'Login fehlgeschlagen');
        }
      } catch (error) {
        this.error = apiHelpers.getErrorMessage(error);
        console.error('Login error:', error);
        return {
          success: false,
          error: this.error,
          validationErrors: apiHelpers.getValidationErrors(error)
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Logout user
     */
    async logout() {
      this.isLoading = true;

      try {
        if (this.isAuthenticated) {
          await apiHelpers.post('/auth/logout');
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with logout even if API call fails
      } finally {
        this.clearAuthData();
        this.clearStorage();
        this.stopAutoRefresh();
        this.isLoading = false;
      }
    },

    /**
     * Logout from all devices
     */
    async logoutAll() {
      this.isLoading = true;

      try {
        if (this.isAuthenticated) {
          await apiHelpers.post('/auth/logout-all');
        }
      } catch (error) {
        console.error('Logout all error:', error);
      } finally {
        this.clearAuthData();
        this.clearStorage();
        this.stopAutoRefresh();
        this.isLoading = false;
      }
    },

    /**
     * Refresh authentication token
     */
    async refreshToken() {
      if (!this.token) {
        throw new Error('No token to refresh');
      }

      try {
        const response = await apiHelpers.post('/auth/refresh');

        if (response.success && response.data) {
          this.token = response.data.token;
          this.tokenExpiry = response.data.expires_at;
          if (response.data.refresh_token) {
            this.refreshToken = response.data.refresh_token;
          }
          this.saveToStorage();
          return response.data.token;
        } else {
          throw new Error(response.message || 'Token refresh fehlgeschlagen');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        this.clearAuthData();
        this.clearStorage();
        this.stopAutoRefresh();
        throw error;
      }
    },

    /**
     * Get current user info from API
     */
    async fetchUser() {
      if (!this.isTokenValid) {
        return null;
      }

      try {
        const response = await apiHelpers.get('/auth/user');

        if (response.success && response.data) {
          this.user = response.data.user;
          this.role = response.data.user.role;
          this.saveToStorage();
          return this.user;
        }
      } catch (error) {
        console.error('Fetch user error:', error);
        if (apiHelpers.isAuthError(error)) {
          this.clearAuthData();
          this.clearStorage();
          this.stopAutoRefresh();
        }
        return null;
      }
    },

    /**
     * Check if token is still valid
     */
    async checkAuth() {
      if (!this.token) {
        return false;
      }

      try {
        const response = await apiHelpers.get('/auth/check');
        return response.success && response.data?.valid;
      } catch (error) {
        console.error('Auth check error:', error);
        if (apiHelpers.isAuthError(error)) {
          this.clearAuthData();
          this.clearStorage();
          this.stopAutoRefresh();
        }
        return false;
      }
    },

    /**
     * Set authentication data
     */
    setAuthData(authData) {
      this.token = authData.token;
      this.tokenExpiry = authData.expires_at;
      this.refreshToken = authData.refresh_token || null;
      this.user = authData.user;
      this.role = authData.user?.role || 'fach';
      this.isAuthenticated = true;
      this.error = null;
    },

    /**
     * Clear authentication data
     */
    clearAuthData() {
      this.token = null;
      this.tokenExpiry = null;
      this.refreshToken = null;
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
      this.role = 'fach'; // Default role
      this.sessionStartTime = null;
    },

    /**
     * Save auth data to localStorage
     */
    saveToStorage() {
      try {
        const authData = {
          token: this.token,
          tokenExpiry: this.tokenExpiry,
          refreshToken: this.refreshToken,
          user: this.user,
          role: this.role,
          sessionStartTime: this.sessionStartTime,
          timestamp: new Date().getTime()
        };
        localStorage.setItem('job-update-auth', JSON.stringify(authData));
      } catch (error) {
        console.error('Failed to save auth data to storage:', error);
      }
    },

    /**
     * Load auth data from localStorage
     */
    loadFromStorage() {
      try {
        const stored = localStorage.getItem('job-update-auth');
        if (stored) {
          const authData = JSON.parse(stored);

          // Check if data is not too old (max 30 days)
          const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
          if (authData.timestamp && (new Date().getTime() - authData.timestamp) < maxAge) {
            this.token = authData.token;
            this.tokenExpiry = authData.tokenExpiry;
            this.refreshToken = authData.refreshToken;
            this.user = authData.user;
            this.role = authData.role || 'fach';
            this.sessionStartTime = authData.sessionStartTime;
            this.isAuthenticated = !!authData.token;
          } else {
            this.clearStorage();
          }
        }
      } catch (error) {
        console.error('Failed to load auth data from storage:', error);
        this.clearStorage();
      }
    },

    /**
     * Clear stored auth data
     */
    clearStorage() {
      try {
        localStorage.removeItem('job-update-auth');
      } catch (error) {
        console.error('Failed to clear auth storage:', error);
      }
    },

    /**
     * Initialize store (call on app startup)
     */
    initialize() {
      this.loadFromStorage();

      // If we have a token, verify it's still valid
      if (this.token && this.isTokenValid) {
        this.setupAutoRefresh();
        this.checkAuth().then(isValid => {
          if (!isValid) {
            this.clearAuthData();
            this.clearStorage();
            this.stopAutoRefresh();
          }
        });
      } else if (this.token) {
        // Token exists but is invalid, clear everything
        this.clearAuthData();
        this.clearStorage();
      }
    },

    /**
     * Start user session
     */
    startSession() {
      this.sessionStartTime = new Date().getTime();
    },

    /**
     * Setup automatic token refresh
     */
    setupAutoRefresh() {
      this.stopAutoRefresh(); // Clear any existing interval

      if (!this.token) return;

      // Check every 5 minutes for token refresh needs
      this.autoRefreshInterval = setInterval(async () => {
        if (!this.isAuthenticated || !this.isTokenValid) {
          this.stopAutoRefresh();
          return;
        }

        // If session expired, logout
        if (this.sessionTimeRemaining <= 0) {
          console.log('Session expired, logging out');
          await this.logout();
          return;
        }

        // If token is expiring soon, refresh it
        if (this.isTokenExpiringSoon) {
          try {
            console.log('Token expiring soon, refreshing...');
            await this.refreshToken();
          } catch (error) {
            console.error('Auto-refresh failed:', error);
            await this.logout();
          }
        }
      }, 5 * 60 * 1000); // 5 minutes
    },

    /**
     * Stop automatic token refresh
     */
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },

    /**
     * Extend session (call on user activity)
     */
    extendSession() {
      if (this.isAuthenticated && this.sessionTimeRemaining > 0) {
        this.sessionStartTime = new Date().getTime();
        this.saveToStorage();
      }
    },

    /**
     * Get session info for UI display
     */
    getSessionInfo() {
      if (!this.isAuthenticated) return null;

      const timeRemaining = this.sessionTimeRemaining;
      const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
      const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

      return {
        timeRemaining,
        hoursRemaining: hours,
        minutesRemaining: minutes,
        isExpiringSoon: timeRemaining < (30 * 60 * 1000), // 30 minutes
        formattedTime: `${hours}h ${minutes}m`
      };
    }
  }
});