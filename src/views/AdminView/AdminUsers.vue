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
						class="search-input"
						placeholder="Benutzer durchsuchen (Name, E-Mail, Abteilung)..."
					/>
					<div class="search-icon">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
					</div>
				</div>
				
				<div class="filter-controls">
					<select v-model="selectedDepartment" class="filter-select">
						<option value="">Alle Abteilungen</option>
						<option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
					</select>
					
					<select v-model="selectedRole" class="filter-select">
						<option value="">Alle Rollen</option>
						<option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
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
				<table class="users-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>E-Mail</th>
							<th>Abteilung</th>
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
										{{ user.name.charAt(0).toUpperCase() }}
									</div>
									<div class="user-details">
										<div class="user-name">{{ user.name }}</div>
										<div class="user-id">ID: {{ user.id }}</div>
									</div>
								</div>
							</td>
							<td>{{ user.email }}</td>
							<td>{{ user.department }}</td>
							<td>
								<span class="role-badge">{{ user.role }}</span>
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
			<div v-if="showAddUserForm" class="modal-overlay" @click="closeModal">
				<div class="modal-content" @click.stop>
					<div class="modal-header">
						<h3>Neuen Benutzer hinzufügen</h3>
						<button @click="closeModal" class="close-btn">×</button>
					</div>
					<div class="modal-body">
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
								<label>Abteilung</label>
								<select v-model="newUser.department" required class="form-input">
									<option value="">Abteilung wählen</option>
									<option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
								</select>
							</div>
							<div class="form-group">
								<label>Rolle</label>
								<select v-model="newUser.role" required class="form-input">
									<option value="">Rolle wählen</option>
									<option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
								</select>
							</div>
							<div class="modal-actions">
								<button type="button" @click="closeModal" class="btn-secondary">Abbrechen</button>
								<button type="submit" class="btn-primary">Benutzer hinzufügen</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
		
	</div>
</div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import adminService from '@/services/adminService';

const emit = defineEmits(['go-back']);

const searchQuery = ref('');
const selectedDepartment = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');
const showAddUserForm = ref(false);

const users = ref([]);
const departments = ref(['IT', 'HR', 'Finanzen', 'Marketing', 'Vertrieb', 'Produktion']);
const roles = ref(['Admin', 'Manager', 'Mitarbeiter', 'Gast']);

const newUser = ref({
	name: '',
	email: '',
	department: '',
	role: ''
});

const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);

// Load user data from API
const loadUsers = async () => {
	loading.value = true;
	try {
		const params = {
			page: currentPage.value,
			per_page: 15
		};
		
		if (searchQuery.value) {
			params.search = searchQuery.value;
		}
		if (selectedDepartment.value) {
			params.department = selectedDepartment.value;
		}
		if (selectedRole.value) {
			params.role = selectedRole.value;
		}
		if (selectedStatus.value) {
			params.status = selectedStatus.value;
		}
		
		const response = await adminService.getUsers(params);
		
		if (response.data) {
			users.value = response.data;
			currentPage.value = response.current_page;
			totalPages.value = response.last_page;
		}
		
	} catch (error) {
		console.error('Fehler beim Laden der Benutzer:', error);
		// Fallback to mock data
		users.value = [
		{
			id: 1,
			name: 'Max Mustermann',
			email: 'max.mustermann@company.com',
			department: 'IT',
			role: 'admin',
			status: 'active',
			lastActivity: new Date('2024-01-15T10:30:00')
		},
		{
			id: 2,
			name: 'Anna Schmidt',
			email: 'anna.schmidt@company.com',
			department: 'HR',
			role: 'pm',
			status: 'active',
			lastActivity: new Date('2024-01-14T16:45:00')
		}];
	} finally {
		loading.value = false;
	}
};

const filteredUsers = computed(() => {
	let filtered = users.value;
	
	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase();
		filtered = filtered.filter(user => 
			user.name.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query) ||
			user.department.toLowerCase().includes(query)
		);
	}
	
	if (selectedDepartment.value) {
		filtered = filtered.filter(user => user.department === selectedDepartment.value);
	}
	
	if (selectedRole.value) {
		filtered = filtered.filter(user => user.role === selectedRole.value);
	}
	
	return filtered;
});

const onSearchInput = () => {
	// Debounce implementation could be added here
};

const getStatusText = (status) => {
	return status === 'active' ? 'Aktiv' : 'Inaktiv';
};

const formatDate = (date) => {
	return new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
};

const editUser = (user) => {
	console.log('Edit user:', user);
	// TODO: Implement edit functionality
};

const deleteUser = async (user) => {
	if (confirm(`Benutzer ${user.name} wirklich löschen?`)) {
		try {
			await adminService.deleteUser(user.id);
			await loadUsers(); // Reload the list
		} catch (error) {
			console.error('Fehler beim Löschen des Benutzers:', error);
			alert('Fehler beim Löschen des Benutzers');
		}
	}
};

const addUser = async () => {
	try {
		const userData = {
			name: newUser.value.name,
			email: newUser.value.email,
			department: newUser.value.department,
			role: newUser.value.role,
			status: 'active'
		};
		
		await adminService.createUser(userData);
		await loadUsers(); // Reload the list
		closeModal();
	} catch (error) {
		console.error('Fehler beim Erstellen des Benutzers:', error);
		alert('Fehler beim Erstellen des Benutzers');
	}
};

const closeModal = () => {
	showAddUserForm.value = false;
	newUser.value = {
		name: '',
		email: '',
		department: '',
		role: ''
	};
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
watch([selectedDepartment, selectedRole, selectedStatus], () => {
	currentPage.value = 1; // Reset to first page
	loadUsers();
});

onMounted(() => {
	loadUsers();
});
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

.users-table-container {
	overflow-x: auto;
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
}

.users-table {
	width: 100%;
	border-collapse: collapse;
}

.users-table th {
	background: var(--color-background-mute);
	color: var(--color-text);
	padding: 1rem;
	text-align: left;
	font-weight: 600;
	border-bottom: 1px solid var(--color-border);
}

.user-row {
	border-bottom: 1px solid var(--color-border);
	transition: background-color 0.2s ease;
}

.user-row:hover {
	background: var(--color-background-soft);
}

.users-table td {
	padding: 1rem;
	vertical-align: middle;
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

.status-badge {
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.8rem;
	font-weight: 500;
}

.status-badge.active {
	background: rgba(34, 197, 94, 0.1);
	color: rgb(34, 197, 94);
}

.status-badge.inactive {
	background: rgba(239, 68, 68, 0.1);
	color: rgb(239, 68, 68);
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

.action-btn.delete {
	background: rgba(239, 68, 68, 0.1) !important;
	color: rgb(239, 68, 68) !important;
}

.action-btn.delete:hover {
	background: rgb(239, 68, 68) !important;
	color: white !important;
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

.shadow-line {
	border: 0;
	height: 1px;
	background: linear-gradient(90deg, transparent, var(--color-border), transparent);
	margin: 2rem 0;
}

@media (max-width: 768px) {
	.users-table {
		font-size: 0.9rem;
	}
	
	.users-table th,
	.users-table td {
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