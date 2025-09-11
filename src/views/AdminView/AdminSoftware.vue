<template>
<div>
	<hr class="shadow-line" />
	<div class="ref">
		<h2>Software verwalten</h2>
		<p>Verwalte den Software-Katalog, füge neue Anwendungen hinzu und organisiere Hersteller</p>
		<hr class="shadow-line" />
		
		<div class="software-management">
			<!-- Tab Navigation -->
			<div class="tab-navigation">
				<button 
					@click="activeTab = 'software'" 
					:class="{ 'active': activeTab === 'software' }"
					class="tab-button"
				>
					Software
				</button>
				<button 
					@click="activeTab = 'manufacturers'" 
					:class="{ 'active': activeTab === 'manufacturers' }"
					class="tab-button"
				>
					Hersteller
				</button>
			</div>

			<!-- Hersteller Tab -->
			<div v-if="activeTab === 'manufacturers'" class="tab-content">
				<div class="section-header">
					<h3>Software-Hersteller</h3>
					<button @click="showAddManufacturerForm = true" class="add-button">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Neuer Hersteller
					</button>
				</div>
				
				<div class="manufacturers-grid">
					<div v-for="manufacturer in manufacturers" :key="manufacturer.id" class="manufacturer-card">
						<div class="manufacturer-header">
							<h4>{{ manufacturer.name }}</h4>
							<div class="manufacturer-actions">
								<button @click="editManufacturer(manufacturer)" class="action-btn edit">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
									</svg>
								</button>
								<button @click="deleteManufacturer(manufacturer)" class="action-btn delete">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="3,6 5,6 21,6"></polyline>
										<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
									</svg>
								</button>
							</div>
						</div>
						<div class="manufacturer-stats">
							<span class="stat-badge">ID: {{ manufacturer.id }}</span>
							<span class="stat-badge">{{ manufacturer.software_count }} Software-Anwendungen</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Software Tab -->
			<div v-if="activeTab === 'software'" class="tab-content">
				<div class="section-header">
					<h3>Software-Anwendungen</h3>
					<div class="software-controls">
						<div class="search-input-container">
							<input 
								v-model="softwareSearchQuery"
								type="text" 
								class="search-input"
								placeholder="Software durchsuchen..."
							/>
							<div class="search-icon">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.35-4.35"></path>
								</svg>
							</div>
						</div>
						<select v-model="selectedManufacturerFilter" class="filter-select">
							<option value="">Alle Hersteller</option>
							<option v-for="manufacturer in manufacturers" :key="manufacturer.id" :value="manufacturer.id">
								{{ manufacturer.name }}
							</option>
						</select>
						<button @click="showAddSoftwareForm = true" class="add-button">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 5v14m7-7H5"></path>
							</svg>
							Neue Software
						</button>
					</div>
				</div>

				<div class="software-table-container">
					<table class="software-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Hersteller</th>
								<th class="text-right">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in filteredSoftware" :key="item.id" class="software-row">
								<td class="software-name">{{ item.name }}</td>
								<td>
									<span class="manufacturer-badge">{{ getManufacturerName(item.manufacturer_id) }}</span>
								</td>
								<td class="text-right">
									<div class="action-buttons">
										<button @click="editSoftware(item)" class="action-btn edit">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
												<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
											</svg>
										</button>
										<button @click="deleteSoftware(item)" class="action-btn delete">
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
			</div>
		</div>

		<!-- Add Manufacturer Modal -->
		<div v-if="showAddManufacturerForm" class="modal-overlay" @click="closeModals">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingManufacturer ? 'Hersteller bearbeiten' : 'Neuen Hersteller hinzufügen' }}</h3>
					<button @click="closeModals" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="addManufacturer">
						<div class="form-group">
							<label>Name</label>
							<input v-model="newManufacturer.name" type="text" required class="form-input">
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeModals" class="btn-secondary">Abbrechen</button>
							<button type="submit" class="btn-primary">{{ editingManufacturer ? 'Aktualisieren' : 'Hersteller hinzufügen' }}</button>
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Add Software Modal -->
		<div v-if="showAddSoftwareForm" class="modal-overlay" @click="closeModals">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingSoftware ? 'Software bearbeiten' : 'Neue Software hinzufügen' }}</h3>
					<button @click="closeModals" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="addSoftware">
						<div class="form-group">
							<label>Name</label>
							<input v-model="newSoftware.name" type="text" required class="form-input">
						</div>
						<div class="form-group">
							<label>Hersteller</label>
							<select v-model="newSoftware.manufacturer_id" required class="form-input">
								<option value="">Hersteller wählen</option>
								<option v-for="manufacturer in manufacturers" :key="manufacturer.id" :value="manufacturer.id">
									{{ manufacturer.name }}
								</option>
							</select>
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeModals" class="btn-secondary">Abbrechen</button>
							<button type="submit" class="btn-primary">{{ editingSoftware ? 'Aktualisieren' : 'Software hinzufügen' }}</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		
	</div>
</div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import adminService from '@/services/adminService';

const emit = defineEmits(['go-back']);

const activeTab = ref('software');
const softwareSearchQuery = ref('');
const selectedManufacturerFilter = ref('');

const manufacturers = ref([]);
const softwareItems = ref([]);

const showAddManufacturerForm = ref(false);
const showAddSoftwareForm = ref(false);

const editingManufacturer = ref(null);
const editingSoftware = ref(null);

const newManufacturer = ref({ name: '' });
const newSoftware = ref({ name: '', manufacturer_id: '' });

const loadManufacturers = async () => {
	try {
		const data = await adminService.getSoftwareManufacturers();
		manufacturers.value = data || [];
	} catch (error) {
		console.error('Fehler beim Laden der Hersteller:', error);
		manufacturers.value = [];
	}
};

const loadSoftware = async () => {
	try {
		const data = await adminService.getSoftwareItems();
		if (data && data.data) {
			softwareItems.value = data.data;
		} else {
			softwareItems.value = data || [];
		}
	} catch (error) {
		console.error('Fehler beim Laden der Software:', error);
		softwareItems.value = [];
	}
};

const filteredSoftware = computed(() => {
	let filtered = softwareItems.value;
	
	if (softwareSearchQuery.value) {
		const query = softwareSearchQuery.value.toLowerCase();
		filtered = filtered.filter(item => 
			item.name.toLowerCase().includes(query)
		);
	}
	
	if (selectedManufacturerFilter.value) {
		filtered = filtered.filter(item => item.manufacturer_id == selectedManufacturerFilter.value);
	}
	
	return filtered;
});

const getManufacturerName = (manufacturerId) => {
	const manufacturer = manufacturers.value.find(m => m.id === manufacturerId);
	return manufacturer ? manufacturer.name : 'Unbekannt';
};

const addManufacturer = async () => {
	try {
		if (editingManufacturer.value) {
			// Update existing manufacturer
			const response = await adminService.updateSoftwareManufacturer(editingManufacturer.value, newManufacturer.value);
			if (response && response.manufacturer) {
				const index = manufacturers.value.findIndex(m => m.id === editingManufacturer.value);
				if (index !== -1) {
					manufacturers.value[index] = response.manufacturer;
				}
			}
		} else {
			// Create new manufacturer
			const response = await adminService.createSoftwareManufacturer(newManufacturer.value);
			if (response && response.manufacturer) {
				manufacturers.value.push(response.manufacturer);
			}
		}
		closeModals();
		await loadManufacturers(); // Reload to get fresh data
	} catch (error) {
		console.error('Fehler beim Speichern des Herstellers:', error);
		alert('Fehler beim Speichern des Herstellers: ' + (error.response?.data?.message || error.message));
	}
};

const addSoftware = async () => {
	try {
		if (editingSoftware.value) {
			// Update existing software
			const response = await adminService.updateSoftwareItem(editingSoftware.value, newSoftware.value);
			if (response && response.software) {
				const index = softwareItems.value.findIndex(s => s.id === editingSoftware.value);
				if (index !== -1) {
					softwareItems.value[index] = response.software;
				}
			}
		} else {
			// Create new software
			const response = await adminService.createSoftwareItem(newSoftware.value);
			if (response && response.software) {
				softwareItems.value.push(response.software);
			}
		}
		closeModals();
		await loadSoftware(); // Reload to get fresh data
	} catch (error) {
		console.error('Fehler beim Speichern der Software:', error);
		alert('Fehler beim Speichern der Software: ' + (error.response?.data?.message || error.message));
	}
};

const editManufacturer = (manufacturer) => {
	newManufacturer.value = { ...manufacturer };
	editingManufacturer.value = manufacturer.id;
	showAddManufacturerForm.value = true;
};

const deleteManufacturer = async (manufacturer) => {
	if (confirm(`Hersteller "${manufacturer.name}" wirklich löschen?`)) {
		try {
			await adminService.deleteSoftwareManufacturer(manufacturer.id);
			manufacturers.value = manufacturers.value.filter(m => m.id !== manufacturer.id);
		} catch (error) {
			console.error('Fehler beim Löschen des Herstellers:', error);
			alert('Fehler beim Löschen des Herstellers: ' + (error.response?.data?.message || error.message));
		}
	}
};

const editSoftware = (item) => {
	newSoftware.value = { 
		name: item.name,
		manufacturer_id: item.manufacturer_id
	};
	editingSoftware.value = item.id;
	showAddSoftwareForm.value = true;
};

const deleteSoftware = async (item) => {
	if (confirm(`Software "${item.name}" wirklich löschen?`)) {
		try {
			await adminService.deleteSoftwareItem(item.id);
			softwareItems.value = softwareItems.value.filter(s => s.id !== item.id);
		} catch (error) {
			console.error('Fehler beim Löschen der Software:', error);
			alert('Fehler beim Löschen der Software: ' + (error.response?.data?.message || error.message));
		}
	}
};

const closeModals = () => {
	showAddManufacturerForm.value = false;
	showAddSoftwareForm.value = false;
	editingManufacturer.value = null;
	editingSoftware.value = null;
	newManufacturer.value = { name: '' };
	newSoftware.value = { name: '', manufacturer_id: '' };
};

onMounted(async () => {
	await loadManufacturers();
	await loadSoftware();
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

.software-controls {
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

.manufacturers-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 1.5rem;
}

.manufacturer-card {
	background: var(--color-background);
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
	padding: 1.5rem;
	transition: all 0.2s ease;
}

.manufacturer-card:hover {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.manufacturer-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 1rem;
}

.manufacturer-header h4 {
	margin: 0;
	color: var(--color-text);
	font-size: 1.1rem;
}

.manufacturer-actions {
	display: flex;
	gap: 0.5rem;
}

.manufacturer-stats {
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

.software-table-container {
	overflow-x: auto;
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
}

.software-table {
	width: 100%;
	border-collapse: collapse;
}

.software-table th {
	background: var(--color-background-mute);
	color: var(--color-text);
	padding: 1rem;
	text-align: left;
	font-weight: 600;
	border-bottom: 1px solid var(--color-border);
}

.software-row {
	border-bottom: 1px solid var(--color-border);
	transition: background-color 0.2s ease;
}

.software-row:hover {
	background: var(--color-background-soft);
}

.software-table td {
	padding: 1rem;
	vertical-align: middle;
}

.software-name {
	font-weight: 500;
	color: var(--color-text);
}

.manufacturer-badge {
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
	z-index: 9999;
}

.modal-content {
	background: var(--color-background);
	border-radius: 0.5rem;
	width: 90%;
	max-width: 500px;
	max-height: 90vh;
	overflow-y: auto;
	z-index: 10000;
	position: relative;
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

@media (max-width: 768px) {
	.section-header {
		flex-direction: column;
		align-items: stretch;
	}
	
	.software-controls {
		flex-direction: column;
	}
	
	.search-input {
		width: 100%;
	}
	
	.manufacturers-grid {
		grid-template-columns: 1fr;
	}
	
	.software-table {
		font-size: 0.9rem;
	}
	
	.software-table th,
	.software-table td {
		padding: 0.5rem;
	}
}

.text-right {
	text-align: right !important;
}
</style>