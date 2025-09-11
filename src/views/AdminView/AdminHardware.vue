<template>
<div>
	<hr class="shadow-line" />
	<div class="ref">
		<h2>Hardware verwalten</h2>
		<p>Verwalte den Hardware-Katalog, füge neue Geräte hinzu und organisiere Kategorien</p>
		<hr class="shadow-line" />
		
		<div class="hardware-management">
			<!-- Tab Navigation -->
			<div class="tab-navigation">
				<button 
					@click="activeTab = 'hardware'" 
					:class="{ 'active': activeTab === 'hardware' }"
					class="tab-button"
				>
					Hardware
				</button>
				<button 
					@click="activeTab = 'categories'" 
					:class="{ 'active': activeTab === 'categories' }"
					class="tab-button"
				>
					Kategorien
				</button>
			</div>

			<!-- Kategorien Tab -->
			<div v-if="activeTab === 'categories'" class="tab-content">
				<div class="section-header">
					<h3>Hardware-Kategorien</h3>
					<button @click="showAddCategoryForm = true" class="add-button">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Neue Kategorie
					</button>
				</div>
				
				<div class="categories-grid">
					<div v-for="category in categories" :key="category.id" class="category-card">
						<div class="category-header">
							<h4>{{ category.name }}</h4>
							<div class="category-actions">
								<button @click="editCategory(category)" class="action-btn edit">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
									</svg>
								</button>
								<button @click="deleteCategory(category)" class="action-btn delete">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="3,6 5,6 21,6"></polyline>
										<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
									</svg>
								</button>
							</div>
						</div>
						<div class="category-stats">
							<span class="stat-badge">{{ category.hardware_count }} Hardware-Elemente</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Hardware Tab -->
			<div v-if="activeTab === 'hardware'" class="tab-content">
				<div class="section-header">
					<h3>Hardware-Elemente</h3>
					<div class="hardware-controls">
						<div class="search-input-container">
							<input 
								v-model="hardwareSearchQuery"
								type="text" 
								class="search-input"
								placeholder="Hardware durchsuchen..."
							/>
							<div class="search-icon">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.35-4.35"></path>
								</svg>
							</div>
						</div>
						<select v-model="selectedCategoryFilter" class="filter-select">
							<option value="">Alle Kategorien</option>
							<option v-for="category in categories" :key="category.id" :value="category.id">
								{{ category.name }}
							</option>
						</select>
						<button @click="showAddHardwareForm = true" class="add-button">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 5v14m7-7H5"></path>
							</svg>
							Neue Hardware
						</button>
					</div>
				</div>

				<div class="hardware-table-container">
					<table class="hardware-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Kategorie</th>
								<th class="text-right">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in filteredHardware" :key="item.id" class="hardware-row">
								<td class="hardware-name">{{ item.name }}</td>
								<td>
									<span class="category-badge">{{ getCategoryName(item.category_id) }}</span>
								</td>
								<td class="text-right">
									<div class="action-buttons">
										<button @click="editHardware(item)" class="action-btn edit">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
												<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
											</svg>
										</button>
										<button @click="deleteHardware(item)" class="action-btn delete">
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

		<!-- Add Category Modal -->
		<div v-if="showAddCategoryForm" class="modal-overlay" @click="closeModals">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie hinzufügen' }}</h3>
					<button @click="closeModals" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="addCategory">
						<div class="form-group">
							<label>Name</label>
							<input v-model="newCategory.name" type="text" required class="form-input">
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeModals" class="btn-secondary">Abbrechen</button>
							<button type="submit" class="btn-primary">{{ editingCategory ? 'Aktualisieren' : 'Kategorie hinzufügen' }}</button>
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Add Hardware Modal -->
		<div v-if="showAddHardwareForm" class="modal-overlay" @click="closeModals">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingHardware ? 'Hardware bearbeiten' : 'Neue Hardware hinzufügen' }}</h3>
					<button @click="closeModals" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="addHardware">
						<div class="form-group">
							<label>Name</label>
							<input v-model="newHardware.name" type="text" required class="form-input">
						</div>
						<div class="form-group">
							<label>Kategorie</label>
							<select v-model="newHardware.category_id" required class="form-input">
								<option value="">Kategorie wählen</option>
								<option v-for="category in categories" :key="category.id" :value="category.id">
									{{ category.name }}
								</option>
							</select>
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeModals" class="btn-secondary">Abbrechen</button>
							<button type="submit" class="btn-primary">{{ editingHardware ? 'Aktualisieren' : 'Hardware hinzufügen' }}</button>
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

const activeTab = ref('hardware');
const hardwareSearchQuery = ref('');
const selectedCategoryFilter = ref('');

const categories = ref([]);
const hardwareItems = ref([]);

const showAddCategoryForm = ref(false);
const showAddHardwareForm = ref(false);

const editingCategory = ref(null);
const editingHardware = ref(null);

const newCategory = ref({ name: '' });
const newHardware = ref({ name: '', category_id: '' });

const loadCategories = async () => {
	try {
		const data = await adminService.getHardwareCategories();
		categories.value = data || [];
	} catch (error) {
		console.error('Fehler beim Laden der Kategorien:', error);
		categories.value = [];
	}
};

const loadHardware = async () => {
	try {
		const data = await adminService.getHardwareItems();
		if (data && data.data) {
			hardwareItems.value = data.data;
		} else {
			hardwareItems.value = data || [];
		}
	} catch (error) {
		console.error('Fehler beim Laden der Hardware:', error);
		hardwareItems.value = [];
	}
};

const filteredHardware = computed(() => {
	let filtered = hardwareItems.value;
	
	if (hardwareSearchQuery.value) {
		const query = hardwareSearchQuery.value.toLowerCase();
		filtered = filtered.filter(item => 
			item.name.toLowerCase().includes(query)
		);
	}
	
	if (selectedCategoryFilter.value) {
		filtered = filtered.filter(item => item.category_id == selectedCategoryFilter.value);
	}
	
	return filtered;
});

const getCategoryName = (categoryId) => {
	const category = categories.value.find(c => c.id === categoryId);
	return category ? category.name : 'Unbekannt';
};

const addCategory = async () => {
	try {
		if (editingCategory.value) {
			// Update existing category
			const response = await adminService.updateHardwareCategory(editingCategory.value, newCategory.value);
			if (response && response.category) {
				const index = categories.value.findIndex(c => c.id === editingCategory.value);
				if (index !== -1) {
					categories.value[index] = response.category;
				}
			}
		} else {
			// Create new category
			const response = await adminService.createHardwareCategory(newCategory.value);
			if (response && response.category) {
				categories.value.push(response.category);
			}
		}
		closeModals();
		await loadCategories(); // Reload to get fresh data
	} catch (error) {
		console.error('Fehler beim Speichern der Kategorie:', error);
		alert('Fehler beim Speichern der Kategorie: ' + (error.response?.data?.message || error.message));
	}
};

const addHardware = async () => {
	try {
		if (editingHardware.value) {
			// Update existing hardware
			const response = await adminService.updateHardwareItem(editingHardware.value, newHardware.value);
			if (response && response.hardware) {
				const index = hardwareItems.value.findIndex(h => h.id === editingHardware.value);
				if (index !== -1) {
					hardwareItems.value[index] = response.hardware;
				}
			}
		} else {
			// Create new hardware
			const response = await adminService.createHardwareItem(newHardware.value);
			if (response && response.hardware) {
				hardwareItems.value.push(response.hardware);
			}
		}
		closeModals();
		await loadHardware(); // Reload to get fresh data
	} catch (error) {
		console.error('Fehler beim Speichern der Hardware:', error);
		alert('Fehler beim Speichern der Hardware: ' + (error.response?.data?.message || error.message));
	}
};

const editCategory = (category) => {
	newCategory.value = { ...category };
	editingCategory.value = category.id;
	showAddCategoryForm.value = true;
};

const deleteCategory = async (category) => {
	if (confirm(`Kategorie "${category.name}" wirklich löschen?`)) {
		try {
			await adminService.deleteHardwareCategory(category.id);
			categories.value = categories.value.filter(c => c.id !== category.id);
		} catch (error) {
			console.error('Fehler beim Löschen der Kategorie:', error);
			alert('Fehler beim Löschen der Kategorie: ' + (error.response?.data?.message || error.message));
		}
	}
};

const editHardware = (item) => {
	newHardware.value = { ...item };
	editingHardware.value = item.id;
	showAddHardwareForm.value = true;
};

const deleteHardware = async (item) => {
	if (confirm(`Hardware "${item.name}" wirklich löschen?`)) {
		try {
			await adminService.deleteHardwareItem(item.id);
			hardwareItems.value = hardwareItems.value.filter(h => h.id !== item.id);
		} catch (error) {
			console.error('Fehler beim Löschen der Hardware:', error);
			alert('Fehler beim Löschen der Hardware: ' + (error.response?.data?.message || error.message));
		}
	}
};

const closeModals = () => {
	showAddCategoryForm.value = false;
	showAddHardwareForm.value = false;
	editingCategory.value = null;
	editingHardware.value = null;
	newCategory.value = { name: '' };
	newHardware.value = { name: '', category_id: '' };
};

onMounted(async () => {
	await loadCategories();
	await loadHardware();
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

.hardware-controls {
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

.categories-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 1.5rem;
}

.category-card {
	background: var(--color-background);
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
	padding: 1.5rem;
	transition: all 0.2s ease;
}

.category-card:hover {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 1rem;
}

.category-header h4 {
	margin: 0;
	color: var(--color-text);
	font-size: 1.1rem;
}

.category-actions {
	display: flex;
	gap: 0.5rem;
}

.category-stats {
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

.hardware-table-container {
	overflow-x: auto;
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
}

.hardware-table {
	width: 100%;
	border-collapse: collapse;
}

.hardware-table th {
	background: var(--color-background-mute);
	color: var(--color-text);
	padding: 1rem;
	text-align: left;
	font-weight: 600;
	border-bottom: 1px solid var(--color-border);
}

.hardware-row {
	border-bottom: 1px solid var(--color-border);
	transition: background-color 0.2s ease;
}

.hardware-row:hover {
	background: var(--color-background-soft);
}

.hardware-table td {
	padding: 1rem;
	vertical-align: middle;
}

.hardware-name {
	font-weight: 500;
	color: var(--color-text);
}

.category-badge {
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
	
	.hardware-controls {
		flex-direction: column;
	}
	
	.search-input {
		width: 100%;
	}
	
	.categories-grid {
		grid-template-columns: 1fr;
	}
	
	.hardware-table {
		font-size: 0.9rem;
	}
	
	.hardware-table th,
	.hardware-table td {
		padding: 0.5rem;
	}
}
</style>