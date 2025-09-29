<template>
  <div class="home-view-container">
    <div class="cell-wide" v-if="showJobView">
      <h1 :class="{ 'fade-in': showJobTitle }">Job-Update</h1>
      <p class="subtitle">
        Erfasse hier &Auml;nderungen zu Rolle, Team oder Software und Hardware von Mitarbeitenden.
      </p>
    </div>
    <div v-if="userStore.isAuthenticated && showJobView" class="navigation-buttons-fixed">
      <button @click="goBackToNavigation" class="back-button-header">Navigation</button>
      <button @click="handleLogout" class="logout-button">Abmelden</button>
    </div>

    <template v-if="userStore.isAuthenticated">
      <div v-if="!showJobView">
        <div class="cell-wide dashboard-header">
          <h1 :class="{ 'fade-in': showHeadLine }">Navigation</h1>
          <p class="subtitle">Zentrale Verwaltung für IT-Services und Mitarbeitenden-Management</p>
        </div>
        <div class="navigation-buttons-fixed">
          <button @click="handleLogout" class="logout-button">Abmelden</button>
        </div>
        <div class="navigation-content">
          <!-- User Orders Status -->
          <div v-if="userOrders.length > 0" class="user-orders-widget">
            <div class="orders-header">
              <h3>Ihre offenen Job-Updates</h3>
              <span class="orders-count">{{ userOrders.length }}</span>
            </div>
            <div class="orders-list">
              <div v-for="order in userOrders.slice(0, 3)" :key="order.id" class="order-item">
                <div class="order-info">
                  <span class="order-id">#{{ order.id }}</span>
                  <span class="order-type">{{ getOrderTypeLabel(order.type) }}</span>
                </div>
                <span :class="`order-status ${order.status}`">{{
                  getOrderStatusLabel(order.status)
                }}</span>
              </div>
              <div v-if="userOrders.length > 3" class="more-orders">
                <button @click="navigateToOrders" class="view-all-btn">
                  Alle {{ userOrders.length }} Aufträge anzeigen
                </button>
              </div>
            </div>
          </div>

          <div class="dashboard-feature-list">
            <router-link v-if="userStore.canAccessAdmin" to="/admin" class="feature-link">
              <div class="feature-item clickable">
                <i class="fa fa-cog feature-icon"></i>
                <span class="feature-text">Administration</span>
              </div>
            </router-link>
            <div
              v-if="userStore.canAccessJobUpdates"
              class="feature-item clickable"
              @click="showJobUpdate"
            >
              <i class="fa fa-user feature-icon"></i>
              <span class="feature-text">Job-Update</span>
            </div>
            <div
              v-if="userStore.canAccessOrders"
              class="feature-item clickable"
              @click="navigateToOrders"
            >
              <i class="fa fa-list feature-icon"></i>
              <span class="feature-text">Auftragsübersicht</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="job-view-container">
        <JobView @back-to-navigation="goBackToNavigation" />
      </div>
    </template>

    <template v-else>
      <div class="cell-wide welcome-header">
        <h1 :class="{ 'fade-in': showHeadLine }">Willkommen</h1>
        <p class="subtitle">Bitte melde dich an, um diese Anwendung nutzen zu können.</p>
      </div>
      <div class="navigation-buttons-fixed">
        <button @click="showLoginModal">Anmelden</button>
        <a :href="`${backendUrl}/auth/microsoft/redirect`"
          ><button>Mit Microsoft anmelden</button></a
        >
      </div>
      <div class="welcome-content">
        <div class="welcome-info">
          <h2>Job-Update System</h2>
          <p>
            Erfasse hier Änderungen zu Rolle, Team oder Software und Hardware von Mitarbeitenden.
          </p>

          <div class="features-overview">
            <h3>Verfügbare Funktionen:</h3>
            <ul class="features-list">
              <li class="feature-item-info">
                <i class="fa fa-user feature-icon-info"></i>
                <div class="feature-content">
                  <span class="feature-title">Mitarbeitenden-Management</span>
                  <span class="feature-description">Erfassung von Job-Updates für Mitarbeitende</span>
                </div>
              </li>
              <li class="feature-item-info">
                <i class="fa fa-cog feature-icon-info"></i>
                <div class="feature-content">
                  <span class="feature-title">Hardware & Software</span>
                  <span class="feature-description"
                    >Verwaltung von IT-Ressourcen und Ausstattung</span
                  >
                </div>
              </li>
              <li class="feature-item-info">
                <i class="fa fa-list feature-icon-info"></i>
                <div class="feature-content">
                  <span class="feature-title">Auftragsübersicht</span>
                  <span class="feature-description">Einsicht in deiner eingereichten Aufträge</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <!-- Login Modal -->
    <LoginModal :show="showLoginModalFlag" @close="closeLoginModal" @success="handleLoginSuccess" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { Link } from '@inertiajs/vue3'
import JobView from './JobView.vue'
import LoginModal from '../components/LoginModal.vue'

const authMessage = ref('')
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const showHeadLine = ref(false)
const showJobView = ref(false)
const showJobTitle = ref(false)
const userOrders = ref([])
const showLoginModalFlag = ref(false)

// Backend URL for external links
const backendUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080'
})

const showJobUpdate = () => {
  showJobView.value = true
  setTimeout(() => {
    showJobTitle.value = true
  }, 100)
}

const goBackToNavigation = () => {
  showJobView.value = false
  showJobTitle.value = false
}

const showLoginModal = () => {
  showLoginModalFlag.value = true
}

const closeLoginModal = () => {
  showLoginModalFlag.value = false
}

const handleLoginSuccess = (user) => {
  console.log('Login successful:', user)
  // User data is already stored in userStore
  // Reload user orders and refresh UI
  loadUserOrders()
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    // Clear any local data
    userOrders.value = []
    showJobView.value = false
    showJobTitle.value = false
    console.log('Logout successful')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const navigateToOrders = () => {
  // Navigiere zum Admin-Bereich und setze Query-Parameter für direkte Navigation zur Auftragsübersicht
  router.push('/admin?section=orders')
}

const getOrderTypeLabel = (type) => {
  const typeLabels = {
    new_employee: 'Neuer Mitarbeiter',
    employee_change: 'Mitarbeiteränderung',
    employee_departure: 'Mitarbeiteraustritt',
    extension: 'Verlängerung',
  }
  return typeLabels[type] || type
}

const getOrderStatusLabel = (status) => {
  const statusLabels = {
    pending: 'Ausstehend',
    in_progress: 'In Bearbeitung',
    completed: 'Abgeschlossen',
    cancelled: 'Abgebrochen',
  }
  return statusLabels[status] || status
}

const loadUserOrders = async () => {
  if (!userStore.isAuthenticated) {
    userOrders.value = []
    return
  }

  try {
    // Load user orders from API
    const response = await fetch('/api/orders/user', {
      headers: {
        Authorization: `Bearer ${userStore.getToken()}`,
        Accept: 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      userOrders.value = (data.orders || data).filter(
        (order) => order.status !== 'completed' && order.status !== 'cancelled',
      )
    } else {
      console.error('Failed to load user orders:', response.status)
      userOrders.value = []
    }
  } catch (error) {
    console.error('Error loading user orders:', error)
    userOrders.value = []
  }
}

// Legacy function name for compatibility
const fetchUserOrders = loadUserOrders

onMounted(() => {
  // Initialize user store
  userStore.initialize()

  setTimeout(() => {
    showHeadLine.value = true
  }, 100)

  // Check for authentication messages
  if (route.query.message === 'unauthenticated') {
    authMessage.value = 'Sie müssen sich anmelden, um diese Seite zu besuchen.'
  } else if (route.query.message === 'session_expired') {
    authMessage.value = 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.'
  } else if (route.query.message === 'insufficient_permissions') {
    authMessage.value = 'Sie haben keine Berechtigung für diesen Bereich.'
  }

  // Load user orders if authenticated
  if (userStore.isAuthenticated) {
    loadUserOrders()
  }
})
</script>

<style scoped>
@media (min-width: 1025px) {
  .subtitle {
    display: block !important;
    font-size: 1.2rem;
  }
}

.subtitle {
  display: none;
  color: var(--vt-c-white);
}

.cell-wide {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  padding-bottom: 1rem;
  padding-top: 1rem;
  background-color: var(--color-button-hover);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.cell-wide h1,
.cell-wide p {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.2rem;
}

button {
  min-width: 8rem;
}

/* Dashboard feature list styling */
.dashboard-feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Dashboard feature items inherit welcome page styles */
.dashboard-feature-list .feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 0.375rem;
  border: 1px solid var(--color-border-hover);
  transition: all 0.2s ease;
  justify-content: flex-start;
}

.dashboard-feature-list .feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.dashboard-feature-list .feature-item.clickable {
  cursor: pointer;
}

.dashboard-feature-list .feature-item.clickable:hover {
  border-color: var(--color-button);
  background: var(--color-background-soft);
}

.dashboard-feature-list .feature-link {
  text-decoration: none;
  color: inherit;
}

.dashboard-feature-list .feature-link:hover {
  text-decoration: none;
}

.dashboard-feature-list .feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  color: var(--color-button);
  width: 2rem;
  text-align: center;
}

.dashboard-feature-list .feature-text {
  color: var(--color-text);
  font-weight: 500;
  font-size: 1rem;
  flex: 1;
}

.form-container {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.home-view-container {
  position: relative;
}

.back-button-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: auto !important;
  padding: 0.5rem 1rem;
}

.back-button-header:hover {
  transform: translateX(-2px);
}

@media (min-width: 1025px) {
  .job-view-container {
    margin-top: 6rem !important;
    padding-top: 1rem;
  }
}

.job-view-container {
  margin-top: 3.4rem;
  padding-top: 1rem;
}

.navigation-content {
  margin-top: 6rem;
  padding: 2rem 1rem;
  text-align: center;
}

@media (min-width: 1025px) {
  .navigation-content {
    margin-top: 8rem;
  }
}

.navigation-buttons-fixed button:hover,
.navigation-buttons-fixed a button:hover {
  border: 1px solid var(--color-button) !important;
  transform: none !important;
}

.navigation-buttons-fixed button {
  border: 1px solid transparent !important;
}

.navigation-buttons-fixed a button {
  border: 1px solid transparent !important;
}

.user-orders-widget {
  background: var(--color-background-mute);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--color-border);
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.orders-header h3 {
  margin: 0;
  color: var(--color-heading);
  font-size: 1.25rem;
}

.orders-count {
  background: var(--color-button);
  color: var(--color-button-text);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: bold;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  border-radius: 0.375rem;
  border: 1px solid var(--color-border-hover);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-id {
  font-weight: bold;
  color: var(--color-heading);
  font-size: 0.875rem;
}

.order-type {
  color: var(--color-text-2);
  font-size: 0.8rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.order-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.order-status.in_progress {
  background: #dbeafe;
  color: #1e40af;
}

.order-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.order-status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.more-orders {
  margin-top: 0.5rem;
  text-align: center;
}

.view-all-btn {
  background: transparent;
  color: var(--color-button);
  border: 1px solid var(--color-button);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: var(--color-button);
  color: var(--color-button-text);
}

/* Welcome page styles */
.welcome-header {
  background-color: var(--color-button-hover);
}

.welcome-content {
  margin-top: 8rem;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 8rem);
}

.welcome-info {
  text-align: center;
  max-width: 600px;
  background: var(--color-background-mute);
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-info h2 {
  color: var(--color-heading);
  font-family: 'GT Pressura', sans-serif;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
}

.welcome-info p {
  color: var(--color-text);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

/* Features Overview Section */
.features-overview {
  text-align: left;
  margin-top: 2rem;
}

.features-overview h3 {
  color: var(--color-heading);
  font-family: 'GT Pressura', sans-serif;
  font-size: 1.1rem;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-button);
  padding-bottom: 0.5rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-item-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0;
  background: transparent;
  border: none;
  transition: none;
}

.feature-icon-info {
  font-size: 1.25rem;
  color: var(--color-button);
  width: 1.5rem;
  text-align: center;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.feature-title {
  color: var(--color-heading);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.3;
}

.feature-description {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.4;
  font-weight: 400;
}

/* Responsive adjustments for welcome page */
@media (max-width: 768px) {
  .welcome-content {
    margin-top: 6rem;
    padding: 1rem;
    min-height: calc(100vh - 6rem);
  }

  .welcome-info {
    padding: 2rem 1rem;
  }

  .welcome-info h2 {
    font-size: 1.5rem;
  }

  .welcome-info p {
    font-size: 1rem;
  }

  .features-overview h3 {
    font-size: 1rem;
  }

  .feature-icon-info {
    font-size: 1.1rem;
    width: 1.25rem;
  }

  .feature-title {
    font-size: 0.95rem;
  }

  .feature-description {
    font-size: 0.85rem;
  }

  /* Dashboard responsive adjustments */
  .dashboard-feature-list {
    max-width: 100%;
    padding: 0 1rem;
  }

  .dashboard-feature-list .feature-item {
    padding: 0.75rem;
  }

  .dashboard-feature-list .feature-icon {
    font-size: 1.25rem;
  }

  .dashboard-feature-list .feature-text {
    font-size: 0.9rem;
  }
}
</style>
