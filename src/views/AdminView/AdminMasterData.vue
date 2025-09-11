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
					:class="{ 'active': activeTab === 'bereiche' }"
					class="tab-button"
				>
					Bereiche
				</button>
				<button 
					@click="activeTab = 'teams'" 
					:class="{ 'active': activeTab === 'teams' }"
					class="tab-button"
				>
					Teams
				</button>
				<button 
					@click="activeTab = 'funktionen'" 
					:class="{ 'active': activeTab === 'funktionen' }"
					class="tab-button"
				>
					Funktionen
				</button>
			</div>


			<!-- Bereiche Tab -->
			<div v-if="activeTab === 'bereiche'" class="tab-content">
				<div class="section-header">
					<h3>Bereiche verwalten</h3>
					<button @click="openCreateBereichModal" class="add-button">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Neuer Bereich
					</button>
				</div>


				<div class="table-container">
					<table v-if="bereiche.length > 0" class="data-table">
						<thead>
							<tr>
								<th>Bereich</th>
								<th class="text-right">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="bereich in bereiche" :key="bereich.BereichID" class="table-row">
								<td class="item-name">{{ bereich.Bereich }}</td>
								<td class="text-right">
									<div class="action-buttons">
										<button @click="editBereich(bereich)" class="action-btn edit">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
												<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
											</svg>
										</button>
										<button @click="deleteBereich(bereich.BereichID)" class="action-btn delete">
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
					<div v-else class="empty-state">
						<p>Keine Bereiche vorhanden</p>
					</div>
				</div>
			</div>



			<!-- Teams Tab -->
			<div v-if="activeTab === 'teams'" class="tab-content">
				<div class="section-header">
					<h3>Teams verwalten</h3>
					<button @click="openCreateTeamModal" class="add-button" :disabled="bereiche.length === 0">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Neues Team
					</button>
				</div>

				<div v-if="bereiche.length === 0" class="alert alert-warning">
					<p>⚠️ Sie müssen zuerst Bereiche erstellen, bevor Sie Teams anlegen können.</p>
				</div>


				<div class="table-container">
					<table v-if="teams.length > 0" class="data-table">
						<thead>
							<tr>
								<th>Team</th>
								<th>Bereich</th>
								<th class="text-right">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="team in teams" :key="team.TeamID" class="table-row">
								<td class="item-name">{{ team.Team }}</td>
								<td>
									<span class="group-badge">{{ team.Bereich || 'Nicht zugeordnet' }}</span>
								</td>
								<td class="text-right">
									<div class="action-buttons">
										<button @click="editTeam(team)" class="action-btn edit">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
												<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
											</svg>
										</button>
										<button @click="deleteTeam(team.TeamID)" class="action-btn delete">
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
					<div v-else class="empty-state">
						<p>Keine Teams vorhanden</p>
					</div>
				</div>
			</div>


			<!-- Funktionen Tab -->
			<div v-if="activeTab === 'funktionen'" class="tab-content">
				<div class="section-header">
					<h3>Funktionen verwalten</h3>
					<button @click="openCreateFunktionModal" class="add-button" :disabled="teams.length === 0">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Neue Funktion
					</button>
				</div>

				<div v-if="teams.length === 0" class="alert alert-warning">
					<p>⚠️ Sie müssen zuerst Teams erstellen, bevor Sie Funktionen anlegen können.</p>
				</div>


				<div class="table-container">
					<table v-if="funktionen.length > 0" class="data-table">
						<thead>
							<tr>
								<th>Funktion</th>
								<th>Team</th>
								<th class="text-right">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="funktion in funktionen" :key="funktion.FunktionID" class="table-row">
								<td class="item-name">{{ funktion.Funktion }}</td>
								<td>
									<span class="group-badge">{{ funktion.Team || 'Nicht zugeordnet' }}</span>
								</td>
								<td class="text-right">
									<div class="action-buttons">
										<button @click="editFunktion(funktion)" class="action-btn edit">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
												<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
											</svg>
										</button>
										<button @click="deleteFunktion(funktion.FunktionID)" class="action-btn delete">
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
					<div v-else class="empty-state">
						<p>Keine Funktionen vorhanden</p>
					</div>
				</div>
			</div>
		</div>


		<!-- Bereich Modal -->
		<div v-if="showBereichModal" class="modal-overlay" @click="closeBereichModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingBereich ? 'Bereich bearbeiten' : 'Neuer Bereich' }}</h3>
					<button @click="closeBereichModal" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="saveBereich">
						<div class="form-group">
							<label for="bereich-name">Bereich:</label>
							<input 
								id="bereich-name"
								v-model="bereichForm.Bereich" 
								type="text" 
								class="form-input" 
								required 
								placeholder="Bereich eingeben"
							>
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeBereichModal" class="btn-secondary">
								Abbrechen
							</button>
							<button type="submit" class="btn-primary">
								{{ editingBereich ? 'Aktualisieren' : 'Bereich hinzufügen' }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>



		<!-- Team Modal -->
		<div v-if="showTeamModal" class="modal-overlay" @click="closeTeamModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingTeam ? 'Team bearbeiten' : 'Neues Team' }}</h3>
					<button @click="closeTeamModal" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="saveTeam">
						<div class="form-group">
							<label for="team-name">Team:</label>
							<input 
								id="team-name"
								v-model="teamForm.Team" 
								type="text" 
								class="form-input" 
								required 
								placeholder="Team eingeben"
							>
						</div>
						<div class="form-group">
							<label for="team-bereich">Bereich:</label>
							<select 
								id="team-bereich"
								v-model="teamForm.BereichID" 
								class="form-input" 
								required
							>
								<option value="">Bereich auswählen...</option>
								<option v-for="bereich in bereiche" :key="bereich.BereichID" :value="bereich.BereichID">
									{{ bereich.Bereich }}
								</option>
							</select>
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeTeamModal" class="btn-secondary">
								Abbrechen
							</button>
							<button type="submit" class="btn-primary">
								{{ editingTeam ? 'Aktualisieren' : 'Team hinzufügen' }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>


		<!-- Funktion Modal -->
		<div v-if="showFunktionModal" class="modal-overlay" @click="closeFunktionModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingFunktion ? 'Funktion bearbeiten' : 'Neue Funktion' }}</h3>
					<button @click="closeFunktionModal" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="saveFunktion">
						<div class="form-group">
							<label for="funktion-name">Funktion:</label>
							<input 
								id="funktion-name"
								v-model="funktionForm.Funktion" 
								type="text" 
								class="form-input" 
								required 
								placeholder="Funktion eingeben"
							>
						</div>
						<div class="form-group">
							<label for="funktion-team">Team:</label>
							<select 
								id="funktion-team"
								v-model="funktionForm.TeamID" 
								class="form-input" 
								required
							>
								<option value="">Team auswählen...</option>
								<option v-for="team in teams" :key="team.TeamID" :value="team.TeamID">
									{{ team.Team }}
								</option>
							</select>
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeFunktionModal" class="btn-secondary">
								Abbrechen
							</button>
							<button type="submit" class="btn-primary">
								{{ editingFunktion ? 'Aktualisieren' : 'Funktion hinzufügen' }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		
	</div>
</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import adminService from '@/services/adminService'

export default {
  name: 'AdminMasterData',
  setup() {
    const activeTab = ref('bereiche')
    
    // Data
    const bereiche = ref([])
    const teams = ref([])
    const funktionen = ref([])
    
    // Modals
    const showBereichModal = ref(false)
    const showTeamModal = ref(false)
    const showFunktionModal = ref(false)
    
    // Editing states
    const editingBereich = ref(null)
    const editingTeam = ref(null)
    const editingFunktion = ref(null)
    
    // Forms
    const bereichForm = ref({ Bereich: '' })
    const teamForm = ref({ Team: '', BereichID: '' })
    const funktionForm = ref({ Funktion: '', TeamID: '' })

    // Load data functions
    const loadBereiche = async () => {
      try {
        const response = await adminService.getBereiche()
        bereiche.value = response
      } catch (error) {
        console.error('Fehler beim Laden der Bereiche:', error)
      }
    }


    const loadTeams = async () => {
      try {
        const response = await adminService.getTeams()
        teams.value = response
      } catch (error) {
        console.error('Fehler beim Laden der Teams:', error)
      }
    }

    const loadFunktionen = async () => {
      try {
        const response = await adminService.getFunktionen()
        funktionen.value = response
      } catch (error) {
        console.error('Fehler beim Laden der Funktionen:', error)
      }
    }

    // Bereich functions
    const openCreateBereichModal = () => {
      editingBereich.value = null
      bereichForm.value = { Bereich: '' }
      showBereichModal.value = true
    }

    const editBereich = (bereich) => {
      editingBereich.value = bereich
      bereichForm.value = { 
        Bereich: bereich.Bereich
      }
      showBereichModal.value = true
    }

    const closeBereichModal = () => {
      showBereichModal.value = false
      editingBereich.value = null
      bereichForm.value = { Bereich: '' }
    }

    const saveBereich = async () => {
      try {
        if (editingBereich.value) {
          await adminService.updateBereich(editingBereich.value.BereichID, bereichForm.value)
        } else {
          await adminService.createBereich(bereichForm.value)
        }
        await loadBereiche()
        closeBereichModal()
      } catch (error) {
        console.error('Fehler beim Speichern des Bereichs:', error)
      }
    }

    const deleteBereich = async (id) => {
      if (confirm('Sind Sie sicher, dass Sie diesen Bereich löschen möchten?')) {
        try {
          await adminService.deleteBereich(id)
          await loadBereiche()
        } catch (error) {
          console.error('Fehler beim Löschen des Bereichs:', error)
        }
      }
    }


    // Team functions
    const openCreateTeamModal = () => {
      editingTeam.value = null
      teamForm.value = { Team: '', BereichID: '' }
      showTeamModal.value = true
    }

    const editTeam = (team) => {
      editingTeam.value = team
      teamForm.value = { 
        Team: team.Team,
        BereichID: team.BereichID
      }
      showTeamModal.value = true
    }

    const closeTeamModal = () => {
      showTeamModal.value = false
      editingTeam.value = null
      teamForm.value = { Team: '', BereichID: '' }
    }

    const saveTeam = async () => {
      try {
        if (editingTeam.value) {
          await adminService.updateTeam(editingTeam.value.TeamID, teamForm.value)
        } else {
          await adminService.createTeam(teamForm.value)
        }
        await loadTeams()
        closeTeamModal()
      } catch (error) {
        console.error('Fehler beim Speichern des Teams:', error)
      }
    }

    const deleteTeam = async (id) => {
      if (confirm('Sind Sie sicher, dass Sie dieses Team löschen möchten?')) {
        try {
          await adminService.deleteTeam(id)
          await loadTeams()
        } catch (error) {
          console.error('Fehler beim Löschen des Teams:', error)
        }
      }
    }

    // Funktion functions
    const openCreateFunktionModal = () => {
      editingFunktion.value = null
      funktionForm.value = { Funktion: '', TeamID: '' }
      showFunktionModal.value = true
    }

    const editFunktion = (funktion) => {
      editingFunktion.value = funktion
      funktionForm.value = { 
        Funktion: funktion.Funktion,
        TeamID: funktion.TeamID
      }
      showFunktionModal.value = true
    }

    const closeFunktionModal = () => {
      showFunktionModal.value = false
      editingFunktion.value = null
      funktionForm.value = { Funktion: '', TeamID: '' }
    }

    const saveFunktion = async () => {
      try {
        if (editingFunktion.value) {
          await adminService.updateFunktion(editingFunktion.value.FunktionID, funktionForm.value)
        } else {
          await adminService.createFunktion(funktionForm.value)
        }
        await loadFunktionen()
        closeFunktionModal()
      } catch (error) {
        console.error('Fehler beim Speichern der Funktion:', error)
      }
    }

    const deleteFunktion = async (id) => {
      if (confirm('Sind Sie sicher, dass Sie diese Funktion löschen möchten?')) {
        try {
          await adminService.deleteFunktion(id)
          await loadFunktionen()
        } catch (error) {
          console.error('Fehler beim Löschen der Funktion:', error)
        }
      }
    }

    onMounted(async () => {
      await Promise.all([
        loadBereiche(),
        loadTeams(),
        loadFunktionen()
      ])
    })

    return {
      activeTab,
      bereiche,
      teams,
      funktionen,
      showBereichModal,
      showTeamModal,
      showFunktionModal,
      editingBereich,
      editingTeam,
      editingFunktion,
      bereichForm,
      teamForm,
      funktionForm,
      openCreateBereichModal,
      editBereich,
      closeBereichModal,
      saveBereich,
      deleteBereich,
      openCreateTeamModal,
      editTeam,
      closeTeamModal,
      saveTeam,
      deleteTeam,
      openCreateFunktionModal,
      editFunktion,
      closeFunktionModal,
      saveFunktion,
      deleteFunktion
    }
  }
}
</script>

<style scoped>
.ref {
	max-width: 1400px;
	margin: 0 auto;
}

.tab-navigation {
	display: flex;
	gap: 1rem;
	margin-bottom: 2rem;
	border-bottom: 1px solid var(--color-border);
}

.tab-button {
	padding: 0.75rem 1.5rem !important;
	background: none !important;
	border: none !important;
	color: var(--color-text-muted) !important;
	cursor: pointer;
	transition: all 0.2s ease;
	border-bottom: 2px solid transparent !important;
}

.tab-button:hover {
	color: var(--color-text) !important;
}

.tab-button.active {
	color: var(--color-button) !important;
	border-bottom-color: var(--color-button) !important;
}

.tab-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.tab-content {
	margin-top: 1rem;
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

.add-button:hover:not(:disabled) {
	background: var(--color-button-hover) !important;
}

.add-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.table-container {
	overflow-x: auto;
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
}

.data-table {
	width: 100%;
	border-collapse: collapse;
}

.data-table th {
	background: var(--color-background-mute);
	color: var(--color-text);
	padding: 1rem;
	text-align: left;
	font-weight: 600;
	border-bottom: 1px solid var(--color-border);
}

.table-row {
	border-bottom: 1px solid var(--color-border);
	transition: background-color 0.2s ease;
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
}

.action-btn.delete {
	background: rgba(239, 68, 68, 0.1) !important;
	color: rgb(239, 68, 68) !important;
}

.action-btn.delete:hover {
	background: rgb(239, 68, 68) !important;
	color: white !important;
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
	z-index: 1001;
}

.modal-content {
	background: var(--color-background);
	border-radius: 0.5rem;
	width: 90%;
	max-width: 500px;
	max-height: 90vh;
	overflow-y: auto;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem;
	border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
	margin: 0;
	color: var(--color-text);
}

.close-btn {
	background: none !important;
	border: none !important;
	font-size: 1.5rem;
	cursor: pointer;
	color: var(--color-text-muted) !important;
}

.modal-body {
	padding: 1.5rem;
}

.form-group {
	margin-bottom: 1rem;
}

.form-group label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: 500;
	color: var(--color-text);
}

.form-input {
	width: 100%;
	padding: 0.75rem;
	border: 1px solid var(--color-border);
	border-radius: 0.25rem;
	background: var(--color-background);
	color: var(--color-text);
}

.form-input:focus {
	outline: none;
	border-color: var(--color-button);
}

.modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
	margin-top: 2rem;
}

.btn-secondary {
	padding: 0.5rem 1rem !important;
	background: var(--color-background-mute) !important;
	color: var(--color-text) !important;
	border: 1px solid var(--color-border) !important;
	border-radius: 0.25rem;
	cursor: pointer;
}

.btn-primary {
	padding: 0.5rem 1rem !important;
	background: var(--color-button) !important;
	color: var(--color-text) !important;
	border: none !important;
	border-radius: 0.25rem;
	cursor: pointer;
}

.shadow-line {
	border: 0;
	height: 1px;
	background: linear-gradient(90deg, transparent, var(--color-border), transparent);
	margin: 2rem 0;
}

.text-right {
	text-align: right !important;
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