<template>
<div>
	<hr class="shadow-line" />
	<div class="ref">
		<h2>Hardware verwalten</h2>
		<p>Verwalte den Hardware-Katalog, füge neue Geräte hinzu und organisiere Kategorien</p>
		<hr class="shadow-line" />
		
		<div class="hardware-management">
			<!-- Controls -->
			<div class="controls-section">
				<div class="search-input-container">
					<input 
						v-model="searchQuery"
						@input="onSearchInput"
						type="text" 
						class="search-input"
						placeholder="Hardware durchsuchen (Name, Kategorie, Spezifikationen)..."
					/>
					<div class="search-icon">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
					</div>
				</div>
				
				<div class="filter-controls">
					<select v-model="selectedCategory" class="filter-select">
						<option value="">Alle Kategorien</option>
						<option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
					</select>
					
					<select v-model="selectedStatus" class="filter-select">
						<option value="">Alle Status</option>
						<option value="available">Verfügbar</option>
						<option value="assigned">Zugewiesen</option>
						<option value="maintenance">Wartung</option>
					</select>
					
					<button @click="showAddHardwareForm = true" class="add-button">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14m7-7H5"></path>
						</svg>
						Hardware hinzufügen
					</button>
				</div>
			</div>

			<!-- Hardware Grid -->
			<div v-if="searchQuery && searchResults" class="search-results">
				<div v-if="searchResults.categories && searchResults.categories.length > 0">
					<div v-for="category in searchResults.categories" :key="category.category" class="search-category">
						<h3>{{ category.category }} ({{ category.items.length }})</h3>
						<div class="hardware-grid">
							<div v-for="item in category.items" :key="item.id" class="hardware-card">
								<div class="card-header">
									<h4>{{ item.name }}</h4>
									<div class="card-actions">
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
								</div>
								<div class="card-content">
									<div class="item-info">
										<span class="category-badge">{{ item.category }}</span>
										<span :class="`status-badge ${item.assigned ? 'assigned' : 'available'}`">
											{{ item.assigned ? 'Zugewiesen' : 'Verfügbar' }}
										</span>
									</div>
									<p class="specifications">{{ item.specifications }}</p>
									<div class="item-meta">
										<span class="item-id">ID: {{ item.id }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="no-results">
					<p>Keine Hardware gefunden für "{{ searchQuery }}"</p>
				</div>
			</div>

			<!-- Category-based display (when not searching) -->
			<div v-else class="categories-display">
				<div v-for="category in filteredCategories" :key="category.name" class="category-section">
					<div class="category-header">
						<h3>{{ category.name }} ({{ category.items.length }})</h3>
						<button @click="toggleCategory(category.name)" class="toggle-btn">
							<span :class="{ 'expanded': expandedCategories.has(category.name) }">
								{{ expandedCategories.has(category.name) ? '−' : '+' }}
							</span>
						</button>
					</div>
					
					<div v-if="expandedCategories.has(category.name)" class="hardware-grid">
						<div v-for="item in category.items" :key="item.id" class="hardware-card">
							<div class="card-header">
								<h4>{{ item.name }}</h4>
								<div class="card-actions">
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
							</div>
							<div class="card-content">
								<div class="item-info">
									<span class="category-badge">{{ item.category }}</span>
									<span :class="`status-badge ${item.assigned ? 'assigned' : 'available'}`">
										{{ item.assigned ? 'Zugewiesen' : 'Verfügbar' }}
									</span>
								</div>
								<p class="specifications">{{ item.specifications }}</p>
								<div class="item-meta">
									<span class="item-id">ID: {{ item.id }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Add Hardware Modal -->
		<div v-if="showAddHardwareForm" class="modal-overlay" @click="closeModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>Neue Hardware hinzufügen</h3>
					<button @click="closeModal" class="close-btn">×</button>
				</div>
				<div class="modal-body">
					<form @submit.prevent="addHardware">
						<div class="form-group">
							<label>Name</label>
							<input v-model="newHardware.name" type="text" required class="form-input">
						</div>
						<div class="form-group">
							<label>Kategorie</label>
							<select v-model="newHardware.category" required class="form-input">
								<option value="">Kategorie wählen</option>
								<option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
							</select>
						</div>
						<div class="form-group">
							<label>Spezifikationen</label>
							<textarea v-model="newHardware.specifications" required class="form-input" rows="3"></textarea>
						</div>
						<div class="form-group">
							<label>
								<input v-model="newHardware.assigned" type="checkbox">
								Bereits zugewiesen
							</label>
						</div>
						<div class="modal-actions">
							<button type="button" @click="closeModal" class="btn-secondary">Abbrechen</button>
							<button type="submit" class="btn-primary">Hardware hinzufügen</button>
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

const emit = defineEmits(['go-back']);

const searchQuery = ref('');
const selectedCategory = ref('');
const selectedStatus = ref('');
const searchResults = ref(null);
const searchTimeout = ref(null);

const hardwareItems = ref([]);
const categories = ref([]);
const expandedCategories = ref(new Set(['Laptop', 'Monitor'])); // Default expanded

const showAddHardwareForm = ref(false);
const newHardware = ref({
	name: '',
	category: '',
	specifications: '',
	assigned: false
});

const loadHardware = async () => {
	try {
		const response = await fetch('/api/hardware');
		if (response.ok) {
			const data = await response.json();
			hardwareItems.value = data.hardware || [];
		}
	} catch (error) {
		console.error('Fehler beim Laden der Hardware:', error);
	}
};

const loadCategories = async () => {
	try {
		const response = await fetch('/api/hardware/categories');
		if (response.ok) {
			const data = await response.json();
			categories.value = data.categories || [];
		}
	} catch (error) {
		console.error('Fehler beim Laden der Kategorien:', error);
	}
};

const filteredCategories = computed(() => {
	let items = [...hardwareItems.value];
	
	if (selectedCategory.value) {
		items = items.filter(item => item.category === selectedCategory.value);
	}
	
	if (selectedStatus.value) {
		if (selectedStatus.value === 'assigned') {
			items = items.filter(item => item.assigned);
		} else if (selectedStatus.value === 'available') {
			items = items.filter(item => !item.assigned);
		}
	}
	
	// Group by category
	const grouped = {};
	items.forEach(item => {
		if (!grouped[item.category]) {
			grouped[item.category] = [];
		}
		grouped[item.category].push(item);
	});
	
	return Object.keys(grouped).map(category => ({
		name: category,
		items: grouped[category]
	}));
});

const searchHardware = async (query) => {
	if (!query.trim()) {
		searchResults.value = null;
		return;
	}
	
	try {
		const response = await fetch(`/api/hardware/search?query=${encodeURIComponent(query)}`);
		if (response.ok) {
			const data = await response.json();
			searchResults.value = data;
		}
	} catch (error) {
		console.error('Fehler bei der Hardware Suche:', error);
		searchResults.value = { categories: [], total_results: 0 };
	}
};

const onSearchInput = () => {
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
	}
	
	searchTimeout.value = setTimeout(() => {
		searchHardware(searchQuery.value);
	}, 300);
};

const toggleCategory = (categoryName) => {
	if (expandedCategories.value.has(categoryName)) {
		expandedCategories.value.delete(categoryName);
	} else {
		expandedCategories.value.add(categoryName);
	}
};

const editHardware = (item) => {
	console.log('Edit hardware:', item);
	// TODO: Implement edit functionality
};

const deleteHardware = (item) => {
	if (confirm(`Hardware "${item.name}" wirklich löschen?`)) {
		const index = hardwareItems.value.findIndex(h => h.id === item.id);
		if (index > -1) {
			hardwareItems.value.splice(index, 1);
		}
	}
};

const addHardware = () => {
	const hardware = {
		id: Date.now(),
		...newHardware.value
	};
	
	hardwareItems.value.push(hardware);
	closeModal();
};

const closeModal = () => {
	showAddHardwareForm.value = false;
	newHardware.value = {
		name: '',
		category: '',
		specifications: '',
		assigned: false
	};
};

onMounted(async () => {
	await loadHardware();
	await loadCategories();
});
</script>

<style scoped>
.ref {
	max-width: 1400px;
	margin: 0 auto;
}

.controls-section {
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

.search-results,
.categories-display {
	margin-top: 2rem;
}

.search-category,
.category-section {
	margin-bottom: 2rem;
}

.search-category h3 {
	color: var(--color-text);
	margin-bottom: 1rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid var(--color-border);
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	padding: 1rem;
	background: var(--color-background-mute);
	border-radius: 0.5rem;
	cursor: pointer;
}

.category-header h3 {
	margin: 0;
	color: var(--color-text);
}

.toggle-btn {
	background: none !important;
	border: 1px solid var(--color-border) !important;
	color: var(--color-text) !important;
	width: 2rem;
	height: 2rem;
	border-radius: 50%;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	transition: all 0.2s ease;
}

.toggle-btn:hover {
	background: var(--color-button) !important;
	color: var(--color-text) !important;
}

.toggle-btn span.expanded {
	transform: rotate(180deg);
}

.hardware-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 1.5rem;
}

.hardware-card {
	background: var(--color-background);
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
	padding: 1.5rem;
	transition: all 0.2s ease;
}

.hardware-card:hover {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	transform: translateY(-1px);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 1rem;
}

.card-header h4 {
	margin: 0;
	color: var(--color-text);
	font-size: 1.1rem;
	font-weight: 600;
}

.card-actions {
	display: flex;
	gap: 0.5rem;
}

.card-content {
	margin-top: 1rem;
}

.item-info {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1rem;
	flex-wrap: wrap;
}

.category-badge {
	background: var(--color-button);
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

.status-badge.available {
	background: rgba(34, 197, 94, 0.1);
	color: rgb(34, 197, 94);
}

.status-badge.assigned {
	background: rgba(249, 115, 22, 0.1);
	color: rgb(249, 115, 22);
}

.specifications {
	color: var(--color-text-muted);
	margin: 0 0 1rem 0;
	font-size: 0.9rem;
	line-height: 1.4;
}

.item-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 1rem;
	padding-top: 1rem;
	border-top: 1px solid var(--color-border);
}

.item-id {
	font-size: 0.8rem;
	color: var(--color-text-muted);
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

.no-results {
	text-align: center;
	padding: 3rem;
	color: var(--color-text-muted);
	font-style: italic;
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
	.hardware-grid {
		grid-template-columns: 1fr;
	}
	
	.filter-controls {
		flex-direction: column;
		align-items: stretch;
	}
	
	.category-header {
		padding: 0.75rem;
	}
	
	.hardware-card {
		padding: 1rem;
	}
}
</style>