<template>
  <div>
    <hr class="shadow-line" />
    <div class="ref">
      <!--<div class="dashboard-header">
			<div>
				<h2>Administrationsbereich</h2>
				<p>Verwalte Benutzer, Rollen, Hardware, Software und Referenzprofile</p>
			</div>
			<div class="refresh-info">
				<div class="last-update" v-if="lastUpdate">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="23 4 23 10 17 10"></polyline>
						<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
					</svg>
					Aktualisiert: {{ lastUpdate }}
				</div>
				<button @click="loadStatistics" class="manual-refresh-btn" :disabled="isLoading">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'rotating': isLoading }">
						<polyline points="23 4 23 10 17 10"></polyline>
						<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
					</svg>
					{{ isLoading ? 'Lädt...' : 'Aktualisieren' }}
				</button>
			</div>
		</div> -->
      <hr class="shadow-line" />

      <div class="admin-modules">
        <div class="module-grid">
          <!-- Benutzer-Verwaltung -->
          <div class="module-card" @click="$emit('show-users')">
            <div class="module-header">
              <div class="module-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3>Benutzer:innen</h3>
            </div>
            <p>Mitarbeitende verwalten, Rollen zuweisen und Berechtigungen konfigurieren</p>
            <div class="module-stats">
              <span class="stat-item">{{ userStats.total }} Benutzer:innen</span>
            </div>
          </div>

          <!-- Rollen & SAP Berechtigungen -->
          <div class="module-card" @click="$emit('show-roles')">
            <div class="module-header">
              <div class="module-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Rollen & SAP Berechtigungen</h3>
            </div>
            <p>Rollengruppen und SAP-Berechtigungen verwalten und organisieren</p>
            <div class="module-stats">
              <span class="stat-item">{{ roleStats.groups }} Rollengruppen</span>
              <span class="stat-item">{{ roleStats.profiles }} SAP Berechtigungen</span>
            </div>
          </div>

          <!-- Hardware-Verwaltung -->
          <div class="module-card" @click="$emit('show-hardware')">
            <div class="module-header">
              <div class="module-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3>Hardware</h3>
            </div>
            <p>Geräte katalog verwalten, neue Hardware hinzufügen und kategorisieren</p>
            <div class="module-stats">
              <span class="stat-item">{{ hardwareStats.total }} Geräte</span>
              <span class="stat-item">{{ hardwareStats.categories }} Kategorien</span>
            </div>
          </div>

          <!-- Software-Verwaltung -->
          <div class="module-card" @click="$emit('show-software')">
            <div class="module-header">
              <div class="module-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="16,18 22,12 16,6"></polyline>
                  <polyline points="8,6 2,12 8,18"></polyline>
                </svg>
              </div>
              <h3>Software</h3>
            </div>
            <p>Software katalog verwalten, Software und Hersteller organisieren</p>
            <div class="module-stats">
              <span class="stat-item">{{ softwareStats.total }} Anwendungen</span>
              <span class="stat-item">{{ softwareStats.manufacturers }} Hersteller</span>
            </div>
          </div>

          <!-- Referenzprofil-Verwaltung -->
          <div class="module-card" @click="$emit('show-profiles')">
            <div class="module-header">
              <div class="module-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="M7 19c0-2 2-3 2-3s2 1 2 3"></path>
                  <line x1="13" y1="11" x2="17" y2="11"></line>
                  <line x1="13" y1="16" x2="17" y2="16"></line>
                </svg>
              </div>
              <h3>Referenzprofile</h3>
            </div>
            <p>Referenzprofile erstellen und verwalten, Hardware- und Software-Zuordnungen</p>
            <div class="module-stats">
              <span class="stat-item">{{ profileStats.total }} Profile</span>
              <span class="stat-item">{{ profileStats.departments }} Bereiche</span>
            </div>
          </div>

          <!-- Stammdaten-Verwaltung -->
          <div class="module-card" @click="$emit('show-masterdata')">
            <div class="module-header">
              <div class="module-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M20 6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"
                  ></path>
                  <line x1="8" y1="11" x2="8" y2="11"></line>
                  <line x1="12" y1="11" x2="12" y2="11"></line>
                  <line x1="16" y1="11" x2="16" y2="11"></line>
                  <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"></path>
                  <path d="M6 18v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"></path>
                </svg>
              </div>
              <h3>Bereiche</h3>
            </div>
            <p>Bereiche, Sachbereiche, Teams und Funktionen verwalten</p>
            <div class="module-stats">
              <span class="stat-item">{{ masterdataStats.bereiche }} Bereiche</span>
              <span class="stat-item">{{ masterdataStats.teams }} Teams</span>
            </div>
          </div>

          <!-- Auftragsübersicht -->
          <div class="module-card" @click="$emit('show-orders')">
            <div class="module-header">
              <div class="module-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </div>
              <h3>Auftragsübersicht</h3>
            </div>
            <p>Übersicht über Job-Updates</p>
            <div class="module-stats">
              <span class="stat-item">{{ systemStats.activeUsers }} Aktive Aufträge</span>
              <span class="stat-item">{{ systemStats.pendingRequests }} Wartende Aufträge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits([
  'show-users',
  'show-roles',
  'show-hardware',
  'show-software',
  'show-profiles',
  'show-masterdata',
  'show-orders',
  'back-to-navigation',
])

// Mock Statistics - Diese sollten später aus der API geladen werden
const userStats = ref({
  total: 0,
})

const roleStats = ref({
  groups: 0,
  profiles: 0,
})

const hardwareStats = ref({
  total: 0,
  categories: 0,
})

const softwareStats = ref({
  total: 0,
  manufacturers: 0,
})

const profileStats = ref({
  total: 0,
  departments: 0,
})

const masterdataStats = ref({
  bereiche: 0,
  teams: 0,
  sachbereiche: 0,
  funktionen: 0,
})

const systemStats = ref({
  activeUsers: 0,
  pendingRequests: 0,
})

const isLoading = ref(false)
const lastUpdate = ref(null)

import adminService from '@/services/adminService'

// Load master data statistics
const loadMasterdataStats = async () => {
  try {
    const bereiche = await adminService.getBereiche()
    const teams = await adminService.getTeams()
    const funktionen = await adminService.getFunktionen()

    masterdataStats.value.bereiche = bereiche.length
    masterdataStats.value.teams = teams.length
    masterdataStats.value.funktionen = funktionen.length
  } catch (error) {
    console.error('Fehler beim Laden der Stammdaten-Statistiken:', error)
    // Fallback values if API fails
    masterdataStats.value.bereiche = 5
    masterdataStats.value.teams = 12
    masterdataStats.value.funktionen = 8
  }
}

// Load statistics
const loadStatistics = async () => {
  try {
    isLoading.value = true
    const stats = await adminService.getDashboardStats()

    // Update stats with API data
    if (stats.users) {
      userStats.value.total = stats.users.total
    }

    if (stats.sap) {
      roleStats.value.groups = stats.sap.groups
      roleStats.value.profiles = stats.sap.profiles
    }

    if (stats.hardware) {
      hardwareStats.value.total = stats.hardware.total
      hardwareStats.value.categories = stats.hardware.categories
    }

    if (stats.software) {
      softwareStats.value.total = stats.software.total
      softwareStats.value.manufacturers = stats.software.manufacturers
    }

    // Profile-Statistiken
    if (stats.profiles) {
      profileStats.value.total = stats.profiles.total
      profileStats.value.departments = stats.profiles.departments
    }

    // Stammdaten-Statistiken
    await loadMasterdataStats()

    // Order/System-Statistiken
    if (stats.orders) {
      systemStats.value.activeUsers = stats.orders.active
      systemStats.value.pendingRequests = stats.orders.pending
    }

    // Update last update time
    lastUpdate.value = new Date().toLocaleTimeString('de-DE')
  } catch (error) {
    console.error('Fehler beim Laden der Statistiken:', error)
    // Fallback values if API fails
    userStats.value.total = 127
    roleStats.value.groups = 8
    roleStats.value.profiles = 45
    hardwareStats.value.total = 156
    hardwareStats.value.categories = 12
    softwareStats.value.total = 87
    softwareStats.value.manufacturers = 23
  } finally {
    isLoading.value = false
  }
}

// Auto-refresh setup
const refreshInterval = ref(null)

// Load statistics with auto-refresh
const startAutoRefresh = () => {
  // Load initially
  loadStatistics()

  // Set up auto-refresh every 30 seconds
  refreshInterval.value = setInterval(() => {
    loadStatistics()
  }, 30000)
}

onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.ref {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1rem;
}

.refresh-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.manual-refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem !important;
  background: var(--color-button) !important;
  color: var(--color-text) !important;
  border: none !important;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.manual-refresh-btn:hover:not(:disabled) {
  background: var(--color-button-hover) !important;
}

.manual-refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.admin-modules {
  margin: 2rem 0;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .module-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.module-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--color-button);
}

.module-card.info-only {
  cursor: default;
  opacity: 0.8;
}

.module-card.info-only:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--color-border);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.module-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-button);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  flex-shrink: 0;
}

.module-header h3 {
  margin: 0;
  color: var(--color-heading);
  font-size: 1.1rem;
  font-weight: 600;
}

.module-card p {
  color: var(--color-text-muted);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.module-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.stat-item {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Navigation buttons styling inherited from main.css */
.navigation-buttons {
  justify-content: center; /* Override for AdminDashboard */
  margin-top: 2rem; /* View-specific spacing */
}

.shadow-line {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
  margin: 2rem 0;
}

@media (max-width: 1024px) {
  .ref {
    width: 90%;
  }
}

@media (max-width: 640px) {
  .ref {
    width: 95%;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .refresh-info {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .module-card {
    padding: 1rem;
  }

  .module-header h3 {
    font-size: 1rem;
  }

  .navigation-buttons {
    flex-direction: column;
  }
}
</style>
