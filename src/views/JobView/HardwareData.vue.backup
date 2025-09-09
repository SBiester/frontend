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

		<!-- <div v-else>
			<p>Keine Hardware für dieses Profil gefunden.</p>
		</div> -->
		
		<div class="hardware-selection">
			<div class="selection-header">
				<h3>Zusätzliche Hardware hinzufügen</h3>
			</div>
			
			<div class="category-selection">
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
				<div class="source-list" v-if="selectedCategory">
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
				<div class="source-list" v-else>
					<div style="padding-left: 0.2rem">
						<p>Wähle eine Kategorie aus, um verfügbare Hardware anzuzeigen</p>
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

// API Funktion zum Laden der Hardware
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

// Watch für Änderungen am Referenzprofil
watch(() => juStore.ju.refprofil, (newProfiles) => {
	if (newProfiles && newProfiles.length > 0) {
		// Verwende das erste ausgewählte Profil
		const profileName = newProfiles[0].name;
		fetchHardwareForProfile(profileName);
	} else {
		hardwareItems.value = [];
	}
}, { immediate: true });

// API Funktion zum Laden der Kategorien
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

// API Funktion zum Laden der Hardware für eine Kategorie
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

// Kategorie-Auswahl
const selectCategory = async (category: string) => {
	selectedCategory.value = category;
	await fetchHardwareByCategory(category);
	
	removeSelectedItemsFromSource();
};

// Hilfsfunktion zum Entfernen bereits ausgewählter Items aus der sourceList
const removeSelectedItemsFromSource = () => {
	additionalHardwareList.value.forEach(hardwareItem => {
		const index = sourceHardwareList.value.findIndex(item => item.id === hardwareItem.id);
		if (index > -1) {
			sourceHardwareList.value.splice(index, 1);
		}
	});
};

// Hardware Drag & Drop Event Handler
const onHardwareListChange = (event: any) => {
	if (event.added) {
		console.log(`Hardware hinzugefügt: ${event.added.element.name}`);
	}
	if (event.removed) {
		console.log(`Hardware entfernt: ${event.removed.element.name}`);
	}
	// Speichere zusätzliche Hardware im Store
	if (!juStore.ju.additionalHardware) {
		juStore.ju.additionalHardware = [];
	}
	juStore.ju.additionalHardware = [...additionalHardwareList.value];
	saveAdditionalHardwareToCookie(additionalHardwareList.value);
};

const onHardwareAdd = (event: any) => {
	// Entferne Item aus der sourceList wenn es zur targetList hinzugefügt wird
	juStore.ju.additionalHardware = [...additionalHardwareList.value];
	saveAdditionalHardwareToCookie(additionalHardwareList.value);
};

const removeHardware = (index: number) => {
	if (index > -1) {
		const [removedItem] = additionalHardwareList.value.splice(index, 1);
		sourceHardwareList.value.push(removedItem);
		// Update Store
		juStore.ju.additionalHardware = [...additionalHardwareList.value];
		saveAdditionalHardwareToCookie(additionalHardwareList.value);
	}
};

const addHardwareItem = (item: any) => {
	// Finde Item in sourceList und entferne es
	const sourceIndex = sourceHardwareList.value.findIndex(sourceItem => sourceItem.id === item.id);
	if (sourceIndex > -1) {
		const [movedItem] = sourceHardwareList.value.splice(sourceIndex, 1);
		additionalHardwareList.value.push(movedItem);
		
		// Update Store und Cookie
		if (!juStore.ju.additionalHardware) {
			juStore.ju.additionalHardware = [];
		}
		juStore.ju.additionalHardware = [...additionalHardwareList.value];
		saveAdditionalHardwareToCookie(additionalHardwareList.value);
		
		console.log(`Hardware hinzugefügt: ${item.name}`);
	}
};

// Cookie-System für zusätzliche Hardware
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

// Initialize saved hardware from cookie
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

onMounted(async () => {
	// Initialize saved hardware first
	initializeSavedHardware();
	
	// Lade Hardware wenn bereits ein Profil ausgewählt ist
	if (juStore.ju.refprofil && juStore.ju.refprofil.length > 0) {
		const profileName = juStore.ju.refprofil[0].name;
		fetchHardwareForProfile(profileName);
	}
	
	// Lade Kategorien für Auswahl
	await fetchCategories();
	
	// Try again after a short delay in case store sync is needed
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

/* Hardware Styles */
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

/* Hardware Selection Styles */
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

/* Category Selection Styles */
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

/* Navigation Buttons - BaseData Design */
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