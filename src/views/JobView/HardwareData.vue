<template>
<div>
	<div v-if="juStore.ju.refprofil && juStore.ju.refprofil.length > 0" class="ref">
		<h3>Ausgewähltes Referenzprofil:</h3>
		<ul class="list-group">
			<li v-for="profil in juStore.ju.refprofil" :key="profil.id" class="list-group-item selected">
				{{ profil.name }}
			</li>
		</ul>
		<hr class="shadow-line" />
		<h2>Hardware</h2>
		<div v-if="hardwareItems.length > 0">
			<p>Durch Profil zugewiesene Hardware:</p>
			<div class="hardware-grid">
				<div v-for="item in hardwareItems" :key="item.id" class="hardware-card">
					<div class="hardware-header">
						<h4>{{ item.name }}</h4>
						<span class="category-badge">{{ item.category }}</span>
					</div>
					<p class="specifications">{{ item.specifications }}</p>
				</div>
			</div>
			<hr class="shadow-line" />
		</div>
		<div v-else-if="loading">
			<p>Hardware wird geladen...</p>
			<hr class="shadow-line" />
		</div>

		
		<div class="hardware-selection">
			<div class="selection-header">
				<h3>Zusätzliche Hardware hinzufügen</h3>
			</div>
			
			<div class="search-section">
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
				
				<div v-if="searchQuery && searchResults !== null" class="search-results-info">
					<span v-if="searchResults.total_results > 0">
						{{ searchResults.total_results }} Hardware-Items gefunden für "{{ searchQuery }}"
					</span>
					<span v-else>
						Keine Hardware gefunden für "{{ searchQuery }}"
					</span>
					<button @click="clearSearch" class="clear-search-btn">Suche löschen</button>
				</div>
			</div>
			
			<div class="category-selection" v-if="!searchQuery">
				<div class="category-buttons">
					<button 
						v-for="category in categories" 
						:key="category"
						@click="selectCategory(category)"
						:class="{ 'active': selectedCategory === category }"
						class="category-button"
					>
						{{ category }}
					</button>
				</div>
			</div>
			
			<div class="hardware-lists">
				<!-- Search Results -->
				<div v-if="searchQuery && searchResults" class="search-results">
					<div v-if="searchResults.categories && searchResults.categories.length > 0">
						<div v-for="category in searchResults.categories" :key="category.category" class="search-category">
							<h4>{{ category.category }}</h4>
							<div class="list-group">
								<div v-for="element in category.items" :key="element.id" class="list-group-item">
									<div class="hardware-info">
										<span class="hardware-name">{{ element.name }}</span>
										<span class="hardware-category">{{ element.category }}</span>
									</div>
									<button @click="addHardwareItem(element)" class="add-button fa">&#10010;</button>
								</div>
							</div>
						</div>
					</div>
					<div v-else class="no-results">
						<p>Keine Hardware gefunden für "{{ searchQuery }}"</p>
					</div>
				</div>
				
				<!-- Category-based display (when not searching) -->
				<div v-else-if="selectedCategory" class="source-list">
					<h4>Verfügbare Hardware - {{ selectedCategory }}</h4>
					<draggable 
						class="list-group" 
						:list="sourceHardwareList" 
						group="hardware" 
						item-key="id"
					>
						<template #item="{ element }">
							<div class="list-group-item">
								<div class="hardware-info">
									<span class="hardware-name">{{ element.name }}</span>
									<span class="hardware-category">{{ element.category }}</span>
								</div>
								<button @click="addHardwareItem(element)" class="add-button fa">&#10010;</button>
							</div>
						</template>
					</draggable>
				</div>
				<div v-else-if="!searchQuery" class="source-list">
					<div style="padding-left: 0.2rem">
						<p>Wähle eine Kategorie aus oder nutze die Suchfunktion</p>
					</div>
				</div>
				
				<div class="target-list">
					<h4>Zusätzlich angeforderte Hardware</h4>
					<div class="target-container">
						<draggable 
							class="list-group-full target-list" 
							:list="additionalHardwareList" 
							group="hardware" 
							@change="onHardwareListChange" 
							@add="onHardwareAdd" 
							item-key="id"
						>
							<template #item="{ element, index }">
								<div class="list-group-item">
									<div class="hardware-info">
										<span class="hardware-name">{{ element.name }}</span>
										<span class="hardware-category">{{ element.category }}</span>
									</div>
									<button @click="removeHardware(index)" class="delete-button fa">&#xf014;</button>
								</div>
							</template>
						</draggable>
						<div v-show="additionalHardwareList.length === 0" class="placeholder-container">
							<span class="placeholder-text">Hardware hier ablegen</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<hr class="shadow-line" />
		<div class="navigation-buttons">
			<button @click="$emit('go-back')" class="back-button">
				Referenzprofil
			</button>
			<button @click="$emit('show-software')" class="next-button">
				Software
			</button>
		</div>
		<hr class="shadow-line" />
	</div>
	<div v-else>
		<p>Keine Referenzprofile gespeichert</p>
	</div>
</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useJuStore } from '@/stores/ju'
import { useUserStore } from '@/stores/userStore'

import { useStoreCookieSync } from '@/components/useStoreCookieSync'

import draggable from 'vuedraggable';

const juStore = useJuStore();

const ju = computed(() => juStore.ju);

const emit = defineEmits(['go-back', 'show-software']);

const hardwareItems = ref([]);
const loading = ref(false);

const sourceHardwareList = ref([]);
const additionalHardwareList = ref([]);
const categories = ref([]);
const selectedCategory = ref(null);
const searchQuery = ref('');
const searchResults = ref(null);
const searchTimeout = ref(null);

const fetchHardwareForProfile = async (profileName: string) => {
	loading.value = true;
	try {
		const response = await fetch(`/api/hardware/profile?profile=${encodeURIComponent(profileName)}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		hardwareItems.value = data.hardware || [];
	} catch (error) {
		console.error('Fehler beim Laden der Hardware:', error);
		hardwareItems.value = [];
	} finally {
		loading.value = false;
	}
};

watch(() => juStore.ju.refprofil, (newProfiles) => {
	if (newProfiles && newProfiles.length > 0) {
		const profileName = newProfiles[0].name;
		fetchHardwareForProfile(profileName);
	} else {
		hardwareItems.value = [];
	}
}, { immediate: true });

const fetchCategories = async () => {
	try {
		const response = await fetch('/api/hardware/categories');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		categories.value = data.categories || [];
	} catch (error) {
		console.error('Fehler beim Laden der Kategorien:', error);
		categories.value = [];
	}
};

const fetchHardwareByCategory = async (category: string) => {
	try {
		const response = await fetch(`/api/hardware/category?category=${encodeURIComponent(category)}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		sourceHardwareList.value = data.hardware || [];
	} catch (error) {
		console.error('Fehler beim Laden der Hardware für Kategorie:', error);
		sourceHardwareList.value = [];
	}
};

const selectCategory = async (category: string) => {
	selectedCategory.value = category;
	await fetchHardwareByCategory(category);
	
	removeSelectedItemsFromSource();
};

const removeSelectedItemsFromSource = () => {
	additionalHardwareList.value.forEach(hardwareItem => {
		const index = sourceHardwareList.value.findIndex(item => item.id === hardwareItem.id);
		if (index > -1) {
			sourceHardwareList.value.splice(index, 1);
		}
	});
};

const onHardwareListChange = (event: any) => {
	if (event.added) {
		console.log(`Hardware hinzugefügt: ${event.added.element.name}`);
	}
	if (event.removed) {
		console.log(`Hardware entfernt: ${event.removed.element.name}`);
	}
	if (!juStore.ju.additionalHardware) {
		juStore.ju.additionalHardware = [];
	}
	juStore.ju.additionalHardware = [...additionalHardwareList.value];
	saveAdditionalHardwareToCookie(additionalHardwareList.value);
};

const onHardwareAdd = (event: any) => {
	juStore.ju.additionalHardware = [...additionalHardwareList.value];
	saveAdditionalHardwareToCookie(additionalHardwareList.value);
};

const removeHardware = (index: number) => {
	if (index > -1) {
		const [removedItem] = additionalHardwareList.value.splice(index, 1);
		sourceHardwareList.value.push(removedItem);
		juStore.ju.additionalHardware = [...additionalHardwareList.value];
		saveAdditionalHardwareToCookie(additionalHardwareList.value);
	}
};

const addHardwareItem = (item: any) => {
	const sourceIndex = sourceHardwareList.value.findIndex(sourceItem => sourceItem.id === item.id);
	if (sourceIndex > -1) {
		const [movedItem] = sourceHardwareList.value.splice(sourceIndex, 1);
		additionalHardwareList.value.push(movedItem);
		
		if (!juStore.ju.additionalHardware) {
			juStore.ju.additionalHardware = [];
		}
		juStore.ju.additionalHardware = [...additionalHardwareList.value];
		saveAdditionalHardwareToCookie(additionalHardwareList.value);
		
		console.log(`Hardware hinzugefügt: ${item.name}`);
	}
};

const saveAdditionalHardwareToCookie = (hardware) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
	const cookieValue = JSON.stringify(hardware);
	document.cookie = `additionalHardware=${encodeURIComponent(cookieValue)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
	console.log('Additional Hardware Cookie gespeichert:', hardware);
};

const loadAdditionalHardwareFromCookie = () => {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'additionalHardware') {
			try {
				const hardware = JSON.parse(decodeURIComponent(value));
				console.log('Additional Hardware Cookie geladen:', hardware);
				return hardware;
			} catch (e) {
				console.error('Fehler beim Laden des Additional Hardware Cookies:', e);
				return [];
			}
		}
	}
	return [];
};

const initializeSavedHardware = () => {
	const savedAdditionalHardware = loadAdditionalHardwareFromCookie();
	if (savedAdditionalHardware && savedAdditionalHardware.length > 0) {
		console.log('Initializing saved hardware:', savedAdditionalHardware);
		additionalHardwareList.value = [];
		additionalHardwareList.value.push(...savedAdditionalHardware);
		
		if (!juStore.ju.additionalHardware) {
			juStore.ju.additionalHardware = [];
		}
		juStore.ju.additionalHardware = [...savedAdditionalHardware];
		
		console.log('Additional hardware list after init:', additionalHardwareList.value);
		return true;
	}
	return false;
};

const searchHardware = async (query) => {
	if (!query.trim()) {
		searchResults.value = null;
		return;
	}
	
	try {
		const response = await fetch(`/api/hardware/search?query=${encodeURIComponent(query)}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		searchResults.value = data;
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

const clearSearch = () => {
	searchQuery.value = '';
	searchResults.value = null;
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
	}
};

onMounted(async () => {
	initializeSavedHardware();
	
	if (juStore.ju.refprofil && juStore.ju.refprofil.length > 0) {
		const profileName = juStore.ju.refprofil[0].name;
		fetchHardwareForProfile(profileName);
	}
	
	await fetchCategories();
	
	setTimeout(() => {
		if (additionalHardwareList.value.length === 0) {
			initializeSavedHardware();
		}
	}, 200);
});
</script>

<style scoped>
@media (min-width: 1025px) {
	.ref {
		width: 66%;
	}
}

.list-group-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 1px solid var(--color-button);
	border-radius: 0.2rem;
	margin: 0.2rem;
	padding: 0.4rem;
	transition: transform 0.2s ease;
}

.list-group-item.selected {
	background-color: transparent !important;
	cursor: default;
}

.list-group {
	user-select: none;
	width: 100%;
	padding: 0;
	color: var(--color-text);
}

@media (min-width: 1025px) {
	.list-group {
		user-select: none;
		width: 100%;
	}
}

.hardware-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1rem;
	margin-top: 1rem;
}

.hardware-card {
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
	padding: 1rem;
	background: var(--color-background);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hardware-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hardware-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 0.5rem;
}

.hardware-header h4 {
	margin: 0;
	color: var(--color-text);
	font-size: 1.1rem;
	font-weight: 600;
}

.category-badge {
	background: var(--color-button);
	color: var(--color-text);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 500;
}

.specifications {
	color: var(--color-text-muted);
	margin: 0.5rem 0;
	font-size: 0.9rem;
	line-height: 1.4;
}

.status {
	font-weight: 500;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.85rem;
	text-align: center;
}

.status.assigned {
	background: rgba(34, 197, 94, 0.1);
	color: rgb(34, 197, 94);
	border: 1px solid rgba(34, 197, 94, 0.2);
}

.status:not(.assigned) {
	background: rgba(239, 68, 68, 0.1);
	color: rgb(239, 68, 68);
	border: 1px solid rgba(239, 68, 68, 0.2);
}

.hardware-selection {
	margin-top: 2rem;
}

.selection-header {
	margin-bottom: 1rem;
}

.selection-header h3 {
	margin: 0 0 0.5rem 0;
	color: var(--color-text);
}

.selection-header p {
	margin: 0;
	color: var(--color-text-muted);
	font-size: 0.9rem;
}

.category-selection {
	margin-bottom: 2rem;
}

.category-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.category-button {
	padding: 0.5rem 1rem !important;
	font-size: 0.9rem !important;
	border: 1px solid var(--color-button) !important;
	background: var(--color-background) !important;
	color: var(--color-text) !important;
	border-radius: 0.25rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.category-button:hover {
	background: var(--color-button-hover) !important;
	color: var(--color-text-inverted) !important;
}

.category-button.active {
	background: var(--color-button) !important;
	color: var(--color-text) !important;
	font-weight: 500;
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
	box-shadow: 0 0 0 3px rgba(var(--color-button-rgb, 59, 130, 246), 0.1);
}

.search-input::placeholder {
	color: var(--color-text-muted);
}

.search-icon {
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	color: var(--color-text-muted);
	pointer-events: none;
}

.search-results-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem;
	background: var(--color-background-soft);
	border-radius: 0.25rem;
	font-size: 0.9rem;
	color: var(--color-text-muted);
}

.clear-search-btn {
	background: none !important;
	border: 1px solid var(--color-border) !important;
	color: var(--color-text-muted) !important;
	padding: 0.25rem 0.5rem !important;
	border-radius: 0.25rem;
	font-size: 0.8rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.clear-search-btn:hover {
	background: var(--color-background-mute) !important;
	border-color: var(--color-button) !important;
	color: var(--color-text) !important;
}

.search-results {
	margin-bottom: 2rem;
}

.search-category {
	margin-bottom: 1.5rem;
}

.search-category h4 {
	margin: 0 0 0.5rem 0;
	color: var(--color-text);
	font-size: 1rem;
	font-weight: 600;
}

.no-results {
	text-align: center;
	padding: 2rem;
	color: var(--color-text-muted);
	font-style: italic;
}

.hardware-lists {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 2rem;
	margin-top: 1rem;
}

@media (max-width: 768px) {
	.hardware-lists {
		grid-template-columns: 1fr;
		gap: 1rem;
	}
}

.add-button,
.delete-button {
	background: transparent	!important;
}

.source-list h4,
.target-list h4 {
	margin: 0 0 1rem 0;
	color: var(--color-text);
	font-size: 1rem;
	font-weight: 600;
}

.target-container {
	min-height: 10rem;
	border: 2px dashed var(--color-border);
	border-radius: 0.5rem;
	padding: 1rem;
	position: relative;
}

.list-group-full.target-list {
	min-height: 8rem;
}

.hardware-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
}

.hardware-name {
	font-weight: 500;
	color: var(--color-text);
	font-size: 0.9rem;
}

.list-group-item:hover .hardware-name {
	color: var(--color-text-inverted);
}

.hardware-category {
	font-size: 0.75rem;
	color: var(--color-text-muted);
	background: var(--color-button);
	padding: 0.125rem 0.375rem;
	border-radius: 0.25rem;
	width: fit-content;
}

.list-group-item {
	cursor: grab;
	user-select: none;
	transition: transform 0.2s ease;
}

.list-group-item:active {
	cursor: grabbing;
}

.list-group-item:hover {
	background-color: var(--color-button-hover);
	transform: scale(1.01);
	z-index: 10;
}

.delete-button {
	background: none !important;
	border: none;
	color: var(--color-text-muted);
	cursor: pointer;
	padding: 0.25rem;
	border-radius: 0.25rem;
	transition: color 0.2s ease;
}

.delete-button:hover {
	color: rgb(239, 68, 68);
}

.add-button {
	cursor: pointer;
	padding: 0.25rem 0.5rem;
	font-size: 1rem;
	font-weight: bold;	
	transition: all 0.2s ease;
	min-width: 2rem;
	display: flex;
	align-items: center;
	justify-content: center;
}

.add-button:hover {
	transform: scale(1.05);
}

.placeholder-container {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: var(--color-text-muted);
	pointer-events: none; 
	text-align: center;
	font-size: 0.9rem;
}

.placeholder-container .placeholder-text {
	padding: 0.5rem 1rem;
	background: var(--color-background);
	border-radius: 0.25rem;
}

.navigation-buttons {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
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