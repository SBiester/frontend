<template>
<div>
	<hr class="shadow-line" />
	<div class="ref">
		<h2>Benutzerverwaltung</h2>
		<p>Verwalte Mitarbeiter, weise Rollen zu und konfiguriere Berechtigungen</p>
		<hr class="shadow-line" />
		
		<div class="user-management">
			<!-- Search and Filters -->
			<div class="search-section">
				<div class="search-input-container">
					<input
						v-model="searchQuery"
						@input="onSearchInput"
						type="text"
						class="search-input large"
						placeholder="Benutzer durchsuchen (Name, E-Mail)..."
					/>
					<div class="search-icon">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
					</div>
				</div>
				
				<div class="filter-controls">
					<select v-model="selectedRole" class="filter-select">
						<option value="">Alle Rollen</option>
						<option v-for="role in roles" :key="role.RollenID" :value="role.RollenID">{{ role.Bezeichnung }}</option>
					</select>
					
					<select v-model="selectedStatus" class="filter-select">
						<option value="">Alle Status</option>
						<option value="active">Aktiv</option>
						<option value="inactive">Inaktiv</option>
					</select>
					
					<button @click="showAddUserForm = true" class="add-button">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Benutzer hinzufügen
					</button>
				</div>
			</div>

			<!-- Users Table -->
			<div class="users-table-container">
				<table class="data-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>E-Mail</th>
							<th>Bereich</th>
							<th>Team</th>
							<th>Rolle</th>
							<th>Status</th>
							<th>Letzte Aktivität</th>
							<th>Aktionen</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="user in filteredUsers" :key="user.id" class="user-row">
							<td>
								<div class="user-info">
									<div class="user-avatar">
										{{ user.name?.charAt(0)?.toUpperCase() || 'U' }}
									</div>
									<div class="user-details">
										<div class="user-name">{{ user.name || 'Unbekannt' }}</div>
									</div>
								</div>
							</td>
							<td>{{ user.email || '-' }}</td>
							<td>{{ user.bereich?.Bezeichnung || '-' }}</td>
							<td>{{ user.team?.Bezeichnung || '-' }}</td>
							<td>
								<span class="role-badge">{{ user.rolle?.Bezeichnung || user.role || '-' }}</span>
							</td>
							<td>
								<span :class="`status-badge ${user.status}`">{{ getStatusText(user.status) }}</span>
							</td>
							<td>{{ formatDate(user.lastActivity) }}</td>
							<td>
								<div class="action-buttons">
									<button @click="editUser(user)" class="action-btn edit">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
										</svg>
									</button>
									<button @click="deleteUser(user)" class="action-btn delete">
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

			<!-- Add User Modal -->
			<BaseModal
				:show="showAddUserForm"
				title="Neuen Benutzer hinzufügen"
				:show-actions="false"
				@close="closeModal"
			>
				<form @submit.prevent="addUser">
					<div class="form-group">
						<label>Name</label>
						<input v-model="newUser.name" type="text" required class="form-input">
					</div>
					<div class="form-group">
						<label>E-Mail</label>
						<input v-model="newUser.email" type="email" required class="form-input">
					</div>
					<div class="form-group">
						<label>Bereich</label>
						<select v-model="newUser.BereichID" class="form-input">
							<option value="">Bereich wählen</option>
							<option v-for="bereich in bereiche" :key="bereich.BereichID" :value="bereich.BereichID">{{ bereich.Bezeichnung }}</option>
						</select>
					</div>
					<div class="form-group">
						<label>Team</label>
						<select v-model="newUser.TeamID" class="form-input" :disabled="!newUser.BereichID">
							<option value="">Team wählen</option>
							<option v-for="team in teamsForNewUser" :key="team.TeamID" :value="team.TeamID">{{ team.Bezeichnung }}</option>
						</select>
					</div>
					<div class="form-group">
						<label>Rolle</label>
						<select v-model="newUser.RollenID" required class="form-input">
							<option value="">Rolle wählen</option>
							<option v-for="role in roles" :key="role.RollenID" :value="role.RollenID">{{ role.Bezeichnung }}</option>
						</select>
					</div>
					<div class="modal-actions">
						<button type="button" @click="closeModal" class="btn-secondary">Abbrechen</button>
						<button type="submit" class="btn-primary">Benutzer hinzufügen</button>
					</div>
				</form>
			</BaseModal>

			<!-- Edit User Modal -->
			<BaseModal
				:show="showEditUserForm"
				title="Benutzer bearbeiten"
				:show-actions="false"
				@close="closeModal"
			>
				<form @submit.prevent="updateUser">
					<div class="form-group">
						<label>Name</label>
						<input v-model="editingUser.name" type="text" required class="form-input">
					</div>
					<div class="form-group">
						<label>E-Mail</label>
						<input v-model="editingUser.email" type="email" required class="form-input">
					</div>
					<div class="form-group">
						<label>Bereich</label>
						<select v-model="editingUser.BereichID" class="form-input">
							<option value="">Bereich wählen</option>
							<option v-for="bereich in bereiche" :key="bereich.BereichID" :value="bereich.BereichID">{{ bereich.Bezeichnung }}</option>
						</select>
					</div>
					<div class="form-group">
						<label>Team</label>
						<select v-model="editingUser.TeamID" class="form-input" :disabled="!editingUser.BereichID">
							<option value="">Team wählen</option>
							<option v-for="team in teamsForBereich" :key="team.TeamID" :value="team.TeamID">
								{{ team.Bezeichnung }}
							</option>
						</select>
					</div>
					<div class="form-group">
						<label>Rolle</label>
						<select v-model="editingUser.RollenID" required class="form-input">
							<option value="">Rolle wählen</option>
							<option v-for="role in roles" :key="role.RollenID" :value="role.RollenID">{{ role.Bezeichnung }}</option>
						</select>
					</div>
					<div class="form-group">
						<label>Status</label>
						<select v-model="editingUser.status" required class="form-input">
							<option value="active">Aktiv</option>
							<option value="inactive">Inaktiv</option>
						</select>
					</div>
					<div class="modal-actions">
						<button type="button" @click="closeModal" class="btn-secondary">Abbrechen</button>
						<button type="submit" class="btn-primary">Benutzer aktualisieren</button>
					</div>
				</form>
			</BaseModal>
		</div>

	</div>
</div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import BaseModal from '@/components/BaseModal.vue'
import adminService from '@/services/adminService'

const emit = defineEmits(['go-back'])

const adminStore = useAdminStore()

const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showAddUserForm = ref(false)
const showEditUserForm = ref(false)

const roles = ref([])

const newUser = ref({
	name: '',
	email: '',
	BereichID: null,
	TeamID: null,
	RollenID: null
})

const editingUser = ref({
	id: null,
	name: '',
	email: '',
	BereichID: null,
	TeamID: null,
	RollenID: null,
	status: ''
})

const bereiche = ref([])
const teams = ref([])
const teamsForBereich = ref([])
const teamsForNewUser = ref([])

const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

// Load Bereiche and Teams
const loadBereiche = async () => {
	try {
		const response = await adminStore.bereicheOps.load()
		bereiche.value = response || []
	} catch (error) {
		console.error('Fehler beim Laden der Bereiche:', error)
	}
}

const loadTeams = async () => {
	try {
		const response = await adminStore.teamsOps.load()
		teams.value = response || []
	} catch (error) {
		console.error('Fehler beim Laden der Teams:', error)
	}
}

const loadRoles = async () => {
	try {
		const response = await adminService.getRollen()
		roles.value = response || []
	} catch (error) {
		console.error('Fehler beim Laden der Rollen:', error)
		// Fallback auf Standard-Rollen
		roles.value = [
			{ RollenID: 1, Bezeichnung: 'admin' },
			{ RollenID: 2, Bezeichnung: 'pm' },
			{ RollenID: 3, Bezeichnung: 'fach' },
			{ RollenID: 4, Bezeichnung: 'user' }
		]
	}
}

const loadTeamsByBereich = async (bereichId) => {
	console.log('=== DEBUG: loadTeamsByBereich called ===');
	console.log('BereichId:', bereichId, 'Type:', typeof bereichId);

	if (!bereichId) {
		console.log('No bereichId, clearing teams');
		teamsForBereich.value = []
		return
	}
	try {
		console.log('Calling API for teams in bereich:', bereichId);
		const response = await adminService.getTeamsByBereich(bereichId)
		console.log('Teams API response:', response);
		teamsForBereich.value = response || []
		console.log('teamsForBereich set to:', teamsForBereich.value);
		return teamsForBereich.value
	} catch (error) {
		console.error('Fehler beim Laden der Teams für Bereich:', error)
		teamsForBereich.value = []
		return []
	}
}

// Watch for bereich changes in editing user
watch(() => editingUser.value.BereichID, async (newBereichId) => {
	editingUser.value.TeamID = null // Reset team selection
	await loadTeamsByBereich(newBereichId)
})

// Watch for bereich changes in new user
watch(() => newUser.value.BereichID, async (newBereichId) => {
	newUser.value.TeamID = null // Reset team selection
	if (!newBereichId) {
		teamsForNewUser.value = []
		return
	}
	try {
		const response = await adminService.getTeamsByBereich(newBereichId)
		teamsForNewUser.value = response || []
	} catch (error) {
		console.error('Fehler beim Laden der Teams für neuen Benutzer:', error)
		teamsForNewUser.value = []
	}
})

// Load user data via AdminStore
const loadUsers = async () => {
	loading.value = true
	try {
		const params = {
			page: currentPage.value,
			per_page: 15
		}

		if (searchQuery.value) {
			params.search = searchQuery.value
		}
		if (selectedRole.value) {
			params.role = selectedRole.value
		}
		if (selectedStatus.value) {
			params.status = selectedStatus.value
		}

		const response = await adminStore.usersOps.load(params)

		if (response.current_page) {
			currentPage.value = response.current_page
		}
		if (response.last_page) {
			totalPages.value = response.last_page
		}

	} catch (error) {
		console.error('Fehler beim Laden der Benutzer:', error)
	} finally {
		loading.value = false
	}
}

const filteredUsers = computed(() => {
	let filtered = adminStore.users

	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase()
		filtered = filtered.filter(user =>
			user.name.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query)
		)
	}


	if (selectedRole.value) {
		filtered = filtered.filter(user => user.RollenID === selectedRole.value)
	}

	if (selectedStatus.value) {
		filtered = filtered.filter(user => user.status === selectedStatus.value)
	}

	return filtered
})

const onSearchInput = () => {
	// Debounce implementation could be added here
};

const getStatusText = (status) => {
	if (!status) return 'Unbekannt';
	return status === 'active' ? 'Aktiv' : 'Inaktiv';
};

const formatDate = (date) => {
	if (!date) return '-';
	try {
		const dateObj = new Date(date);
		if (isNaN(dateObj.getTime())) return '-';
		return new Intl.DateTimeFormat('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(dateObj);
	} catch (error) {
		return '-';
	}
};

const editUser = async (user) => {
	console.log('=== DEBUG: editUser called ===');
	console.log('User data:', user);
	console.log('User BereichID:', user.BereichID, 'Type:', typeof user.BereichID);
	console.log('User TeamID:', user.TeamID, 'Type:', typeof user.TeamID);

	editingUser.value = {
		id: user.id,
		name: user.name,
		email: user.email,
		BereichID: user.BereichID,
		TeamID: null, // Reset temporarily
		RollenID: user.RollenID,
		status: user.status
	};

	console.log('editingUser after set (TeamID reset):', editingUser.value);

	// Load teams for the selected bereich first
	if (user.BereichID) {
		console.log('Loading teams for BereichID:', user.BereichID);
		await loadTeamsByBereich(user.BereichID);

		// Now set the TeamID after teams are loaded
		console.log('Setting TeamID after teams loaded:', user.TeamID);
		editingUser.value.TeamID = user.TeamID;
		console.log('editingUser.TeamID set to:', editingUser.value.TeamID);
		console.log('Available teams:', teamsForBereich.value);
	} else {
		console.log('No BereichID, clearing teams');
		teamsForBereich.value = [];
	}

	showEditUserForm.value = true;
};

const updateUser = async () => {
	try {
		const userData = {
			name: editingUser.value.name,
			email: editingUser.value.email,
			BereichID: editingUser.value.BereichID,
			TeamID: editingUser.value.TeamID,
			RollenID: editingUser.value.RollenID,
			status: editingUser.value.status
		};

		await adminStore.usersOps.update(editingUser.value.id, userData);
		closeModal();
		await loadUsers(); // Reload users to show updated data
	} catch (error) {
		console.error('Fehler beim Aktualisieren des Benutzers:', error);
		alert('Fehler beim Aktualisieren des Benutzers');
	}
};

const deleteUser = async (user) => {
	if (confirm(`Benutzer ${user.name} wirklich löschen?`)) {
		try {
			await adminStore.usersOps.remove(user.id)
		} catch (error) {
			console.error('Fehler beim Löschen des Benutzers:', error)
			alert('Fehler beim Löschen des Benutzers')
		}
	}
}

const addUser = async () => {
	try {
		const userData = {
			name: newUser.value.name,
			email: newUser.value.email,
			BereichID: newUser.value.BereichID,
			TeamID: newUser.value.TeamID,
			RollenID: newUser.value.RollenID,
			status: 'active'
		}

		await adminStore.usersOps.create(userData)
		closeModal()
	} catch (error) {
		console.error('Fehler beim Erstellen des Benutzers:', error)
		alert('Fehler beim Erstellen des Benutzers')
	}
}

const closeModal = () => {
	showAddUserForm.value = false;
	showEditUserForm.value = false;
	newUser.value = {
		name: '',
		email: '',
		BereichID: null,
		TeamID: null,
		RollenID: null
	};
	editingUser.value = {
		id: null,
		name: '',
		email: '',
		BereichID: null,
		TeamID: null,
		RollenID: null,
		status: ''
	};
	teamsForBereich.value = [];
	teamsForNewUser.value = [];
};

// Watch for filter changes - debounce search only
let searchTimeout;
watch(searchQuery, () => {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		currentPage.value = 1;
		loadUsers();
	}, 300);
});

// Watch for filter changes - immediate for dropdowns
watch([selectedRole, selectedStatus], () => {
	currentPage.value = 1; // Reset to first page
	loadUsers();
});

onMounted(async () => {
	await Promise.all([
		adminStore.usersOps.load(),
		loadBereiche(),
		loadTeams(),
		loadRoles()
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

/* User-specific table customizations */
.user-row {
	border-bottom: 1px solid var(--color-border);
	transition: background-color 0.2s ease;
}

.user-row:hover {
	background: var(--color-background-soft);
}

.user-info {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.user-avatar {
	width: 2.5rem;
	height: 2.5rem;
	background: var(--color-button);
	color: var(--color-text);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	font-size: 1rem;
}

.user-name {
	font-weight: 500;
	color: var(--color-text);
}

.user-id {
	font-size: 0.8rem;
	color: var(--color-text-muted);
}

.role-badge {
	background: var(--color-background-soft);
	color: var(--color-text);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.8rem;
	font-weight: 500;
}

/* Status badge styling moved to main.css */

/* Action button styling moved to main.css */

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



.arrow-left {
	font-size: 1rem;
	transition: transform 0.2s ease;
}

.back-button:hover .arrow-left {
	transform: translateX(-2px);
}
</style>