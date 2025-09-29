<template>
<div>
	<!-- Manufacturer Modal -->
	<BaseModal
		:show="showAddManufacturerForm"
		:title="editingManufacturer ? 'Hersteller bearbeiten' : 'Neuer Hersteller hinzufügen'"
		:show-actions="false"
		@close="closeModals"
	>
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
	</BaseModal>

	<!-- Software Modal -->
	<BaseModal
		:show="showAddSoftwareForm"
		:title="editingSoftware ? 'Software bearbeiten' : 'Neue Software hinzufügen'"
		:show-actions="false"
		@close="closeModals"
	>
		<form @submit.prevent="addSoftware">
			<div class="form-group">
				<label>Name</label>
				<input v-model="newSoftware.name" type="text" required class="form-input">
			</div>
			<div class="form-group">
				<label>Hersteller</label>
				<select v-model="newSoftware.manufacturer_id" required class="form-input">
					<option value="">Hersteller wählen</option>
					<option v-for="manufacturer in adminStore.manufacturers" :key="manufacturer.id" :value="manufacturer.id">
						{{ manufacturer.name }}
					</option>
				</select>
			</div>
			<div class="modal-actions">
				<button type="button" @click="closeModals" class="btn-secondary">Abbrechen</button>
				<button type="submit" class="btn-primary">{{ editingSoftware ? 'Aktualisieren' : 'Software hinzufügen' }}</button>
			</div>
		</form>
	</BaseModal>
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
					<button @click="openAddManufacturerForm" class="add-button">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Neuer Hersteller
					</button>
				</div>
				
				<div class="manufacturers-grid">
					<div v-for="manufacturer in adminStore.manufacturers" :key="manufacturer.id" class="manufacturer-card">
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
								class="search-input compact"
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
							<option v-for="manufacturer in adminStore.manufacturers" :key="manufacturer.id" :value="manufacturer.id">
								{{ manufacturer.name }}
							</option>
						</select>
						<button @click="openAddSoftwareForm" class="add-button">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 5v14m7-7H5"></path>
							</svg>
							Neue Software
						</button>
					</div>
				</div>

				<div class="data-table-container">
					<table class="data-table">
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
	</div>
</div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import BaseModal from '@/components/BaseModal.vue'

const emit = defineEmits(['go-back'])

const adminStore = useAdminStore()

const activeTab = ref('software')
const softwareSearchQuery = ref('')
const selectedManufacturerFilter = ref('')

const showAddManufacturerForm = ref(false)
const showAddSoftwareForm = ref(false)

const editingManufacturer = ref(null)
const editingSoftware = ref(null)

const newManufacturer = ref({ name: '' })
const newSoftware = ref({ name: '', manufacturer_id: '' })


const filteredSoftware = computed(() => {
	let filtered = adminStore.software;

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
	const manufacturer = adminStore.manufacturers.find(m => m.id === manufacturerId);
	return manufacturer ? manufacturer.name : 'Unbekannt';
};

const addManufacturer = async () => {
	try {
		if (editingManufacturer.value) {
			await adminStore.manufacturersOps.update(editingManufacturer.value, newManufacturer.value);
		} else {
			await adminStore.manufacturersOps.create(newManufacturer.value);
		}
		closeModals();
	} catch (error) {
		console.error('Fehler beim Speichern des Herstellers:', error);
		alert('Fehler beim Speichern des Herstellers');
	}
};

const addSoftware = async () => {
	try {
		if (editingSoftware.value) {
			await adminStore.softwareOps.update(editingSoftware.value, newSoftware.value);
		} else {
			await adminStore.softwareOps.create(newSoftware.value);
		}
		closeModals();
	} catch (error) {
		console.error('Fehler beim Speichern der Software:', error);
		alert('Fehler beim Speichern der Software');
	}
};

const openAddManufacturerForm = () => {
	newManufacturer.value = { name: '' };
	editingManufacturer.value = null;
	showAddManufacturerForm.value = true;
};

const editManufacturer = (manufacturer) => {
	newManufacturer.value = { ...manufacturer };
	editingManufacturer.value = manufacturer.id;
	showAddManufacturerForm.value = true;
};

const deleteManufacturer = async (manufacturer) => {
	if (confirm(`Hersteller "${manufacturer.name}" wirklich löschen?`)) {
		try {
			await adminStore.manufacturersOps.remove(manufacturer.id);
		} catch (error) {
			console.error('Fehler beim Löschen des Herstellers:', error);
			alert('Fehler beim Löschen des Herstellers');
		}
	}
};

const openAddSoftwareForm = () => {
	newSoftware.value = { name: '', manufacturer_id: '' };
	editingSoftware.value = null;
	showAddSoftwareForm.value = true;
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
			await adminStore.softwareOps.remove(item.id);
		} catch (error) {
			console.error('Fehler beim Löschen der Software:', error);
			alert('Fehler beim Löschen der Software');
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
	console.log('AdminSoftware mounted - loading data...');
	await adminStore.manufacturersOps.load();
	await adminStore.softwareOps.load();
	console.log('Software data:', adminStore.software);
	console.log('Manufacturers data:', adminStore.manufacturers);
});
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

.software-controls {
	display: flex;
	gap: 1rem;
	align-items: center;
	flex-wrap: wrap;
}

.software-controls > * {
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
}

/* Add button styling moved to main.css */
.add-button {
	display: flex !important;
	align-items: center !important;
	gap: 0.5rem !important;
}

.add-button svg {
	flex-shrink: 0;
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

/* Table container styling inherited from main.css */

/* Table styling moved to main.css */

.software-row {
	border-bottom: 1px solid var(--color-border);
	transition: background-color 0.2s ease;
}

.software-row:hover {
	background: var(--color-background-soft);
}

/* Table cell styling moved to main.css */

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

/* Action button styling moved to main.css */
.action-buttons {
	justify-content: flex-end; /* Software-specific alignment */
}

/* Modal styles moved to main.css */

/* Form and button styling moved to main.css */

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
}

/* Search input - using compact variant from main.css */
.search-input {
	border-radius: 0.25rem; /* Override for AdminView */
}

.text-right {
	text-align: right !important;
}
</style>