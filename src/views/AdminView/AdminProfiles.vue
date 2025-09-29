<template>
  <div>
    <!-- Dark overlay for edit mode - moved to body level -->
    <Teleport to="body">
      <div v-show="showEditOverlay" class="edit-overlay" @click="closeEditMode">
        <!-- Create/Edit Profile Modal -->
        <div v-if="showProfileModal" class="modal-overlay" @click="closeProfileModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>{{ editingProfile ? 'Profil bearbeiten' : 'Neues Profil erstellen' }}</h3>
              <button @click="closeProfileModal" class="modal-close">×</button>
            </div>

            <form @submit.prevent="saveProfile" class="modal-form">
              <div class="form-sections">
                <!-- Basic Information -->
                <div class="form-section">
                  <h4>Grundinformationen</h4>
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="profileName">Profil Name *</label>
                      <input
                        id="profileName"
                        v-model="profileForm.name"
                        type="text"
                        required
                        class="form-input"
                        placeholder="z.B. Frontend Entwickler"
                      />
                    </div>

                    <div class="form-group">
                      <label for="profileCategory">Bereich *</label>
                      <select
                        id="profileCategory"
                        v-model="profileForm.bereich"
                        required
                        class="form-select"
                      >
                        <option value="">Bereich wählen</option>
                        <option
                          v-for="bereich in bereiche"
                          :key="bereich.BereichID"
                          :value="bereich.Bereich"
                        >
                          {{ bereich.Bereich }}
                        </option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="profileTeam">Team</label>
                      <select id="profileTeam" v-model="profileForm.team" class="form-select">
                        <option value="">Team wählen</option>
                        <option v-for="team in teams" :key="team.TeamID" :value="team.Bezeichnung">
                          {{ team.Bezeichnung }}
                        </option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="profileStatus">Status</label>
                      <select id="profileStatus" v-model="profileForm.status" class="form-select">
                        <option value="entwurf">Entwurf</option>
                        <option value="aktiv">Aktiv</option>
                        <option value="inaktiv">Inaktiv</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="checkbox-label">
                        <input v-model="profileForm.isTemplate" type="checkbox" />
                        Als Vorlage markieren
                      </label>
                    </div>

                    <div class="form-group full-width">
                      <label for="profileDescription">Beschreibung</label>
                      <textarea
                        id="profileDescription"
                        v-model="profileForm.description"
                        rows="3"
                        class="form-input"
                        placeholder="Beschreibung des Profils..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" @click="closeProfileModal" class="btn-secondary">
                  Abbrechen
                </button>
                <button type="submit" class="btn-primary">
                  {{ editingProfile ? 'Speichern' : 'Erstellen' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Profile Preview Modal -->
        <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
          <div class="modal-content large" @click.stop>
            <div class="modal-header">
              <h3>Profil Vorschau: {{ previewProfile?.name }}</h3>
              <button @click="closePreviewModal" class="modal-close">×</button>
            </div>

            <div class="preview-content">
              <div class="profile-info">
                <div class="info-grid">
                  <div class="info-item">
                    <label>Name:</label>
                    <span>{{ previewProfile?.name }}</span>
                  </div>
                  <div class="info-item">
                    <label>Bereich:</label>
                    <span>{{ previewProfile?.bereich }}</span>
                  </div>
                  <div class="info-item">
                    <label>Team:</label>
                    <span>{{ previewProfile?.team || 'Nicht zugewiesen' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Status:</label>
                    <span :class="`status-${previewProfile?.status}`">{{
                      previewProfile?.status
                    }}</span>
                  </div>
                </div>

                <div v-if="previewProfile?.description" class="description">
                  <label>Beschreibung:</label>
                  <p>{{ previewProfile.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <hr class="shadow-line" />
    <div class="ref">
      <h2>Referenz-Profile verwalten</h2>
      <p>Erstellen und bearbeiten Sie Referenz-Profile für häufige Konfigurationen</p>
      <hr class="shadow-line" />

      <div class="profile-management">
        <!-- Search and Filters -->
        <div class="search-section">
          <div class="search-input-container">
            <input
              v-model="searchTerm"
              @input="handleSearch"
              type="text"
              class="search-input large"
              placeholder="Profile durchsuchen (Name, Bereich, Team)..."
            />
            <div class="search-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
          </div>

          <div class="filter-controls">
            <select v-model="selectedCategory" @change="filterProfiles" class="filter-select">
              <option value="">Alle Bereiche</option>
              <option v-for="bereich in bereiche" :key="bereich.BereichID" :value="bereich.Bereich">
                {{ bereich.Bereich }}
              </option>
            </select>

            <select v-model="selectedStatus" @change="filterProfiles" class="filter-select">
              <option value="">Alle Status</option>
              <option value="aktiv">Aktiv</option>
              <option value="inaktiv">Inaktiv</option>
              <option value="entwurf">Entwurf</option>
            </select>

            <button @click="openCreateModal" class="add-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 5v14m7-7H5"></path>
              </svg>
              Neues Profil
            </button>
          </div>
        </div>

        <!-- Profiles Table -->
        <div class="profiles-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Profil Name</th>
                <th>Bereich</th>
                <th>Team</th>
                <th>Hardware</th>
                <th>Software</th>
                <th>SAP Berechtigungen</th>
                <th>Status</th>
                <th>Erstellt</th>
                <th class="text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredProfiles.length === 0" class="empty-row">
                <td colspan="8" class="empty-message">
                  <div class="empty-state">
                    <p>Keine Profile vorhanden</p>
                    <button @click="openCreateModal" class="btn-primary">
                      Erstes Profil erstellen
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-for="profile in filteredProfiles" :key="profile.id" class="profile-row">
                <td>
                  <div class="profile-info">
                    <div class="profile-details">
                      <div class="profile-name">{{ profile.name }}</div>
                      <div v-if="profile.isTemplate" class="template-badge">Template</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="category-badge">{{ profile.bereich }}</span>
                </td>
                <td class="description">
                  <div v-if="profile.team" class="team">{{ profile.team }}</div>
                  <div v-else class="no-data">-</div>
                </td>
                <td class="count">{{ profile.hardwareCount }}</td>
                <td class="count">{{ profile.softwareCount }}</td>
                <td class="count">{{ profile.sapBerechtigungCount }}</td>
                <td>
                  <span :class="`status-badge ${profile.status}`">{{
                    getStatusLabel(profile.status)
                  }}</span>
                </td>
                <td>{{ formatDate(profile.created_at) }}</td>
                <td class="text-right">
                  <div class="action-buttons">
                    <button
                      @click="editProfile(profile)"
                      class="action-btn edit"
                      title="Bearbeiten"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      @click="showProfilePreview(profile)"
                      class="action-btn preview"
                      title="Vorschau"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button
                      @click="duplicateProfile(profile)"
                      class="action-btn duplicate"
                      title="Duplizieren"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      @click="deleteProfile(profile)"
                      class="action-btn delete"
                      title="Löschen"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path
                          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import adminService from '@/services/adminService'

const emit = defineEmits(['go-back'])
// Reactive state
const searchTerm = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const showProfileModal = ref(false)
const showPreviewModal = ref(false)
const showEditOverlay = ref(false)
const editingProfile = ref(null)
const previewProfile = ref(null)

// Search states for modal
const hardwareSearch = ref('')
const softwareSearch = ref('')
const sapSearch = ref('')

// Form data
const profileForm = reactive({
  name: '',
  bereich: '',
  team: '',
  status: 'aktiv',
  isTemplate: false,
  hardwareItems: [],
  softwareItems: [],
  sapItems: [],
})

// Data from API
const profiles = ref([])
const bereiche = ref([])
const teams = ref([])

const availableHardware = ref([])
const availableSoftware = ref([])
const availableSapProfiles = ref([])

// Computed properties
const filteredTeams = computed(() => {
  if (!profileForm.bereich) {
    return []
  }
  // Filter teams by selected Bereich
  const selectedBereichData = bereiche.value.find((b) => b.Bereich === profileForm.bereich)
  if (!selectedBereichData) {
    return []
  }

  return teams.value.filter((team) => team.BereichID === selectedBereichData.BereichID)
})

// Watchers
watch(
  () => profileForm.bereich,
  (newBereich, oldBereich) => {
    if (newBereich !== oldBereich && profileForm.team) {
      // Check if current team is still valid for new bereich
      const isTeamStillValid = filteredTeams.value.some((team) => team.Bezeichnung === profileForm.team)
      if (!isTeamStillValid) {
        profileForm.team = '' // Clear team if not valid for new bereich
      }
    }
  },
)

// Loading data functions
const loadProfiles = async () => {
  try {
    console.log('Loading profiles...') // Debug log
    const data = await adminService.getProfiles()
    console.log('Loaded profiles data:', data) // Debug log

    // Check if data has the correct structure
    if (data && Array.isArray(data)) {
      profiles.value = data.filter((profile) => profile && profile.id) // Filter out empty entries
      console.log('Profiles set (array):', profiles.value.length, 'items')
    } else if (data && data.data && Array.isArray(data.data)) {
      profiles.value = data.data.filter((profile) => profile && profile.id) // Handle paginated response
      console.log('Profiles set (paginated):', profiles.value.length, 'items')
    } else {
      console.log('No valid profiles data received, using empty array')
      profiles.value = []
    }
  } catch (error) {
    console.error('Fehler beim Laden der Profile:', error)
    profiles.value = []
  }
}

const loadBereiche = async () => {
  try {
    const response = await fetch('/api/admin/bereiche')
    const data = await response.json()
    bereiche.value = data || []
    console.log('Loaded bereiche:', bereiche.value) // Debug log
  } catch (error) {
    console.error('Fehler beim Laden der Bereiche:', error)
    bereiche.value = []
  }
}

const loadTeams = async () => {
  try {
    const response = await fetch('/api/admin/teams')
    const data = await response.json()
    teams.value = data || []
    console.log('Loaded teams:', teams.value) // Debug log
  } catch (error) {
    console.error('Fehler beim Laden der Teams:', error)
    teams.value = []
  }
}

const loadHardware = async () => {
  try {
    const data = await adminService.getHardwareItems()
    availableHardware.value = data?.data || []
  } catch (error) {
    console.error('Fehler beim Laden der Hardware:', error)
    availableHardware.value = []
  }
}

const loadSoftware = async () => {
  try {
    const data = await adminService.getSoftwareItems()
    availableSoftware.value = data?.data || []
  } catch (error) {
    console.error('Fehler beim Laden der Software:', error)
    availableSoftware.value = []
  }
}

const loadSapProfiles = async () => {
  try {
    const data = await adminService.getSapRoles()
    console.log('Loaded SAP profiles data:', data) // Debug log

    // Handle different data structures and filter out null values
    if (data && Array.isArray(data)) {
      availableSapProfiles.value = data.filter((item) => item && (item.id || item.SammelrollenID))
    } else if (data && data.data && Array.isArray(data.data)) {
      availableSapProfiles.value = data.data.filter(
        (item) => item && (item.id || item.SammelrollenID),
      )
    } else {
      availableSapProfiles.value = []
    }

    console.log('Filtered SAP profiles:', availableSapProfiles.value.length, 'items')
  } catch (error) {
    console.error('Fehler beim Laden der SAP Berechtigungen:', error)
    availableSapProfiles.value = []
  }
}

// Computed properties
const filteredProfiles = computed(() => {
  let filtered = profiles.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (profile) =>
        profile.name.toLowerCase().includes(search) ||
        (profile.bereich && profile.bereich.toLowerCase().includes(search)) ||
        (profile.sachbereich && profile.sachbereich.toLowerCase().includes(search)) ||
        (profile.team && profile.team.toLowerCase().includes(search)),
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((profile) => profile.bereich === selectedCategory.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((profile) => profile.status === selectedStatus.value)
  }

  return filtered
})

const totalProfiles = computed(() => profiles.value.length)
const activeProfiles = computed(() => profiles.value.filter((p) => p.status === 'aktiv').length)
const mostUsedCategory = computed(() => {
  const categories = {}
  profiles.value.forEach((p) => {
    categories[p.category] = (categories[p.category] || 0) + 1
  })
  return Object.keys(categories).reduce(
    (a, b) => (categories[a] > categories[b] ? a : b),
    'Entwicklung',
  )
})

const filteredHardware = computed(() => {
  if (!hardwareSearch.value) return availableHardware.value
  const search = hardwareSearch.value.toLowerCase()
  return availableHardware.value.filter(
    (item) =>
      item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search),
  )
})

const filteredSoftware = computed(() => {
  if (!softwareSearch.value) return availableSoftware.value
  const search = softwareSearch.value.toLowerCase()
  return availableSoftware.value.filter(
    (item) =>
      item.name.toLowerCase().includes(search) || item.manufacturer.toLowerCase().includes(search),
  )
})

const filteredSapProfiles = computed(() => {
  // Filter out null/undefined items first
  const validProfiles = availableSapProfiles.value.filter(
    (item) => item && (item.id || item.SammelrollenID),
  )

  if (!sapSearch.value) return validProfiles
  const search = sapSearch.value.toLowerCase()
  return validProfiles.filter(
    (item) =>
      item.Bezeichnung?.toLowerCase().includes(search) ||
      item.Rollengruppe?.Bezeichnung?.toLowerCase().includes(search) ||
      item.rollengruppe?.Bezeichnung?.toLowerCase().includes(search),
  )
})

// Methods
const handleSearch = () => {
  // Search is handled by computed property
}

const filterProfiles = () => {
  // Filtering is handled by computed property
}

const openCreateModal = () => {
  editingProfile.value = null
  resetProfileForm()
  showProfileModal.value = true
  showEditOverlay.value = true
}

const editProfile = (profile) => {
  console.log('Editing profile:', profile) // Debug log
  editingProfile.value = profile

  // Find valid bereich - don't use "Unbekannt" if it's not in the list
  const validBereich = bereiche.value.find((b) => b.Bereich === profile.bereich)

  Object.assign(profileForm, {
    name: profile.name,
    bereich: validBereich ? profile.bereich : '', // Use empty string if bereich not found
    team: profile.team,
    status: profile.status,
    isTemplate: profile.isTemplate,
    hardwareItems: [...(profile.hardwareItems || [])],
    softwareItems: [...(profile.softwareItems || [])],
    sapItems: [...(profile.sapItems || [])],
  })

  console.log('Profile form after assignment:', profileForm) // Debug log
  showProfileModal.value = true
  showEditOverlay.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
  showEditOverlay.value = false
  editingProfile.value = null
  resetProfileForm()
}

const resetProfileForm = () => {
  Object.assign(profileForm, {
    name: '',
    bereich: '',
    team: '',
    status: 'aktiv',
    isTemplate: false,
    hardwareItems: [],
    softwareItems: [],
    sapItems: [],
  })
  hardwareSearch.value = ''
  softwareSearch.value = ''
  sapSearch.value = ''
}

const saveProfile = async () => {
  try {
    console.log('Saving profile - editing:', editingProfile.value) // Debug log
    console.log('Profile form data:', profileForm) // Debug log

    // Extract IDs from the selected items
    const hardwareIds = profileForm.hardwareItems
      .map((item) => item.id || item.HardwareID)
      .filter((id) => id)
    const softwareIds = profileForm.softwareItems
      .map((item) => item.id || item.SoftwareID)
      .filter((id) => id)
    const sapIds = profileForm.sapItems
      .map((item) => item.id || item.SammelrollenID)
      .filter((id) => id)

    // Find bereich ID only if bereich is specified and valid
    let bereichId = null
    if (profileForm.bereich && profileForm.bereich !== '') {
      const foundBereich = bereiche.value.find((b) => b.Bereich === profileForm.bereich)
      bereichId = foundBereich?.BereichID || null
    }

    const profileData = {
      name: profileForm.name,
      bereich_id: bereichId,
      team: profileForm.team, // Send team info for future compatibility
      aktiv: profileForm.status === 'aktiv',
      hardwareItems: hardwareIds,
      softwareItems: softwareIds,
      sapItems: sapIds,
    }

    console.log('Sending profile data to backend:', profileData) // Debug log

    if (editingProfile.value) {
      console.log('Updating profile with ID:', editingProfile.value.id)
      const response = await adminService.updateProfile(editingProfile.value.id, profileData)
      console.log('Update response:', response)
    } else {
      const response = await adminService.createProfile(profileData)
      console.log('Create response:', response)
    }

    await loadProfiles() // Reload profiles
    closeProfileModal()
    alert('Profil erfolgreich gespeichert!') // Success message
  } catch (error) {
    console.error('Fehler beim Speichern des Profils:', error)
    console.error('Error details:', error.response) // More detailed error log
    alert('Fehler beim Speichern des Profils: ' + (error.response?.data?.message || error.message))
  }
}

const deleteProfile = async (profile) => {
  if (confirm(`Sind Sie sicher, dass Sie das Profil "${profile.name}" löschen möchten?`)) {
    try {
      await adminService.deleteProfile(profile.id)
      await loadProfiles() // Reload profiles
    } catch (error) {
      console.error('Fehler beim Löschen des Profils:', error)
      alert('Fehler beim Löschen des Profils: ' + (error.response?.data?.message || error.message))
    }
  }
}

const duplicateProfile = async (profile) => {
  try {
    const duplicateData = {
      name: `${profile.name} (Kopie)`,
      bereich: profile.bereich,
      sachbereich: profile.sachbereich,
      team: profile.team,
      status: 'entwurf', // Set as draft
      isTemplate: false,
      hardwareItems: profile.hardwareItems || [],
      softwareItems: profile.softwareItems || [],
      sapItems: profile.sapItems || [],
    }

    await adminService.createProfile(duplicateData)
    await loadProfiles() // Reload profiles
  } catch (error) {
    console.error('Fehler beim Duplizieren des Profils:', error)
    alert(
      'Fehler beim Duplizieren des Profils: ' + (error.response?.data?.message || error.message),
    )
  }
}

const showProfilePreview = (profile) => {
  previewProfile.value = profile
  showPreviewModal.value = true
  showEditOverlay.value = true
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  showEditOverlay.value = false
  previewProfile.value = null
}

const closeEditMode = () => {
  showEditOverlay.value = false
}

const exportProfiles = () => {
  console.log('Export profiles')
}

const importProfiles = () => {
  console.log('Import profiles')
}

const getStatusLabel = (status) => {
  const labels = {
    aktiv: 'Aktiv',
    inaktiv: 'Inaktiv',
    entwurf: 'Entwurf',
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE')
}

// Selection methods
const isHardwareSelected = (item) => {
  return profileForm.hardwareItems.some((selected) => selected.id === item.id)
}

const isSoftwareSelected = (item) => {
  return profileForm.softwareItems.some((selected) => selected.id === item.id)
}

const isSapSelected = (item) => {
  if (!item) return false
  const itemId = item.id || item.SammelrollenID
  return profileForm.sapItems.some(
    (selected) => (selected.id || selected.SammelrollenID) === itemId,
  )
}

const toggleHardware = (item) => {
  const index = profileForm.hardwareItems.findIndex((selected) => selected.id === item.id)
  if (index === -1) {
    profileForm.hardwareItems.push(item)
  } else {
    profileForm.hardwareItems.splice(index, 1)
  }
}

const toggleSoftware = (item) => {
  const index = profileForm.softwareItems.findIndex((selected) => selected.id === item.id)
  if (index === -1) {
    profileForm.softwareItems.push(item)
  } else {
    profileForm.softwareItems.splice(index, 1)
  }
}

const toggleSapProfile = (item) => {
  if (!item) return
  const itemId = item.id || item.SammelrollenID
  const index = profileForm.sapItems.findIndex(
    (selected) => (selected.id || selected.SammelrollenID) === itemId,
  )
  if (index === -1) {
    profileForm.sapItems.push(item)
  } else {
    profileForm.sapItems.splice(index, 1)
  }
}

// Load all data on mount
onMounted(async () => {
  await Promise.all([
    loadProfiles(),
    loadBereiche(),
    loadTeams(),
    loadHardware(),
    loadSoftware(),
    loadSapProfiles(),
  ])
})
</script>

<style scoped>
.ref {
  max-width: 1400px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 2rem;
}

.search-input-container {
  position: relative;
  margin-bottom: 1rem;
}

/* Search input styling inherited from main.css */

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background: var(--color-background);
  color: var(--color-text);
}

/* Add button styling moved to main.css */

/* Table container styling inherited from main.css */

/* Table styling moved to main.css */

.profile-row {
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.profile-row:hover {
  background: var(--color-background-soft);
}

/* Table cell styling moved to main.css */

.profile-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.profile-name {
  font-weight: 500;
  color: var(--color-text);
}

.template-badge {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.category-badge {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.description {
  max-width: 200px;
  color: var(--color-text-muted);
}

.sachbereich {
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
}

.team {
  font-size: 0.9em;
  color: var(--color-text-muted);
}

.no-data {
  color: var(--color-text-muted);
  font-style: italic;
}

.count {
  text-align: center;
  font-weight: 600;
  color: var(--color-text);
}

/* Status badge styling moved to main.css */

/* Additional status type */
.status-badge.entwurf {
  background: rgba(251, 191, 36, 0.1);
  color: rgb(251, 191, 36);
}

/* Action buttons container moved to main.css */
.action-buttons {
  justify-content: flex-end; /* Profile-specific alignment */
}

.text-right {
  text-align: right !important;
}

/* Action button styling moved to main.css */

/* Additional profile-specific action buttons */
.action-btn.preview {
  background: rgba(59, 130, 246, 0.1) !important;
  color: rgb(59, 130, 246) !important;
}

.action-btn.preview:hover {
  background: rgb(59, 130, 246) !important;
  color: white !important;
}

.action-btn.duplicate {
  background: rgba(168, 85, 247, 0.1) !important;
  color: rgb(168, 85, 247) !important;
}

.action-btn.duplicate:hover {
  background: rgb(168, 85, 247) !important;
  color: white !important;
}

.shadow-line {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
  margin: 2rem 0;
}

.empty-message {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state p {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  margin: 0;
}

@media (max-width: 768px) {
  .data-table {
    font-size: 0.9rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Navigation buttons styling inherited from main.css */
.navigation-buttons {
  margin-top: 2rem; /* View-specific spacing */
}

/* Modal styles moved to main.css */

/* Profile-specific modal customizations */
.modal-content.large {
  max-width: 1000px;
}

.modal-form {
  padding: 24px;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section h4 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 1.1em;
  border-bottom: 2px solid #e1e5e9;
  padding-bottom: 8px;
}

/* Form styling moved to main.css */

/* Profile-specific form customizations */
.form-group.full-width {
  grid-column: 1 / -1;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type='checkbox'] {
  width: auto;
}

.selection-area {
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.item-card {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.item-card.selected {
  border-color: #667eea;
  background: #e3f2fd;
}

.item-name {
  font-weight: 600;
  color: #2d3748;
}

.item-category,
.item-manufacturer,
.item-group {
  font-size: 0.85em;
  color: #6c757d;
}

/* Modal actions and button styling moved to main.css */

/* Preview Content */
.preview-content {
  padding: 24px;
}

.preview-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 1.1em;
}

.preview-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 8px;
}

.preview-item {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9em;
  color: #495057;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-profiles {
    padding: 10px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .search-filter-section {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .data-table {
    font-size: 0.9em;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}

/* Navigation buttons styling inherited from main.css */
.navigation-buttons {
  margin-top: 2rem; /* View-specific spacing */
}

.arrow-left {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.back-button:hover .arrow-left {
  transform: translateX(-2px);
}
</style>
