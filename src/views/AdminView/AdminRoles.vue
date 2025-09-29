<template>
  <div>
    <!-- Dark overlay for edit mode - moved to body level -->
    <Teleport to="body">
      <div v-show="showEditOverlay" class="edit-overlay" @click="closeEditMode">
        <!-- Add Group Modal -->
        <div v-if="showAddGroupForm" class="modal-overlay" @click="closeModals">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>
                {{ editingGroup ? 'Rollengruppe bearbeiten' : 'Neue Rollengruppe hinzufügen' }}
              </h3>
              <button @click="closeModals" class="close-btn">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addGroup">
                <div class="form-group">
                  <label>Bezeichnung</label>
                  <input v-model="newGroup.Bezeichnung" type="text" required class="form-input" />
                </div>
                <div class="modal-actions">
                  <button type="button" @click="closeModals" class="btn-secondary">
                    Abbrechen
                  </button>
                  <button type="submit" class="btn-primary">
                    {{ editingGroup ? 'Aktualisieren' : 'Rollengruppe hinzufügen' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Add Profile Modal -->
        <div v-if="showAddProfileForm" class="modal-overlay" @click="closeModals">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>
                {{
                  editingProfile
                    ? 'SAP Berechtigung bearbeiten'
                    : 'Neues SAP Berechtigung hinzufügen'
                }}
              </h3>
              <button @click="closeModals" class="close-btn">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addProfile">
                <div class="form-group">
                  <label>Bezeichnung</label>
                  <input v-model="newProfile.Bezeichnung" type="text" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>Schlüssel</label>
                  <input v-model="newProfile.Schluessel" type="text" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>Rollengruppe</label>
                  <select v-model="newProfile.RollengruppeID" required class="form-input">
                    <option value="">Rollengruppe wählen</option>
                    <option
                      v-for="group in rollengruppen"
                      :key="group.RollengruppeID"
                      :value="group.RollengruppeID"
                    >
                      {{ group.Bezeichnung }}
                    </option>
                  </select>
                </div>
                <div class="modal-actions">
                  <button type="button" @click="closeModals" class="btn-secondary">
                    Abbrechen
                  </button>
                  <button type="submit" class="btn-primary">
                    {{ editingProfile ? 'Aktualisieren' : 'Profil hinzufügen' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <hr class="shadow-line" />
    <div class="ref">
      <h2>SAP - Rollen</h2>
      <p>Verwalte Rollengruppen und SAP-Profile</p>
      <hr class="shadow-line" />

      <div class="roles-management">
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            @click="activeTab = 'profiles'"
            :class="{ active: activeTab === 'profiles' }"
            class="tab-button"
          >
            SAP Berechtigungen
          </button>
          <button
            @click="activeTab = 'groups'"
            :class="{ active: activeTab === 'groups' }"
            class="tab-button"
          >
            Rollengruppen
          </button>
        </div>

        <!-- Rollengruppen Tab -->
        <div v-if="activeTab === 'groups'" class="tab-content">
          <div class="section-header">
            <h3>Rollengruppen</h3>
            <button @click="openAddGroupForm" class="add-button">
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
              Neue Rollengruppe
            </button>
          </div>

          <div class="groups-grid">
            <div v-for="group in rollengruppen" :key="group.RollengruppeID" class="group-card">
              <div class="group-header">
                <div class="group-title-section">
                  <h4>{{ group.Bezeichnung }}</h4>
                  <span class="profile-count-badge">{{
                    getProfileCountText(group.RollengruppeID)
                  }}</span>
                </div>
                <div class="group-actions">
                  <button @click="editGroup(group)" class="action-btn edit">
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
                  <button @click="deleteGroup(group)" class="action-btn delete">
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
              </div>
              <div
                v-if="group.sammelrollen && group.sammelrollen.length > 0"
                class="group-profiles"
              >
                <h5>{{ getZugehoerigeProfileTitle(group.sammelrollen.length) }}:</h5>
                <div class="profile-list">
                  <span
                    v-for="profil in group.sammelrollen.slice(0, 3)"
                    :key="profil.SammelrollenID"
                    class="profile-tag"
                  >
                    {{ profil.Bezeichnung }}
                  </span>
                  <span v-if="group.sammelrollen.length > 3" class="more-profiles">
                    + {{ getWeitereText(group.sammelrollen.length - 3) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SAP Berechtigungen Tab -->
        <div v-if="activeTab === 'profiles'" class="tab-content">
          <div class="section-header">
            <h3>SAP Berechtigungen (Sammelrollen)</h3>
            <div class="profile-controls">
              <div class="search-input-container">
                <input
                  v-model="profileSearchQuery"
                  type="text"
                  class="search-input compact"
                  placeholder="Profile durchsuchen..."
                />
                <div class="search-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="11" cy="11" r="7"></circle>
                    <line x1="16.65" y1="16.65" x2="21" y2="21"></line>
                  </svg>
                </div>
              </div>
              <select v-model="selectedGroupFilter" class="filter-select">
                <option value="">Alle Rollengruppen</option>
                <option
                  v-for="group in rollengruppen"
                  :key="group.RollengruppeID"
                  :value="group.RollengruppeID"
                >
                  {{ group.Bezeichnung }}
                </option>
              </select>
              <button @click="openAddProfileForm" class="add-button">
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

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Bezeichnung</th>
                  <th>Schlüssel</th>
                  <th>Rollengruppe</th>
                  <th class="text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="profile in sammelrollen"
                  :key="profile.SammelrollenID"
                  class="profile-row"
                >
                  <td class="profile-name">{{ profile.Bezeichnung }}</td>
                  <td>
                    <code class="profile-key">{{ profile.Schluessel }}</code>
                  </td>
                  <td>
                    <span class="group-badge">{{ getGroupName(profile.RollengruppeID) }}</span>
                  </td>
                  <td class="text-right">
                    <div class="action-buttons">
                      <button @click="editProfile(profile)" class="action-btn edit">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                          ></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button @click="deleteProfile(profile)" class="action-btn delete">
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

          <!-- Pagination Controls -->
          <div v-if="paginationData.last_page > 1" class="pagination-container">
            <div class="pagination-info">
              Zeige {{ (paginationData.current_page - 1) * paginationData.per_page + 1 }} -
              {{
                Math.min(
                  paginationData.current_page * paginationData.per_page,
                  paginationData.total,
                )
              }}
              von {{ paginationData.total }} Profilen
            </div>
            <div class="pagination-controls">
              <button
                @click="prevPage"
                :disabled="paginationData.current_page <= 1"
                class="pagination-btn"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Zurück
              </button>

              <div class="page-numbers">
                <template v-for="page in getVisiblePages()" :key="page">
                  <button
                    v-if="page !== '...'"
                    @click="goToPage(page)"
                    :class="{ active: page === paginationData.current_page }"
                    class="page-btn"
                  >
                    {{ page }}
                  </button>
                  <span v-else class="page-ellipsis">...</span>
                </template>
              </div>

              <button
                @click="nextPage"
                :disabled="paginationData.current_page >= paginationData.last_page"
                class="pagination-btn"
              >
                Weiter
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import adminService from '@/services/adminService'

const emit = defineEmits(['go-back'])

const activeTab = ref('profiles')
const profileSearchQuery = ref('')
const selectedGroupFilter = ref('')
const showEditOverlay = ref(false)

const rollengruppen = ref([])
const sammelrollen = ref([])
const paginationData = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})
const isLoadingProfiles = ref(false)

const showAddGroupForm = ref(false)
const showAddProfileForm = ref(false)

const editingGroup = ref(null)
const editingProfile = ref(null)

const newGroup = ref({ Bezeichnung: '' })
const newProfile = ref({ Bezeichnung: '', Schluessel: '', RollengruppeID: '' })

const loadRollengruppen = async () => {
  try {
    const data = await adminService.getSapRoleGroups()
    // The API already returns groups with sammelrollen included
    rollengruppen.value = data || []
  } catch (error) {
    console.error('Fehler beim Laden der Rollengruppen:', error)
    // Fallback data if API fails
    rollengruppen.value = [
      {
        RollengruppeID: 1,
        Bezeichnung: 'Standard Berechtigungen',
        sammelrollen: [
          {
            SammelrollenID: 1,
            Bezeichnung: 'SO-Berechtigung (Basis)',
            Schluessel: 'AP303_BC_XXBCXX:GLOBAL-ALL-USR',
          },
        ],
      },
      {
        RollengruppeID: 2,
        Bezeichnung: 'Erweiterte Berechtigungen',
        sammelrollen: [
          { SammelrollenID: 2, Bezeichnung: 'Entwickler Zugang', Schluessel: 'DEV_ACCESS_FULL' },
        ],
      },
    ]
  }
}

const loadSammelrollen = async (page = 1) => {
  try {
    isLoadingProfiles.value = true
    const params = {
      page: page,
      per_page: paginationData.value.per_page,
    }

    // Add search if active
    if (profileSearchQuery.value) {
      params.search = profileSearchQuery.value
    }

    // Add group filter if active
    if (selectedGroupFilter.value) {
      params.group = selectedGroupFilter.value
    }

    const data = await adminService.getSapRoles(params)

    if (data && data.data) {
      sammelrollen.value = data.data
      paginationData.value = {
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      }
    } else {
      sammelrollen.value = data || []
    }
  } catch (error) {
    console.error('Fehler beim Laden der Sammelrollen:', error)
    // Fallback data if API fails
    sammelrollen.value = [
      {
        SammelrollenID: 1,
        Bezeichnung: 'SO-Berechtigung (Basis)',
        Schluessel: 'AP303_BC_XXBCXX:GLOBAL-ALL-USR',
        RollengruppeID: 1,
        rollengruppe: { Bezeichnung: 'Standard Berechtigungen' },
      },
      {
        SammelrollenID: 2,
        Bezeichnung: 'Entwickler Zugang',
        Schluessel: 'DEV_ACCESS_FULL',
        RollengruppeID: 2,
        rollengruppe: { Bezeichnung: 'Erweiterte Berechtigungen' },
      },
    ]
  } finally {
    isLoadingProfiles.value = false
  }
}

// Pagination functions
const goToPage = (page) => {
  if (page >= 1 && page <= paginationData.value.last_page) {
    loadSammelrollen(page)
  }
}

const nextPage = () => {
  if (paginationData.value.current_page < paginationData.value.last_page) {
    goToPage(paginationData.value.current_page + 1)
  }
}

const prevPage = () => {
  if (paginationData.value.current_page > 1) {
    goToPage(paginationData.value.current_page - 1)
  }
}

// Search and filter watchers
watch(profileSearchQuery, () => {
  loadSammelrollen(1) // Reset to first page when searching
})

watch(selectedGroupFilter, () => {
  loadSammelrollen(1) // Reset to first page when filtering
})

// Function to get visible page numbers for pagination
const getVisiblePages = () => {
  const current = paginationData.value.current_page
  const last = paginationData.value.last_page
  const pages = []

  if (last <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
  } else {
    // Complex pagination with ellipsis
    if (current <= 4) {
      // Show first 5 pages + ellipsis + last page
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(last)
    } else if (current >= last - 3) {
      // Show first page + ellipsis + last 5 pages
      pages.push(1)
      pages.push('...')
      for (let i = last - 4; i <= last; i++) {
        pages.push(i)
      }
    } else {
      // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(last)
    }
  }

  return pages
}

const getProfileCount = (groupId) => {
  const group = rollengruppen.value.find((g) => g.RollengruppeID === groupId)
  return group && group.sammelrollen ? group.sammelrollen.length : 0
}

const getProfileCountText = (groupId) => {
  const count = getProfileCount(groupId)
  return `${count} ${count === 1 ? 'Profil' : 'Profile'}`
}

const getZugehoerigeProfileTitle = (count) => {
  return count === 1 ? 'Zugehöriges Profil' : 'Zugehörige Profile'
}

const getWeitereText = (count) => {
  return `${count} ${count === 1 ? 'weiteres' : 'weitere'}`
}

const getGroupName = (groupId) => {
  const group = rollengruppen.value.find((g) => g.RollengruppeID === groupId)
  return group ? group.Bezeichnung : 'Unbekannt'
}

const addGroup = async () => {
  try {
    if (editingGroup.value) {
      // Update existing group
      const response = await adminService.updateSapRoleGroup(editingGroup.value, newGroup.value)
      if (response && response.group) {
        const index = rollengruppen.value.findIndex((g) => g.RollengruppeID === editingGroup.value)
        if (index !== -1) {
          rollengruppen.value[index] = response.group
        }
      }
    } else {
      // Create new group
      const response = await adminService.createSapRoleGroup(newGroup.value)
      if (response && response.group) {
        rollengruppen.value.push(response.group)
      }
    }
    closeModals()
    await loadRollengruppen() // Reload to get fresh data
  } catch (error) {
    console.error('Fehler beim Speichern der Rollengruppe:', error)
    alert(
      'Fehler beim Speichern der Rollengruppe: ' + (error.response?.data?.message || error.message),
    )
  }
}

const addProfile = async () => {
  try {
    if (editingProfile.value) {
      // Update existing profile
      const response = await adminService.updateSapRole(editingProfile.value, newProfile.value)
      if (response && response.role) {
        const index = sammelrollen.value.findIndex((p) => p.SammelrollenID === editingProfile.value)
        if (index !== -1) {
          sammelrollen.value[index] = response.role
        }
      }
    } else {
      // Create new profile
      const response = await adminService.createSapRole(newProfile.value)
      if (response && response.role) {
        sammelrollen.value.push(response.role)
      }
    }
    closeModals()
    await loadSammelrollen() // Reload to get fresh data
  } catch (error) {
    console.error('Fehler beim Speichern des SAP Berechtigungs:', error)
    alert(
      'Fehler beim Speichern des SAP Berechtigungs: ' +
        (error.response?.data?.message || error.message),
    )
  }
}

const openAddGroupForm = () => {
  newGroup.value = { Bezeichnung: '' }
  editingGroup.value = null
  showAddGroupForm.value = true
  showEditOverlay.value = true
}

const editGroup = (group) => {
  newGroup.value = { ...group }
  editingGroup.value = group.RollengruppeID
  showAddGroupForm.value = true
  showEditOverlay.value = true
}

const deleteGroup = async (group) => {
  if (confirm(`Rollengruppe "${group.Bezeichnung}" wirklich löschen?`)) {
    try {
      await adminService.deleteSapRoleGroup(group.RollengruppeID)
      rollengruppen.value = rollengruppen.value.filter(
        (g) => g.RollengruppeID !== group.RollengruppeID,
      )
    } catch (error) {
      console.error('Fehler beim Löschen der Rollengruppe:', error)
      alert(
        'Fehler beim Löschen der Rollengruppe: ' + (error.response?.data?.message || error.message),
      )
    }
  }
}

const openAddProfileForm = () => {
  newProfile.value = { Bezeichnung: '', Schluessel: '', RollengruppeID: '' }
  editingProfile.value = null
  showAddProfileForm.value = true
  showEditOverlay.value = true
}

const editProfile = (profile) => {
  newProfile.value = { ...profile }
  editingProfile.value = profile.SammelrollenID
  showAddProfileForm.value = true
  showEditOverlay.value = true
}

const deleteProfile = async (profile) => {
  if (confirm(`SAP Berechtigung "${profile.Bezeichnung}" wirklich löschen?`)) {
    try {
      await adminService.deleteSapRole(profile.SammelrollenID)
      sammelrollen.value = sammelrollen.value.filter(
        (p) => p.SammelrollenID !== profile.SammelrollenID,
      )
    } catch (error) {
      console.error('Fehler beim Löschen des SAP Berechtigungs:', error)
      alert(
        'Fehler beim Löschen des SAP Berechtigungs: ' +
          (error.response?.data?.message || error.message),
      )
    }
  }
}

const closeModals = () => {
  showAddGroupForm.value = false
  showAddProfileForm.value = false
  editingGroup.value = null
  editingProfile.value = null
  newGroup.value = { Bezeichnung: '' }
  newProfile.value = { Bezeichnung: '', Schluessel: '', RollengruppeID: '' }
  showEditOverlay.value = false
}

const closeEditMode = () => {
  closeModals()
}

onMounted(async () => {
  await loadRollengruppen()
  await loadSammelrollen()
})
</script>

<style scoped>
.ref {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h3 {
  margin: 0;
  color: var(--color-text);
}

.profile-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.profile-controls > * {
  margin: 0 !important;
}

.search-input-container {
  position: relative;
}

/* Search input - using compact variant from main.css */
.search-input {
  border-radius: 0.25rem; /* Override for AdminView */
}

.search-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.8333rem;
}

.filter-select option {
  background: var(--color-background) !important;
  color: var(--color-text) !important;
  padding: 0.5rem !important;
}

.filter-select option:checked,
.filter-select option[selected] {
  background: var(--color-button) !important;
  color: var(--color-text) !important;
}

/* SAP-specific search input styling - match dropdown styling */
.profile-controls .search-input.compact {
  color: var(--color-text) !important;
  font-size: 0.8333rem !important;
}

.profile-controls input.search-input {
  color: var(--color-text) !important;
  font-size: 0.8333rem !important;
}

/* Dark overlay for edit mode */
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999999;
  cursor: pointer;
}

/* Add button styling moved to main.css */
button.add-button {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  line-height: 1 !important;
  justify-content: center !important;
}

button.add-button svg {
  flex-shrink: 0 !important;
  vertical-align: middle !important;
  margin: 0 !important;
  position: static !important;
}

/* Even more specific targeting for the SAP roles panel */
.profile-controls button.add-button {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.group-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.group-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.group-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.profile-count-badge {
  background: var(--color-button);
  color: var(--color-button-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.group-header h4 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.1rem;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
}

.stat-badge {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.stat-badge.primary {
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.85rem;
}

.group-profiles h5 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

.profile-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-tag {
  background: var(--color-button);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.more-profiles {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-style: italic;
}

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

.profile-name {
  font-weight: 500;
  color: var(--color-text);
}

.profile-key {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.group-badge {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

/* Action button styling moved to main.css */
.action-buttons {
  justify-content: flex-end; /* Roles-specific alignment */
}

/* Modal styles moved to main.css */

/* Form and button styling moved to main.css */

/* Navigation buttons styling inherited from main.css */
.navigation-buttons {
  margin-top: 2rem; /* View-specific spacing */
}

.shadow-line {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-controls {
    flex-direction: column;
  }
}

/* Search input - using compact variant from main.css */
.search-input {
  border-radius: 0.25rem; /* Override for AdminView */
}

.text-right {
  text-align: right !important;
}

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem !important;
  background: var(--color-background) !important;
  color: var(--color-text) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-button) !important;
  border-color: var(--color-button) !important;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.5rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0 !important;
  background: var(--color-background) !important;
  color: var(--color-text) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.page-btn:hover {
  background: var(--color-button) !important;
  border-color: var(--color-button) !important;
}

.page-btn.active {
  background: var(--color-button) !important;
  border-color: var(--color-button) !important;
  font-weight: 600;
}

.page-ellipsis {
  color: var(--color-text-muted);
  padding: 0 0.5rem;
  font-size: 0.9rem;
}
</style>
