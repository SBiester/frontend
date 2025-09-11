<template>
<div>
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
					:class="{ 'active': activeTab === 'profiles' }"
					class="tab-button"
				>
					SAP Profile
				</button>
				<button 
					@click="activeTab = 'groups'" 
					:class="{ 'active': activeTab === 'groups' }"
					class="tab-button"
				>
					Rollengruppen
				</button>
			</div>

			<!-- Rollengruppen Tab -->
			<div v-if="activeTab === 'groups'" class="tab-content">
				<div class="section-header">
					<h3>Rollengruppen</h3>
					<button @click="showAddGroupForm = true" class="add-button">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Neue Rollengruppe
					</button>
				</div>
				
				<div class="groups-grid">
					<div v-for="group in rollengruppen" :key="group.RollengruppeID" class="group-card">
						<div class="group-header">
							<h4>{{ group.Bezeichnung }}</h4>
							<div class="group-actions">
								<button @click="editGroup(group)" class="action-btn edit">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
									</svg>
								</button>
								<button @click="deleteGroup(group)" class="action-btn delete">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="3,6 5,6 21,6"></polyline>
										<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
									</svg>
								</button>
							</div>
						</div>
						<div class="group-stats">
							<span class="stat-badge">ID: {{ group.RollengruppeID }}</span>
							<span class="stat-badge">{{ getProfileCount(group.RollengruppeID) }} Profile</span>
						</div>
						<div v-if="group.sammelrollen && group.sammelrollen.length > 0" class="group-profiles">
							<h5>Zugehörige Profile:</h5>
							<div class="profile-list">
								<span 
									v-for="profil in group.sammelrollen.slice(0, 3)" 
									:key="profil.SammelrollenID"
									class="profile-tag"
								>
									{{ profil.Bezeichnung }}
								</span>
								<span v-if="group.sammelrollen.length > 3" class="more-profiles">
									+ {{ group.sammelrollen.length - 3 }} weitere
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- SAP Profile Tab -->
			<div v-if="activeTab === 'profiles'" class="tab-content">
				<div class="section-header">
					<h3>SAP Profile (Sammelrollen)</h3>
					<div class="profile-controls">
						<div class="search-input-container">
							<input 
								v-model="profileSearchQuery"
								type="text" 
								class="search-input"
								placeholder="Profile durchsuchen..."
							/>
							<!-- <div class="search-icon">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.35-4.35"></path>
								</svg>
							</div> -->
							<div class="search-icon">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="11" cy="11" r="7"></circle>
									<line x1="16.65" y1="16.65" x2="21" y2="21"></line>
								</svg>
							</div>
						</div>
						<select v-model="selectedGroupFilter" class="filter-select">
							<option value="">Alle Rollengruppen</option>
							<option v-for="group in rollengruppen" :key="group.RollengruppeID" :value="group.RollengruppeID">
								{{ group.Bezeichnung }}
							</option>
						</select>
						<button @click="showAddProfileForm = true" class="add-button">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 5v14m7-7H5"></path>
							</svg>
							Neues Profil
						</button>
					</div>
				</div>

				<div class="profiles-table-container">
					<table class="profiles-table">
						<thead>
							<tr>
								<th>Bezeichnung</th>
								<th>Schlüssel</th>
								<th>Rollengruppe</th>
								<th class="text-right">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="profile in sammelrollen" :key="profile.SammelrollenID" class="profile-row">
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
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
												<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
											</svg>
										</button>
										<button @click="deleteProfile(profile)" class="action-btn delete">
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

				<!-- Pagination Controls -->
				<div v-if="paginationData.last_page > 1" class="pagination-container">
					<div class="pagination-info">
						Zeige {{ ((paginationData.current_page - 1) * paginationData.per_page) + 1 }} - 
						{{ Math.min(paginationData.current_page * paginationData.per_page, paginationData.total) }} von 
						{{ paginationData.total }} Profilen
					</div>
					<div class="pagination-controls">
						<button 
							@click="prevPage" 
							:disabled="paginationData.current_page <= 1"
							class="pagination-btn"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="15,18 9,12 15,6"></polyline>
							</svg>
							Zurück
						</button>
						
						<div class="page-numbers">
							<template v-for="page in getVisiblePages()" :key="page">
								<button 
									v-if="page !== '...'"
									@click="goToPage(page)"
									:class="{ 'active': page === paginationData.current_page }"
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
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="9,18 15,12 9,6"></polyline>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Add Group Modal -->
		<div v-if="showAddGroupForm" class="modal-overlay" @click="closeModals">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingGroup ? 'Rollengruppe bearbeiten' : 'Neue Rollengruppe hinzufügen' }}</h3>
					<button @click="closeModals" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="addGroup">
						<div class="form-group">
							<label>Bezeichnung</label>
							<input v-model="newGroup.Bezeichnung" type="text" required class="form-input">
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeModals" class="btn-secondary">Abbrechen</button>
							<button type="submit" class="btn-primary">{{ editingGroup ? 'Aktualisieren' : 'Rollengruppe hinzufügen' }}</button>
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Add Profile Modal -->
		<div v-if="showAddProfileForm" class="modal-overlay" @click="closeModals">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingProfile ? 'SAP Profil bearbeiten' : 'Neues SAP Profil hinzufügen' }}</h3>
					<button @click="closeModals" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="addProfile">
						<div class="form-group">
							<label>Bezeichnung</label>
							<input v-model="newProfile.Bezeichnung" type="text" required class="form-input">
						</div>
						<div class="form-group">
							<label>Schlüssel</label>
							<input v-model="newProfile.Schluessel" type="text" required class="form-input">
						</div>
						<div class="form-group">
							<label>Rollengruppe</label>
							<select v-model="newProfile.RollengruppeID" required class="form-input">
								<option value="">Rollengruppe wählen</option>
								<option v-for="group in rollengruppen" :key="group.RollengruppeID" :value="group.RollengruppeID">
									{{ group.Bezeichnung }}
								</option>
							</select>
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeModals" class="btn-secondary">Abbrechen</button>
							<button type="submit" class="btn-primary">{{ editingProfile ? 'Aktualisieren' : 'Profil hinzufügen' }}</button>
						</div>
					</form>
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

const activeTab = ref('profiles');
const profileSearchQuery = ref('');
const selectedGroupFilter = ref('');

const rollengruppen = ref([]);
const sammelrollen = ref([]);
const paginationData = ref({
	current_page: 1,
	last_page: 1,
	per_page: 20,
	total: 0
});
const isLoadingProfiles = ref(false);

const showAddGroupForm = ref(false);
const showAddProfileForm = ref(false);

const editingGroup = ref(null);
const editingProfile = ref(null);

const newGroup = ref({ Bezeichnung: '' });
const newProfile = ref({ Bezeichnung: '', Schluessel: '', RollengruppeID: '' });

const loadRollengruppen = async () => {
	try {
		const data = await adminService.getSapRoleGroups();
		// The API already returns groups with sammelrollen included
		rollengruppen.value = data || [];
	} catch (error) {
		console.error('Fehler beim Laden der Rollengruppen:', error);
		// Fallback data if API fails
		rollengruppen.value = [
			{ 
				RollengruppeID: 1, 
				Bezeichnung: 'Standard Berechtigungen',
				sammelrollen: [
					{ SammelrollenID: 1, Bezeichnung: 'SO-Berechtigung (Basis)', Schluessel: 'AP303_BC_XXBCXX:GLOBAL-ALL-USR' }
				]
			},
			{ 
				RollengruppeID: 2, 
				Bezeichnung: 'Erweiterte Berechtigungen',
				sammelrollen: [
					{ SammelrollenID: 2, Bezeichnung: 'Entwickler Zugang', Schluessel: 'DEV_ACCESS_FULL' }
				]
			}
		];
	}
};

const loadSammelrollen = async (page = 1) => {
	try {
		isLoadingProfiles.value = true;
		const params = { 
			page: page, 
			per_page: paginationData.value.per_page 
		};
		
		// Add search if active
		if (profileSearchQuery.value) {
			params.search = profileSearchQuery.value;
		}
		
		// Add group filter if active
		if (selectedGroupFilter.value) {
			params.group = selectedGroupFilter.value;
		}
		
		const data = await adminService.getSapRoles(params);
		
		if (data && data.data) {
			sammelrollen.value = data.data;
			paginationData.value = {
				current_page: data.current_page,
				last_page: data.last_page,
				per_page: data.per_page,
				total: data.total
			};
		} else {
			sammelrollen.value = data || [];
		}
	} catch (error) {
		console.error('Fehler beim Laden der Sammelrollen:', error);
		// Fallback data if API fails
		sammelrollen.value = [
			{ 
				SammelrollenID: 1, 
				Bezeichnung: 'SO-Berechtigung (Basis)', 
				Schluessel: 'AP303_BC_XXBCXX:GLOBAL-ALL-USR',
				RollengruppeID: 1,
				rollengruppe: { Bezeichnung: 'Standard Berechtigungen' }
			},
			{ 
				SammelrollenID: 2, 
				Bezeichnung: 'Entwickler Zugang', 
				Schluessel: 'DEV_ACCESS_FULL',
				RollengruppeID: 2,
				rollengruppe: { Bezeichnung: 'Erweiterte Berechtigungen' }
			}
		];
	} finally {
		isLoadingProfiles.value = false;
	}
};

// Pagination functions
const goToPage = (page) => {
	if (page >= 1 && page <= paginationData.value.last_page) {
		loadSammelrollen(page);
	}
};

const nextPage = () => {
	if (paginationData.value.current_page < paginationData.value.last_page) {
		goToPage(paginationData.value.current_page + 1);
	}
};

const prevPage = () => {
	if (paginationData.value.current_page > 1) {
		goToPage(paginationData.value.current_page - 1);
	}
};

// Search and filter watchers
watch(profileSearchQuery, () => {
	loadSammelrollen(1); // Reset to first page when searching
});

watch(selectedGroupFilter, () => {
	loadSammelrollen(1); // Reset to first page when filtering
});

// Function to get visible page numbers for pagination
const getVisiblePages = () => {
	const current = paginationData.value.current_page;
	const last = paginationData.value.last_page;
	const pages = [];

	if (last <= 7) {
		// Show all pages if 7 or fewer
		for (let i = 1; i <= last; i++) {
			pages.push(i);
		}
	} else {
		// Complex pagination with ellipsis
		if (current <= 4) {
			// Show first 5 pages + ellipsis + last page
			for (let i = 1; i <= 5; i++) {
				pages.push(i);
			}
			pages.push('...');
			pages.push(last);
		} else if (current >= last - 3) {
			// Show first page + ellipsis + last 5 pages
			pages.push(1);
			pages.push('...');
			for (let i = last - 4; i <= last; i++) {
				pages.push(i);
			}
		} else {
			// Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
			pages.push(1);
			pages.push('...');
			for (let i = current - 1; i <= current + 1; i++) {
				pages.push(i);
			}
			pages.push('...');
			pages.push(last);
		}
	}
	
	return pages;
};

const getProfileCount = (groupId) => {
	const group = rollengruppen.value.find(g => g.RollengruppeID === groupId);
	return group && group.sammelrollen ? group.sammelrollen.length : 0;
};

const getGroupName = (groupId) => {
	const group = rollengruppen.value.find(g => g.RollengruppeID === groupId);
	return group ? group.Bezeichnung : 'Unbekannt';
};

const addGroup = async () => {
	try {
		if (editingGroup.value) {
			// Update existing group
			const response = await adminService.updateSapRoleGroup(editingGroup.value, newGroup.value);
			if (response && response.group) {
				const index = rollengruppen.value.findIndex(g => g.RollengruppeID === editingGroup.value);
				if (index !== -1) {
					rollengruppen.value[index] = response.group;
				}
			}
		} else {
			// Create new group
			const response = await adminService.createSapRoleGroup(newGroup.value);
			if (response && response.group) {
				rollengruppen.value.push(response.group);
			}
		}
		closeModals();
		await loadRollengruppen(); // Reload to get fresh data
	} catch (error) {
		console.error('Fehler beim Speichern der Rollengruppe:', error);
		alert('Fehler beim Speichern der Rollengruppe: ' + (error.response?.data?.message || error.message));
	}
};

const addProfile = async () => {
	try {
		if (editingProfile.value) {
			// Update existing profile
			const response = await adminService.updateSapRole(editingProfile.value, newProfile.value);
			if (response && response.role) {
				const index = sammelrollen.value.findIndex(p => p.SammelrollenID === editingProfile.value);
				if (index !== -1) {
					sammelrollen.value[index] = response.role;
				}
			}
		} else {
			// Create new profile
			const response = await adminService.createSapRole(newProfile.value);
			if (response && response.role) {
				sammelrollen.value.push(response.role);
			}
		}
		closeModals();
		await loadSammelrollen(); // Reload to get fresh data
	} catch (error) {
		console.error('Fehler beim Speichern des SAP Profils:', error);
		alert('Fehler beim Speichern des SAP Profils: ' + (error.response?.data?.message || error.message));
	}
};

const editGroup = (group) => {
	newGroup.value = { ...group };
	editingGroup.value = group.RollengruppeID;
	showAddGroupForm.value = true;
};

const deleteGroup = async (group) => {
	if (confirm(`Rollengruppe "${group.Bezeichnung}" wirklich löschen?`)) {
		try {
			await adminService.deleteSapRoleGroup(group.RollengruppeID);
			rollengruppen.value = rollengruppen.value.filter(g => g.RollengruppeID !== group.RollengruppeID);
		} catch (error) {
			console.error('Fehler beim Löschen der Rollengruppe:', error);
			alert('Fehler beim Löschen der Rollengruppe: ' + (error.response?.data?.message || error.message));
		}
	}
};

const editProfile = (profile) => {
	newProfile.value = { ...profile };
	editingProfile.value = profile.SammelrollenID;
	showAddProfileForm.value = true;
};

const deleteProfile = async (profile) => {
	if (confirm(`SAP Profil "${profile.Bezeichnung}" wirklich löschen?`)) {
		try {
			await adminService.deleteSapRole(profile.SammelrollenID);
			sammelrollen.value = sammelrollen.value.filter(p => p.SammelrollenID !== profile.SammelrollenID);
		} catch (error) {
			console.error('Fehler beim Löschen des SAP Profils:', error);
			alert('Fehler beim Löschen des SAP Profils: ' + (error.response?.data?.message || error.message));
		}
	}
};

const closeModals = () => {
	showAddGroupForm.value = false;
	showAddProfileForm.value = false;
	editingGroup.value = null;
	editingProfile.value = null;
	newGroup.value = { Bezeichnung: '' };
	newProfile.value = { Bezeichnung: '', Schluessel: '', RollengruppeID: '' };
};

onMounted(async () => {
	await loadRollengruppen();
	await loadSammelrollen();
});
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

.profile-controls {
	display: flex;
	gap: 1rem;
	align-items: center;
	flex-wrap: wrap;
}

.search-input-container {
	position: relative;
}

.search-input {
	padding: 0.5rem 2rem 0.5rem 0.75rem;
	border: 1px solid var(--color-border);
	border-radius: 0.25rem;
	background: var(--color-background);
	color: var(--color-text);
	width: 250px;
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

.group-header h4 {
	margin: 0;
	color: var(--color-text);
	font-size: 1.1rem;
}

.group-actions {
	display: flex;
	gap: 0.5rem;
}

.group-stats {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1rem;
}

.stat-badge {
	background: var(--color-background-soft);
	color: var(--color-text);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.8rem;
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
	.section-header {
		flex-direction: column;
		align-items: stretch;
	}
	
	.profile-controls {
		flex-direction: column;
	}
	
	.search-input {
		width: 100%;
	}
	
	.groups-grid {
		grid-template-columns: 1fr;
	}
	
	.profiles-table {
		font-size: 0.9rem;
	}
	
	.profiles-table th,
	.profiles-table td {
		padding: 0.5rem;
	}
	
	.pagination-container {
		flex-direction: column;
		align-items: stretch;
		text-align: center;
	}
	
	.pagination-controls {
		justify-content: center;
		flex-wrap: wrap;
	}
	
	.pagination-btn {
		font-size: 0.8rem;
		padding: 0.4rem 0.8rem !important;
	}
	
	.page-btn {
		width: 2rem;
		height: 2rem;
		font-size: 0.8rem;
	}
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