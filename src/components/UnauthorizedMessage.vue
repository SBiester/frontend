<template>
  <div class="unauthorized-container">
    <div class="unauthorized-content">
      <div class="unauthorized-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>

      <h2>Zugriff verweigert</h2>

      <div class="role-info">
        <p class="current-role"><strong>Ihre aktuelle Rolle:</strong> {{ roleDisplayName }}</p>

        <div class="permissions-info">
          <h3>Verfügbare Bereiche für Ihre Rolle:</h3>
          <ul class="permissions-list">
            <li v-for="area in availableAreas" :key="area.name" class="permission-item">
              <span class="permission-icon">✓</span>
              <span class="permission-name">{{ area.name }}</span>
              <span class="permission-desc">{{ area.description }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="goToHome" class="btn-primary">Zurück zum Dashboard</button>
        <button v-if="!userStore.isAdmin" @click="contactAdmin" class="btn-secondary">
          Admin kontaktieren
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const roleDisplayName = computed(() => {
  const roleNames = {
    admin: 'Administrator',
    pm: 'Project Manager',
    fach: 'Fachbereich',
  }
  return roleNames[userStore.role] || userStore.role
})

const availableAreas = computed(() => {
  const areas = []

  if (userStore.canAccessJobUpdates) {
    areas.push({
      name: 'Job-Updates',
      description: 'Erstellen und verwalten von Personaländerungen',
    })
  }

  if (userStore.canAccessOrders) {
    areas.push({
      name: 'Auftragsübersicht',
      description: 'Einsicht in Ihre Job-Update-Aufträge',
    })
  }

  if (userStore.canAccessAdmin) {
    areas.push({
      name: 'Administration',
      description: 'Vollzugriff auf alle Verwaltungsfunktionen',
    })
  }

  return areas
})

const goToHome = () => {
  router.push('/home')
}

const contactAdmin = () => {
  // Hier könnte ein Kontaktformular oder E-Mail-Link implementiert werden
  alert('Bitte wenden Sie sich an Ihren Administrator für erweiterte Berechtigungen.')
}
</script>

<style scoped>
.unauthorized-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.unauthorized-content {
  text-align: center;
  max-width: 600px;
  background-color: var(--color-background);
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
}

.unauthorized-icon {
  color: #dc2626;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.unauthorized-content h2 {
  color: var(--color-heading);
  font-family: 'GT Pressura', sans-serif;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.role-info {
  margin: 2rem 0;
  text-align: left;
}

.current-role {
  color: var(--color-text);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 0.25rem;
  border-left: 4px solid var(--color-button);
}

.permissions-info h3 {
  color: var(--color-heading);
  font-family: 'GT Pressura', sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.permissions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: var(--color-background-soft);
  border-radius: 0.25rem;
  border: 1px solid var(--color-border);
}

.permission-icon {
  color: #16a34a;
  font-weight: bold;
  flex-shrink: 0;
}

.permission-name {
  font-weight: 500;
  color: var(--color-text);
  min-width: 120px;
}

.permission-desc {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 1.5rem;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'GT Pressura', sans-serif;
  text-transform: uppercase;
  border: none;
}

.btn-primary {
  background-color: var(--color-button);
  color: var(--color-text);
}

.btn-primary:hover {
  background-color: var(--color-button-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-background-soft);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .unauthorized-container {
    padding: 1rem;
  }

  .unauthorized-content {
    padding: 2rem 1rem;
  }

  .permission-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .permission-name {
    min-width: auto;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
