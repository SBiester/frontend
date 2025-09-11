<template>
<div>
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
            class="search-input"
            placeholder="Profile durchsuchen (Name, Bereich, Sachbereich & Team)..."
          />
          <div class="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>
        
        <div class="filter-controls">
          <select v-model="selectedCategory" @change="filterProfiles" class="filter-select">
            <option value="">Alle Kategorien</option>
            <option value="Entwicklung">Entwicklung</option>
            <option value="Design">Design</option>
            <option value="Administration">Administration</option>
            <option value="Marketing">Marketing</option>
            <option value="Standard">Standard</option>
          </select>
          
          <select v-model="selectedStatus" @change="filterProfiles" class="filter-select">
            <option value="">Alle Status</option>
            <option value="aktiv">Aktiv</option>
            <option value="inaktiv">Inaktiv</option>
            <option value="entwurf">Entwurf</option>
          </select>
          
          <button @click="openCreateModal" class="add-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14m7-7H5"></path>
            </svg>
            Neues Profil
          </button>
        </div>
      </div>

      <!-- Profiles Table -->
      <div class="profiles-table-container">
        <table class="profiles-table">
          <thead>
            <tr>
              <th>Profil Name</th>
              <th>Bereich</th>
              <th>Sachbereich & Team</th>
              <th>Hardware</th>
              <th>Software</th>
              <th>SAP Profile</th>
              <th>Status</th>
              <th>Erstellt</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
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
              <td class="description">{{ profile.description }}</td>
              <td class="count">{{ profile.hardwareCount }}</td>
              <td class="count">{{ profile.softwareCount }}</td>
              <td class="count">{{ profile.sapProfileCount }}</td>
              <td>
                <span :class="`status-badge ${profile.status}`">{{ getStatusLabel(profile.status) }}</span>
              </td>
              <td>{{ formatDate(profile.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editProfile(profile)" class="action-btn edit" title="Bearbeiten">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button @click="showProfilePreview(profile)" class="action-btn preview" title="Vorschau">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button @click="duplicateProfile(profile)" class="action-btn duplicate" title="Duplizieren">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  <button @click="deleteProfile(profile)" class="action-btn delete" title="Löschen">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
                  >
                </div>
                
                <div class="form-group">
                  <label for="profileCategory">Kategorie *</label>
                  <select id="profileCategory" v-model="profileForm.category" required class="form-select">
                    <option value="">Kategorie wählen</option>
                    <option value="Entwicklung">Entwicklung</option>
                    <option value="Design">Design</option>
                    <option value="Administration">Administration</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                
                <div class="form-group full-width">
                  <label for="profileDescription">Beschreibung</label>
                  <textarea 
                    id="profileDescription"
                    v-model="profileForm.description" 
                    class="form-textarea"
                    placeholder="Beschreibung des Profils..."
                    rows="3"
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label for="profileStatus">Status</label>
                  <select id="profileStatus" v-model="profileForm.status" class="form-select">
                    <option value="aktiv">Aktiv</option>
                    <option value="inaktiv">Inaktiv</option>
                    <option value="entwurf">Entwurf</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="checkbox-label">
                    <input v-model="profileForm.isTemplate" type="checkbox">
                    <span class="checkmark"></span>
                    Als Template markieren
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Hardware Selection -->
            <div class="form-section">
              <h4>Hardware Auswahl</h4>
              <div class="selection-area">
                <div class="search-box small">
                  <input 
                    v-model="hardwareSearch" 
                    type="text" 
                    placeholder="Hardware suchen..."
                    class="search-input"
                  >
                </div>
                <div class="items-grid">
                  <div 
                    v-for="item in filteredHardware" 
                    :key="item.id" 
                    :class="['item-card', { selected: isHardwareSelected(item) }]"
                    @click="toggleHardware(item)"
                  >
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-category">{{ item.category }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Software Selection -->
            <div class="form-section">
              <h4>Software Auswahl</h4>
              <div class="selection-area">
                <div class="search-box small">
                  <input 
                    v-model="softwareSearch" 
                    type="text" 
                    placeholder="Software suchen..."
                    class="search-input"
                  >
                </div>
                <div class="items-grid">
                  <div 
                    v-for="item in filteredSoftware" 
                    :key="item.id" 
                    :class="['item-card', { selected: isSoftwareSelected(item) }]"
                    @click="toggleSoftware(item)"
                  >
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-manufacturer">{{ item.manufacturer }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- SAP Profile Selection -->
            <div class="form-section">
              <h4>SAP Profile Auswahl</h4>
              <div class="selection-area">
                <div class="search-box small">
                  <input 
                    v-model="sapSearch" 
                    type="text" 
                    placeholder="SAP Profile suchen..."
                    class="search-input"
                  >
                </div>
                <div class="items-grid">
                  <div 
                    v-for="item in filteredSapProfiles" 
                    :key="item.id" 
                    :class="['item-card', { selected: isSapSelected(item) }]"
                    @click="toggleSapProfile(item)"
                  >
                    <span class="item-name">{{ item.Bezeichnung }}</span>
                    <span class="item-group">{{ item.Rollengruppe?.Bezeichnung }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeProfileModal" class="btn-secondary">Abbrechen</button>
            <button type="submit" class="btn-primary">{{ editingProfile ? 'Speichern' : 'Erstellen' }}</button>
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
          <div class="preview-sections">
            <div class="preview-section">
              <h4>Hardware ({{ previewProfile?.hardwareItems?.length || 0 }})</h4>
              <div class="preview-items">
                <div v-for="item in previewProfile?.hardwareItems" :key="item.id" class="preview-item">
                  {{ item.name }} ({{ item.category }})
                </div>
              </div>
            </div>
            
            <div class="preview-section">
              <h4>Software ({{ previewProfile?.softwareItems?.length || 0 }})</h4>
              <div class="preview-items">
                <div v-for="item in previewProfile?.softwareItems" :key="item.id" class="preview-item">
                  {{ item.name }} - {{ item.manufacturer }}
                </div>
              </div>
            </div>
            
            <div class="preview-section">
              <h4>SAP Profile ({{ previewProfile?.sapItems?.length || 0 }})</h4>
              <div class="preview-items">
                <div v-for="item in previewProfile?.sapItems" :key="item.id" class="preview-item">
                  {{ item.Bezeichnung }} ({{ item.Rollengruppe?.Bezeichnung }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    
  </div>
</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import adminService from '@/services/adminService'

const emit = defineEmits(['go-back'])
    // Reactive state
    const searchTerm = ref('')
    const selectedCategory = ref('')
    const selectedStatus = ref('')
    const showProfileModal = ref(false)
    const showPreviewModal = ref(false)
    const editingProfile = ref(null)
    const previewProfile = ref(null)
    
    // Search states for modal
    const hardwareSearch = ref('')
    const softwareSearch = ref('')
    const sapSearch = ref('')
    
    // Form data
    const profileForm = reactive({
      name: '',
      category: '',
      description: '',
      status: 'aktiv',
      isTemplate: false,
      hardwareItems: [],
      softwareItems: [],
      sapItems: []
    })
    
    // Mock data
    const profiles = ref([
      {
        id: 1,
        name: 'Frontend Entwickler',
        category: 'Entwicklung',
        description: 'Profil für Frontend-Entwicklung mit React/Vue',
        hardwareCount: 8,
        softwareCount: 12,
        sapProfileCount: 5,
        status: 'aktiv',
        isTemplate: true,
        created_at: '2024-01-15',
        hardwareItems: [],
        softwareItems: [],
        sapItems: []
      },
      {
        id: 2,
        name: 'UI/UX Designer',
        category: 'Design',
        description: 'Profil für Design-Arbeitsplätze',
        hardwareCount: 6,
        softwareCount: 15,
        sapProfileCount: 3,
        status: 'aktiv',
        isTemplate: false,
        created_at: '2024-01-20',
        hardwareItems: [],
        softwareItems: [],
        sapItems: []
      },
      {
        id: 3,
        name: 'Marketing Manager',
        category: 'Marketing',
        description: 'Standard Marketing Arbeitsplatz',
        hardwareCount: 4,
        softwareCount: 8,
        sapProfileCount: 4,
        status: 'inaktiv',
        isTemplate: false,
        created_at: '2024-02-01',
        hardwareItems: [],
        softwareItems: [],
        sapItems: []
      }
    ])
    
    const availableHardware = ref([
      { id: 1, name: 'Dell Monitor 24"', category: 'Monitor' },
      { id: 2, name: 'MacBook Pro M2', category: 'Laptop' },
      { id: 3, name: 'Magic Mouse', category: 'Eingabegerät' }
    ])
    
    const availableSoftware = ref([
      { id: 1, name: 'Visual Studio Code', manufacturer: 'Microsoft' },
      { id: 2, name: 'Adobe Creative Suite', manufacturer: 'Adobe' },
      { id: 3, name: 'Slack', manufacturer: 'Slack Technologies' }
    ])
    
    const availableSapProfiles = ref([
      { id: 1, Bezeichnung: 'Basis Berechtigung', Rollengruppe: { Bezeichnung: 'Standard' } },
      { id: 2, Bezeichnung: 'Entwickler Zugang', Rollengruppe: { Bezeichnung: 'Entwicklung' } }
    ])
    
    // Computed properties
    const filteredProfiles = computed(() => {
      let filtered = profiles.value
      
      if (searchTerm.value) {
        const search = searchTerm.value.toLowerCase()
        filtered = filtered.filter(profile => 
          profile.name.toLowerCase().includes(search) ||
          profile.description.toLowerCase().includes(search)
        )
      }
      
      if (selectedCategory.value) {
        filtered = filtered.filter(profile => profile.category === selectedCategory.value)
      }
      
      if (selectedStatus.value) {
        filtered = filtered.filter(profile => profile.status === selectedStatus.value)
      }
      
      return filtered
    })
    
    const totalProfiles = computed(() => profiles.value.length)
    const activeProfiles = computed(() => profiles.value.filter(p => p.status === 'aktiv').length)
    const mostUsedCategory = computed(() => {
      const categories = {}
      profiles.value.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1
      })
      return Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, 'Entwicklung')
    })
    
    const filteredHardware = computed(() => {
      if (!hardwareSearch.value) return availableHardware.value
      const search = hardwareSearch.value.toLowerCase()
      return availableHardware.value.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
      )
    })
    
    const filteredSoftware = computed(() => {
      if (!softwareSearch.value) return availableSoftware.value
      const search = softwareSearch.value.toLowerCase()
      return availableSoftware.value.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.manufacturer.toLowerCase().includes(search)
      )
    })
    
    const filteredSapProfiles = computed(() => {
      if (!sapSearch.value) return availableSapProfiles.value
      const search = sapSearch.value.toLowerCase()
      return availableSapProfiles.value.filter(item =>
        item.Bezeichnung.toLowerCase().includes(search) ||
        item.Rollengruppe?.Bezeichnung.toLowerCase().includes(search)
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
    }
    
    const editProfile = (profile) => {
      editingProfile.value = profile
      Object.assign(profileForm, {
        name: profile.name,
        category: profile.category,
        description: profile.description,
        status: profile.status,
        isTemplate: profile.isTemplate,
        hardwareItems: [...(profile.hardwareItems || [])],
        softwareItems: [...(profile.softwareItems || [])],
        sapItems: [...(profile.sapItems || [])]
      })
      showProfileModal.value = true
    }
    
    const closeProfileModal = () => {
      showProfileModal.value = false
      editingProfile.value = null
      resetProfileForm()
    }
    
    const resetProfileForm = () => {
      Object.assign(profileForm, {
        name: '',
        category: '',
        description: '',
        status: 'aktiv',
        isTemplate: false,
        hardwareItems: [],
        softwareItems: [],
        sapItems: []
      })
      hardwareSearch.value = ''
      softwareSearch.value = ''
      sapSearch.value = ''
    }
    
    const saveProfile = () => {
      if (editingProfile.value) {
        const index = profiles.value.findIndex(p => p.id === editingProfile.value.id)
        if (index !== -1) {
          profiles.value[index] = {
            ...profiles.value[index],
            ...profileForm,
            hardwareCount: profileForm.hardwareItems.length,
            softwareCount: profileForm.softwareItems.length,
            sapProfileCount: profileForm.sapItems.length
          }
        }
      } else {
        const newProfile = {
          id: Date.now(),
          ...profileForm,
          hardwareCount: profileForm.hardwareItems.length,
          softwareCount: profileForm.softwareItems.length,
          sapProfileCount: profileForm.sapItems.length,
          created_at: new Date().toISOString().split('T')[0]
        }
        profiles.value.push(newProfile)
      }
      closeProfileModal()
    }
    
    const deleteProfile = (profile) => {
      if (confirm(`Sind Sie sicher, dass Sie das Profil "${profile.name}" löschen möchten?`)) {
        const index = profiles.value.findIndex(p => p.id === profile.id)
        if (index !== -1) {
          profiles.value.splice(index, 1)
        }
      }
    }
    
    const duplicateProfile = (profile) => {
      const duplicate = {
        ...profile,
        id: Date.now(),
        name: `${profile.name} (Kopie)`,
        created_at: new Date().toISOString().split('T')[0]
      }
      profiles.value.push(duplicate)
    }
    
    const showProfilePreview = (profile) => {
      previewProfile.value = profile
      showPreviewModal.value = true
    }
    
    const closePreviewModal = () => {
      showPreviewModal.value = false
      previewProfile.value = null
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
        entwurf: 'Entwurf'
      }
      return labels[status] || status
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('de-DE')
    }
    
    // Selection methods
    const isHardwareSelected = (item) => {
      return profileForm.hardwareItems.some(selected => selected.id === item.id)
    }
    
    const isSoftwareSelected = (item) => {
      return profileForm.softwareItems.some(selected => selected.id === item.id)
    }
    
    const isSapSelected = (item) => {
      return profileForm.sapItems.some(selected => selected.id === item.id)
    }
    
    const toggleHardware = (item) => {
      const index = profileForm.hardwareItems.findIndex(selected => selected.id === item.id)
      if (index === -1) {
        profileForm.hardwareItems.push(item)
      } else {
        profileForm.hardwareItems.splice(index, 1)
      }
    }
    
    const toggleSoftware = (item) => {
      const index = profileForm.softwareItems.findIndex(selected => selected.id === item.id)
      if (index === -1) {
        profileForm.softwareItems.push(item)
      } else {
        profileForm.softwareItems.splice(index, 1)
      }
    }
    
    const toggleSapProfile = (item) => {
      const index = profileForm.sapItems.findIndex(selected => selected.id === item.id)
      if (index === -1) {
        profileForm.sapItems.push(item)
      } else {
        profileForm.sapItems.splice(index, 1)
      }
    }
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

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-button);
}

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

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem !important;
  background: var(--color-button) !important;
  color: var(--color-text) !important;
  border: none !important;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-button:hover {
  background: var(--color-button-hover) !important;
}

.profiles-table-container {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.profiles-table {
  width: 100%;
  border-collapse: collapse;
}

.profiles-table th {
  background: var(--color-background-mute);
  color: var(--color-text);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
}

.profile-row {
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.profile-row:hover {
  background: var(--color-background-soft);
}

.profiles-table td {
  padding: 1rem;
  vertical-align: middle;
}

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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-muted);
}

.count {
  text-align: center;
  font-weight: 600;
  color: var(--color-text);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.aktiv {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status-badge.inaktiv {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.status-badge.entwurf {
  background: rgba(251, 191, 36, 0.1);
  color: rgb(251, 191, 36);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem !important;
  border: none !important;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  background: var(--color-background-mute) !important;
  color: var(--color-text) !important;
}

.action-btn.edit:hover {
  background: var(--color-button) !important;
  color: var(--color-text) !important;
}

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

.action-btn.delete {
  background: rgba(239, 68, 68, 0.1) !important;
  color: rgb(239, 68, 68) !important;
}

.action-btn.delete:hover {
  background: rgb(239, 68, 68) !important;
  color: white !important;
}

.shadow-line {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .profiles-table {
    font-size: 0.9rem;
  }
  
  .profiles-table th,
  .profiles-table td {
    padding: 0.5rem;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Navigation buttons in JobView style */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3);
}

.modal-content.large {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.3em;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #6c757d;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #495057;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
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

.checkbox-label input[type="checkbox"] {
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

.item-category, .item-manufacturer, .item-group {
  font-size: 0.85em;
  color: #6c757d;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background: #5a67d8;
}

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
  
  .profiles-table {
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

/* Navigation buttons in JobView style */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.next-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.arrow-left {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.back-button:hover .arrow-left {
  transform: translateX(-2px);
}
</style>