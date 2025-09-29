<template>
  <div>
    <hr class="shadow-line" />
    <div class="ref">
      <h2>Stammdaten-Verwaltung</h2>
      <p>Verwalten Sie Bereiche, Teams und Funktionen</p>
      <hr class="shadow-line" />

      <div class="masterdata-management">
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            @click="activeTab = 'bereiche'"
            :class="{ active: activeTab === 'bereiche' }"
            class="tab-button"
          >
            Bereiche
          </button>
          <button
            @click="activeTab = 'teams'"
            :class="{ active: activeTab === 'teams' }"
            class="tab-button"
          >
            Teams
          </button>
          <button
            @click="activeTab = 'funktionen'"
            :class="{ active: activeTab === 'funktionen' }"
            class="tab-button"
          >
            Funktionen
          </button>
        </div>

        <!-- Bereiche Tab -->
        <div v-if="activeTab === 'bereiche'" class="tab-content">
          <div class="section-header">
            <h3>Bereiche verwalten</h3>
            <button @click="openBereichModal" class="add-button">
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
              Neuer Bereich
            </button>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Bereich</th>
                  <th class="text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="bereich in adminStore.bereiche"
                  :key="bereich.BereichID"
                  class="table-row"
                >
                  <td class="item-name">{{ bereich.Bezeichnung }}</td>
                  <td class="text-right">
                    <div class="action-buttons">
                      <button @click="editBereichModal(bereich)" class="action-btn edit">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button @click="deleteBereich(bereich.BereichID)" class="action-btn delete">
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

        <!-- Teams Tab -->
        <div v-if="activeTab === 'teams'" class="tab-content">
          <div class="section-header">
            <h3>Teams verwalten</h3>
            <button
              @click="openTeamModal"
              class="add-button"
              :disabled="adminStore.bereiche.length === 0"
            >
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
              Neues Team
            </button>
          </div>

          <div v-if="adminStore.bereiche.length === 0" class="alert alert-warning">
            <p>⚠️ Sie müssen zuerst Bereiche erstellen, bevor Sie Teams anlegen können.</p>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Bereich</th>
                  <th class="text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="team in adminStore.teams" :key="team.TeamID" class="table-row">
                  <td class="item-name">{{ team.Bezeichnung }}</td>
                  <td>
                    <span class="group-badge">{{ team.Bereich || 'Nicht zugeordnet' }}</span>
                  </td>
                  <td class="text-right">
                    <div class="action-buttons">
                      <button @click="editTeamModal(team)" class="action-btn edit">
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
                      <button @click="deleteTeam(team.TeamID)" class="action-btn delete">
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

        <!-- Funktionen Tab -->
        <div v-if="activeTab === 'funktionen'" class="tab-content">
          <div class="section-header">
            <h3>Funktionen verwalten</h3>
            <button
              @click="openFunktionModal"
              class="add-button"
              :disabled="adminStore.teams.length === 0"
            >
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
              Neue Funktion
            </button>
          </div>

          <div v-if="adminStore.teams.length === 0" class="alert alert-warning">
            <p>⚠️ Sie müssen zuerst Teams erstellen, bevor Sie Funktionen anlegen können.</p>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Funktion</th>
                  <th>Team</th>
                  <th class="text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="funktion in adminStore.funktionen"
                  :key="funktion.FunktionID"
                  class="table-row"
                >
                  <td class="item-name">{{ funktion.Bezeichnung }}</td>
                  <td>
                    <span class="group-badge">{{ funktion.Team || 'Nicht zugeordnet' }}</span>
                  </td>
                  <td class="text-right">
                    <div class="action-buttons">
                      <button @click="editFunktionModal(funktion)" class="action-btn edit">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        @click="deleteFunktion(funktion.FunktionID)"
                        class="action-btn delete"
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

    <!-- Modals -->
    <BaseModal
      :show="modalState.bereich"
      :title="isEditing.bereich ? 'Bereich bearbeiten' : 'Neuer Bereich'"
      @close="closeBereichModal"
      @submit="saveBereich"
    >
      <div class="form-group">
        <label for="bereich-name">Bereich:</label>
        <input
          id="bereich-name"
          v-model="formData.bereich.Bezeichnung"
          type="text"
          class="form-input"
          required
          placeholder="Bereich eingeben"
        />
      </div>
    </BaseModal>

    <BaseModal
      :show="modalState.team"
      :title="isEditing.team ? 'Team bearbeiten' : 'Neues Team'"
      @close="closeTeamModal"
      @submit="saveTeam"
    >
      <div class="form-group">
        <label for="team-name">Team:</label>
        <input
          id="team-name"
          v-model="formData.team.Bezeichnung"
          type="text"
          class="form-input"
          required
          placeholder="Team eingeben"
        />
      </div>
      <div class="form-group">
        <label for="team-bereich">Bereich:</label>
        <select id="team-bereich" v-model="formData.team.BereichID" class="form-input" required>
          <option value="">Bereich auswählen</option>
          <option
            v-for="bereich in adminStore.bereiche"
            :key="bereich.BereichID"
            :value="bereich.BereichID"
          >
            {{ bereich.Bezeichnung }}
          </option>
        </select>
      </div>
    </BaseModal>

    <BaseModal
      :show="modalState.funktion"
      :title="isEditing.funktion ? 'Funktion bearbeiten' : 'Neue Funktion'"
      @close="closeFunktionModal"
      @submit="saveFunktion"
    >
      <div class="form-group">
        <label for="funktion-name">Funktion:</label>
        <input
          id="funktion-name"
          v-model="formData.funktion.Bezeichnung"
          type="text"
          class="form-input"
          required
          placeholder="Funktion eingeben"
        />
      </div>
      <div class="form-group">
        <label for="funktion-team">Team:</label>
        <select id="funktion-team" v-model="formData.funktion.TeamID" class="form-input" required>
          <option value="">Team auswählen</option>
          <option v-for="team in adminStore.teams" :key="team.TeamID" :value="team.TeamID">
            {{ team.Bezeichnung }}
          </option>
        </select>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useAdminStore } from '@/stores/adminStore'

export default defineComponent({
  name: 'AdminMasterData',
  components: {
    BaseModal,
  },
  setup() {
    const activeTab = ref('bereiche')
    const adminStore = useAdminStore()

    // Initialize AdminStore data on component setup
    const initializeData = async () => {
      try {
        await adminStore.initializeAll()
      } catch (error) {
        console.error('Error initializing admin data:', error)
      }
    }

    // Modal state management - fix the ref in reactive issue
    const modalState = reactive({
      bereich: false,
      team: false,
      funktion: false,
    })

    const isEditing = reactive({
      bereich: false,
      team: false,
      funktion: false,
    })

    const formData = reactive({
      bereich: { Bezeichnung: '' },
      team: { Bezeichnung: '', BereichID: '' },
      funktion: { Bezeichnung: '', TeamID: '' },
    })

    // Bereich operations
    const openBereichModal = () => {
      isEditing.bereich = false
      formData.bereich = { Bezeichnung: '' }
      modalState.bereich = true
    }

    const editBereichModal = (bereich) => {
      isEditing.bereich = true
      formData.bereich = { Bezeichnung: bereich.Bezeichnung }
      formData.bereich._id = bereich.BereichID
      modalState.bereich = true
    }

    const closeBereichModal = () => {
      modalState.bereich = false
      isEditing.bereich = false
      formData.bereich = { Bezeichnung: '' }
    }

    const saveBereich = async () => {
      try {
        if (isEditing.bereich) {
          await adminStore.bereicheOps.update(formData.bereich._id, formData.bereich)
        } else {
          await adminStore.bereicheOps.create(formData.bereich)
        }
        closeBereichModal()
      } catch (error) {
        console.error('Fehler beim Speichern des Bereichs:', error)
      }
    }

    const deleteBereich = async (id) => {
      try {
        await adminStore.bereicheOps.remove(id)
      } catch (error) {
        console.error('Fehler beim Löschen des Bereichs:', error)
      }
    }

    // Team operations
    const openTeamModal = () => {
      isEditing.team = false
      formData.team = { Bezeichnung: '', BereichID: '' }
      modalState.team = true
    }

    const editTeamModal = (team) => {
      isEditing.team = true
      formData.team = { Bezeichnung: team.Bezeichnung, BereichID: team.BereichID }
      formData.team._id = team.TeamID
      modalState.team = true
    }

    const closeTeamModal = () => {
      modalState.team = false
      isEditing.team = false
      formData.team = { Bezeichnung: '', BereichID: '' }
    }

    const saveTeam = async () => {
      try {
        if (isEditing.team) {
          await adminStore.teamsOps.update(formData.team._id, formData.team)
        } else {
          await adminStore.teamsOps.create(formData.team)
        }
        closeTeamModal()
      } catch (error) {
        console.error('Fehler beim Speichern des Teams:', error)
      }
    }

    const deleteTeam = async (id) => {
      try {
        await adminStore.teamsOps.remove(id)
      } catch (error) {
        console.error('Fehler beim Löschen des Teams:', error)
      }
    }

    // Funktion operations
    const openFunktionModal = () => {
      isEditing.funktion = false
      formData.funktion = { Bezeichnung: '', TeamID: '' }
      modalState.funktion = true
    }

    const editFunktionModal = (funktion) => {
      isEditing.funktion = true
      formData.funktion = { Bezeichnung: funktion.Bezeichnung, TeamID: funktion.TeamID }
      formData.funktion._id = funktion.FunktionID
      modalState.funktion = true
    }

    const closeFunktionModal = () => {
      modalState.funktion = false
      isEditing.funktion = false
      formData.funktion = { Bezeichnung: '', TeamID: '' }
    }

    const saveFunktion = async () => {
      try {
        if (isEditing.funktion) {
          await adminStore.funktionenOps.update(formData.funktion._id, formData.funktion)
        } else {
          await adminStore.funktionenOps.create(formData.funktion)
        }
        closeFunktionModal()
      } catch (error) {
        console.error('Fehler beim Speichern der Funktion:', error)
      }
    }

    const deleteFunktion = async (id) => {
      try {
        await adminStore.funktionenOps.remove(id)
      } catch (error) {
        console.error('Fehler beim Löschen der Funktion:', error)
      }
    }

    onMounted(async () => {
      await initializeData()
    })

    return {
      activeTab,
      adminStore,
      modalState,
      isEditing,
      formData,

      // Bereich
      openBereichModal,
      editBereichModal,
      closeBereichModal,
      saveBereich,
      deleteBereich,

      // Team
      openTeamModal,
      editTeamModal,
      closeTeamModal,
      saveTeam,
      deleteTeam,

      // Funktion
      openFunktionModal,
      editFunktionModal,
      closeFunktionModal,
      saveFunktion,
      deleteFunktion,
    }
  },
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

.table-row:hover {
  background: var(--color-background-soft);
}

.data-table td {
  padding: 1rem;
  vertical-align: middle;
}

.item-name {
  font-weight: 500;
  color: var(--color-text);
}

.group-badge {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  background: var(--color-background-mute);
  color: var(--color-text);
}

.action-btn.edit:hover {
  background: var(--color-button);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.action-btn.delete:hover {
  background: rgb(239, 68, 68);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.alert-warning {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  color: var(--color-text);
}

.alert p {
  margin: 0;
}

.shadow-line {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
  margin: 2rem 0;
}

.text-right {
  text-align: right;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .data-table {
    font-size: 0.9rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }
}
</style>
