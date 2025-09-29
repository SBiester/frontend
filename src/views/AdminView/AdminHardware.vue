<template>
<div>
	<!-- Category Modal -->
	<BaseModal
		:show="showAddCategoryForm"
		:title="editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie hinzufügen'"
		:show-actions="false"
		@close="closeModals"
	>
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
	</BaseModal>

	<!-- Hardware Modal -->
	<BaseModal
		:show="showAddHardwareForm"
		:title="editingHardware ? 'Hardware bearbeiten' : 'Neue Hardware hinzufügen'"
		:show-actions="false"
		@close="closeModals"
	>
		<form @submit.prevent="addHardware">
			<div class="form-group">
				<label>Name</label>
				<input v-model="newHardware.name" type="text" required class="form-input">
			</div>
			<div class="form-group">
				<label>Kategorie</label>
				<select v-model="newHardware.category_id" required class="form-input">
					<option value="">Kategorie wählen</option>
					<option v-for="category in adminStore.hardwareCategories" :key="category.id" :value="category.id">
						{{ category.name }}
					</option>
				</select>
			</div>
			<div class="form-group">
				<label>Maximale Anzahl</label>
				<input v-model="newHardware.MaxAnzahl" type="number" min="1" class="form-input" placeholder="Leer lassen für unbegrenzt">
				<small class="form-help">Maximale Anzahl, die von diesem Hardware-Typ bestellt werden darf. Leer lassen für unbegrenzte Bestellungen.</small>
			</div>
			<div class="modal-actions">
				<button type="button" @click="closeModals" class="btn-secondary">Abbrechen</button>
				<button type="submit" class="btn-primary">{{ editingHardware ? 'Aktualisieren' : 'Hardware hinzufügen' }}</button>
			</div>
		</form>
	</BaseModal>
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
					<button @click="openAddCategoryForm" class="add-button">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Neue Kategorie
					</button>
				</div>
				
				<div class="categories-grid">
					<div v-for="category in adminStore.hardwareCategories" :key="category.id" class="category-card">
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
								class="search-input compact"
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
							<option v-for="category in adminStore.hardwareCategories" :key="category.id" :value="category.id">
								{{ category.name }}
							</option>
						</select>
						<button @click="openAddHardwareForm" class="add-button">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 5v14m7-7H5"></path>
							</svg>
							Neue Hardware
						</button>
					</div>
				</div>

				<div class="data-table-container">
					<table class="data-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Kategorie</th>
								<th>Max. Anzahl</th>
								<th class="text-right">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in filteredHardware" :key="item.id" class="hardware-row">
								<td class="hardware-name">{{ item.name }}</td>
								<td>
									<span class="category-badge">{{ getCategoryName(item.category_id) }}</span>
								</td>
								<td>
									<span class="max-anzahl-badge">{{ item.MaxAnzahl || 'Unbegrenzt' }}</span>
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
	</div>
</div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import BaseModal from '@/components/BaseModal.vue'

const emit = defineEmits(['go-back'])

const adminStore = useAdminStore()

const activeTab = ref('hardware')
const hardwareSearchQuery = ref('')
const selectedCategoryFilter = ref('')

const showAddCategoryForm = ref(false)
const showAddHardwareForm = ref(false)

const editingCategory = ref(null)
const editingHardware = ref(null)

const newCategory = ref({ name: '' })
const newHardware = ref({ name: '', category_id: '', MaxAnzahl: '' })

const filteredHardware = computed(() => {
	let filtered = adminStore.hardware
	
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
	const category = adminStore.hardwareCategories.find(c => c.id === categoryId)
	return category ? category.name : 'Unbekannt'
}

const addCategory = async () => {
	try {
		let result
		if (editingCategory.value) {
			result = await adminStore.categoriesOps.update(editingCategory.value, newCategory.value)
		} else {
			result = await adminStore.categoriesOps.create(newCategory.value)
		}

		console.log('Category operation result:', result) // Debug log

		// Verify the category was actually added to the store
		console.log('Categories in store after creation:', adminStore.hardwareCategories)
		const createdCategory = adminStore.hardwareCategories.find(cat => cat.name === result.name)
		console.log('Created category found in store:', createdCategory)

		closeModals()

		// Force reactivity update if needed
		await nextTick()
	} catch (error) {
		console.error('Fehler beim Speichern der Kategorie:', error)
		alert('Fehler beim Speichern der Kategorie')
	}
}

const addHardware = async () => {
	try {
		if (editingHardware.value) {
			await adminStore.hardwareOps.update(editingHardware.value, newHardware.value)
		} else {
			await adminStore.hardwareOps.create(newHardware.value)
		}
		closeModals()
	} catch (error) {
		console.error('Fehler beim Speichern der Hardware:', error)
		alert('Fehler beim Speichern der Hardware: ' + (error.response?.data?.message || error.message))
	}
}

const openAddCategoryForm = () => {
	newCategory.value = { name: '' }
	editingCategory.value = null
	showAddCategoryForm.value = true
}

const editCategory = (category) => {
	newCategory.value = { ...category }
	editingCategory.value = category.id
	showAddCategoryForm.value = true
}

const deleteCategory = async (category) => {
	try {
		await adminStore.categoriesOps.remove(category.id)
	} catch (error) {
		console.error('Fehler beim Löschen der Kategorie:', error)
		alert('Fehler beim Löschen der Kategorie: ' + (error.response?.data?.message || error.message))
	}
}

const openAddHardwareForm = () => {
	newHardware.value = { name: '', category_id: '', MaxAnzahl: '' }
	editingHardware.value = null
	showAddHardwareForm.value = true
}

const editHardware = (item) => {
	newHardware.value = { ...item }
	editingHardware.value = item.id
	showAddHardwareForm.value = true
}

const deleteHardware = async (item) => {
	try {
		await adminStore.hardwareOps.remove(item.id)
	} catch (error) {
		console.error('Fehler beim Löschen der Hardware:', error)
		alert('Fehler beim Löschen der Hardware: ' + (error.response?.data?.message || error.message))
	}
}

const closeModals = () => {
	showAddCategoryForm.value = false
	showAddHardwareForm.value = false
	editingCategory.value = null
	editingHardware.value = null
	newCategory.value = { name: '' }
	newHardware.value = { name: '', category_id: '', MaxAnzahl: '' }
}

onMounted(async () => {
	await adminStore.hardwareOps.load()
	await adminStore.categoriesOps.load()
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

.hardware-controls {
	display: flex;
	gap: 1rem;
	align-items: center;
	flex-wrap: wrap;
}

.hardware-controls > * {
	margin: 0 !important;
}

.search-input-container {
	position: relative;
}

/* Search input - using compact variant from main.css */
.search-input {
	border-radius: 0.25rem; /* Override for AdminView */
	height: 2.5rem;
	padding: 0.75rem 2.5rem 0.75rem 1rem;
	box-sizing: border-box;
}

.search-icon {
	position: absolute;
	right: 0.5rem;
	top: 50%;
	transform: translateY(-50%);
	color: var(--color-text-muted);
}

.filter-select {
	padding: 0.75rem 0.5rem;
	border: 1px solid var(--color-border);
	border-radius: 0.25rem;
	background: var(--color-background);
	color: var(--color-text);
	height: 2.5rem;
	box-sizing: border-box;
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

/* Table container styling inherited from main.css */

/* Table styling moved to main.css */

.hardware-row {
	border-bottom: 1px solid var(--color-border);
	transition: background-color 0.2s ease;
}

.hardware-row:hover {
	background: var(--color-background-soft);
}

/* Table cell styling moved to main.css */

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

.max-anzahl-badge {
	background: var(--color-button);
	color: var(--color-text-inverted);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.8rem;
	font-weight: 500;
}

/* Action button styling moved to main.css */
.action-buttons {
	justify-content: flex-end; /* Hardware-specific alignment */
}

/* Modal styles moved to main.css */

/* Form and button styling moved to main.css */

.form-help {
	display: block;
	margin-top: 0.25rem;
	color: var(--color-text-muted);
	font-size: 0.8rem;
	line-height: 1.3;
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
	
	.data-table {
		font-size: 0.9rem;
	}
	
	.data-table th,
	.data-table td {
		padding: 0.5rem;
	}
}
</style>