<template>
  <div class="login-modal-overlay" v-if="show" @click="handleOverlayClick">
    <div class="login-modal" @click.stop>
      <div class="login-header">
        <h2>Anmeldung</h2>
        <button class="close-button" @click="$emit('close')" :disabled="isLoading">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="login-content">
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Error Display -->
          <div v-if="error" class="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {{ error }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            {{ successMessage }}
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email">E-Mail-Adresse</label>
            <input
              id="email"
              type="email"
              v-model="form.email"
              :disabled="isLoading"
              :class="{ 'error': validationErrors.email }"
              placeholder="ihre.email@example.com"
              required
              autocomplete="email"
            >
            <span v-if="validationErrors.email" class="field-error">
              {{ validationErrors.email[0] }}
            </span>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Passwort</label>
            <div class="password-input">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                :disabled="isLoading"
                :class="{ 'error': validationErrors.password }"
                placeholder="Ihr Passwort"
                required
                autocomplete="current-password"
                minlength="8"
              >
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :disabled="isLoading"
              >
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <span v-if="validationErrors.password" class="field-error">
              {{ validationErrors.password[0] }}
            </span>
          </div>

          <!-- Remember Me -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="form.remember"
                :disabled="isLoading"
              >
              <span class="checkmark"></span>
              Angemeldet bleiben
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="login-button"
            :disabled="isLoading || !isFormValid"
          >
            <svg v-if="isLoading" class="loading-icon" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
            <span v-if="!isLoading">Anmelden</span>
            <span v-else>Wird angemeldet...</span>
          </button>
        </form>

        <!-- Additional Options -->
        <div class="login-footer">
          <button
            type="button"
            class="link-button"
            @click="showForgotPassword = !showForgotPassword"
            :disabled="isLoading"
          >
            Passwort vergessen?
          </button>
        </div>

        <!-- Test Login Credentials -->
        <div class="test-credentials" v-if="!isLoading">
          <h4>Test-Zugangsdaten:</h4>
          <div class="credentials-grid">
            <div class="credential-item" @click="fillCredentials('admin@jobupdate.com', 'password123')">
              <strong>Admin:</strong> admin@jobupdate.com / password123
            </div>
            <div class="credential-item" @click="fillCredentials('pm@jobupdate.com', 'password123')">
              <strong>PM:</strong> pm@jobupdate.com / password123
            </div>
            <div class="credential-item" @click="fillCredentials('user@jobupdate.com', 'password123')">
              <strong>User:</strong> user@jobupdate.com / password123
            </div>
          </div>
        </div>

        <!-- Forgot Password Section -->
        <div v-if="showForgotPassword" class="forgot-password-section">
          <h3>Passwort zurücksetzen</h3>
          <p>Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen des Passworts zu erhalten.</p>
          <form @submit.prevent="handleForgotPassword" class="forgot-form">
            <div class="form-group">
              <input
                type="email"
                v-model="forgotEmail"
                placeholder="ihre.email@example.com"
                required
                :disabled="isLoading"
              >
            </div>
            <button type="submit" :disabled="isLoading" class="forgot-button">
              Link senden
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['close', 'success']);

// Store
const userStore = useUserStore();

// Reactive state
const form = ref({
  email: '',
  password: '',
  remember: false
});

const showPassword = ref(false);
const showForgotPassword = ref(false);
const forgotEmail = ref('');
const error = ref('');
const successMessage = ref('');
const validationErrors = ref({});

// Computed
const isLoading = computed(() => userStore.isLoading);

const isFormValid = computed(() => {
  return form.value.email.length > 0 &&
         form.value.password.length >= 8 &&
         form.value.email.includes('@');
});

// Watch for show prop changes
watch(() => props.show, (newValue) => {
  if (newValue) {
    // Reset form when modal opens
    resetForm();
  }
});

// Methods
const resetForm = () => {
  form.value = {
    email: '',
    password: '',
    remember: false
  };
  showPassword.value = false;
  showForgotPassword.value = false;
  forgotEmail.value = '';
  error.value = '';
  successMessage.value = '';
  validationErrors.value = {};
};

const handleOverlayClick = () => {
  if (!isLoading.value) {
    emit('close');
  }
};

const handleLogin = async () => {
  if (!isFormValid.value || isLoading.value) {
    return;
  }

  error.value = '';
  validationErrors.value = {};

  try {
    const result = await userStore.login({
      email: form.value.email,
      password: form.value.password,
      remember: form.value.remember
    });

    if (result.success) {
      successMessage.value = 'Erfolgreich angemeldet!';

      // Wait a bit to show success message
      setTimeout(() => {
        emit('success', result.user);
        emit('close');
      }, 1000);
    } else {
      error.value = result.error || 'Anmeldung fehlgeschlagen';
      validationErrors.value = result.validationErrors || {};
    }
  } catch (err) {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten';
    console.error('Login error:', err);
  }
};

const handleForgotPassword = async () => {
  if (!forgotEmail.value || isLoading.value) {
    return;
  }

  try {
    // Implementation for forgot password would go here
    // For now, just show a success message
    successMessage.value = 'Ein Link zum Zurücksetzen wurde an Ihre E-Mail-Adresse gesendet.';
    showForgotPassword.value = false;
    forgotEmail.value = '';
  } catch (err) {
    error.value = 'Fehler beim Senden des Reset-Links';
    console.error('Forgot password error:', err);
  }
};

const fillCredentials = (email, password) => {
  form.value.email = email;
  form.value.password = password;
  error.value = '';
  validationErrors.value = {};
};
</script>

<style scoped>
/* Login Modal verwendet die globalen App-Styles */
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.login-modal {
  background-color: var(--color-background);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.login-header h2 {
  margin: 0;
  color: var(--color-heading);
  font-family: 'GT Pressura', sans-serif;
  font-size: 1.25rem;
  text-transform: uppercase;
  font-weight: normal;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover:not(:disabled) {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 500;
  font-family: 'GT Pressura', sans-serif;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-button);
  box-shadow: 0 0 0 3px rgba(120, 198, 191, 0.1);
}

.form-group input.error {
  border-color: #dc3545;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.password-toggle:hover:not(:disabled) {
  color: var(--color-text);
  background-color: var(--color-background-soft);
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  color: var(--color-text);
  font-size: 0.875rem;
}

.checkbox-label input[type="checkbox"] {
  opacity: 0;
  position: absolute;
}

.checkmark {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s;
  background-color: var(--color-background);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: var(--color-button);
  border-color: var(--color-button);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.login-button {
  background-color: var(--color-button) !important;
  color: var(--color-text) !important;
  border: none !important;
  padding: 0.875rem 1.5rem !important;
  border-radius: 0.25rem !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  margin-top: 0.5rem !important;
  font-family: 'GT Pressura', sans-serif !important;
  text-transform: uppercase !important;
  width: 100% !important;
}

.login-button:hover:not(:disabled) {
  background-color: var(--color-button-hover) !important;
  transform: translateY(-1px) !important;
}

.login-button:disabled {
  background-color: var(--color-text-muted) !important;
  cursor: not-allowed !important;
  transform: none !important;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.25rem;
  color: #16a34a;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.field-error {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.link-button {
  background: none;
  border: none;
  color: var(--color-button);
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0.25rem;
  font-family: inherit;
  transition: color 0.2s ease;
}

.link-button:hover:not(:disabled) {
  color: var(--color-button-hover);
}

.link-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.forgot-password-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.forgot-password-section h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
  font-family: 'GT Pressura', sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: normal;
}

.forgot-password-section p {
  margin: 0 0 1rem 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forgot-button {
  background-color: var(--color-text-muted);
  color: var(--color-background);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'GT Pressura', sans-serif;
  text-transform: uppercase;
}

.forgot-button:hover:not(:disabled) {
  background-color: var(--color-text);
  transform: translateY(-1px);
}

.forgot-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Test Credentials Styling */
.test-credentials {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.test-credentials h4 {
  margin: 0 0 0.75rem 0;
  color: var(--color-text-muted);
  font-family: 'GT Pressura', sans-serif;
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: normal;
}

.credentials-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.credential-item {
  padding: 0.5rem 0.75rem;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  line-height: 1.4;
}

.credential-item:hover {
  background-color: var(--color-button);
  color: var(--color-background);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.credential-item strong {
  color: var(--color-heading);
  font-family: 'GT Pressura', sans-serif;
}

.credential-item:hover strong {
  color: var(--color-background);
}

/* Responsive */
@media (max-width: 768px) {
  .login-modal {
    width: 95%;
    max-height: 95vh;
    margin: 1rem;
  }

  .login-header,
  .login-content {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .login-button,
  .forgot-button {
    width: 100%;
    justify-content: center;
  }

  .credentials-grid {
    gap: 0.75rem;
  }

  .credential-item {
    padding: 0.75rem;
    text-align: center;
  }
}
</style>