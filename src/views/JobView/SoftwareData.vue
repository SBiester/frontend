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
		<h2>Software</h2>
		<div v-if="softwareItems.length > 0">
			<p>Durch Profil zugewiesene Software:</p>
			<div class="software-grid">
				<div v-for="item in softwareItems" :key="item.id" class="software-card">
					<div class="software-header">
						<h4>{{ item.name }}</h4>
						<span class="category-badge">{{ item.category }}</span>
					</div>
					<p class="description">{{ item.description }}</p>
					<div class="version-info" v-if="item.version">
						Version: {{ item.version }}
					</div>
				</div>
			</div>
			<hr class="shadow-line" />
		</div>
		<div v-else-if="loading">
			<p>Software wird geladen...</p>
			<hr class="shadow-line" />
		</div>
		<!-- <div v-else>
			<p>Keine Software für dieses Profil gefunden.</p>
		</div> -->
		
		<div class="software-selection">
			<div class="selection-header">
				<h3>Zusätzliche Software hinzufügen</h3>
			</div>
			
			<div class="manufacturer-selection">
				<div class="sap-section">
					<h4>SAP Software</h4>
					<p>Zusätzlich kannst du SAP-Profile und -Berechtigungen auswählen</p>
					<button 
						@click="selectSap"
						:class="{ 'active': sapSelected }"
						class="sap-button"
					>
						<span class="sap-icon">
							<p class="fa">⚙</p>
						</span>
						<span class="sap-text">
							<strong>{{ sapSelected ? 'SAP Profile ausgewählt' : 'SAP Profile auswählen' }}</strong>
							<small>{{ sapSelected ? 'Konfiguriere Profile im nächsten Schritt' : 'Rollenbasierte Berechtigungen' }}</small>
						</span>
						<span v-if="sapSelected" class="sap-checkmark">✓</span>
					</button>
				</div>
				
				<div class="standard-software-section">
					<h4>Standard Software</h4>
					<p>Wähle zusätzliche Software von verschiedenen Herstellern</p>
					<div class="manufacturer-buttons">
						<button 
							v-for="manufacturer in manufacturers" 
							:key="manufacturer"
							@click="selectManufacturer(manufacturer)"
							:class="{ 'active': selectedManufacturer === manufacturer }"
							class="manufacturer-button"
						>
							{{ manufacturer }}
						</button>
					</div>
				</div>
			</div>
			
			<div class="software-lists">
				<div class="source-list" v-if="selectedManufacturer">
					<h4>Verfügbare Software - {{ selectedManufacturer }}</h4>
					<draggable 
						class="list-group" 
						:list="sourceSoftwareList" 
						group="software" 
						item-key="id"
					>
						<template #item="{ element }">
							<div class="list-group-item">
								<div class="software-info">
									<span class="software-name">{{ element.name }}</span>
									<span class="software-category">{{ element.category }}</span>
									<span class="software-version" v-if="element.version">v{{ element.version }}</span>
								</div>
								<button @click="addSoftwareItem(element)" class="add-button fa">&#10010;</button>
							</div>
						</template>
					</draggable>
				</div>
				<div class="source-list" v-else>
					<div style="padding-left: 0.2rem">
						<p>Wähle einen Hersteller aus, um verfügbare Software anzuzeigen</p>
					</div>
				</div>
				
				<div class="target-list">
					<h4>Zusätzlich angeforderte Software</h4>
					<div class="target-container">
						<draggable 
							class="list-group-full target-list" 
							:list="additionalSoftwareList" 
							group="software" 
							@change="onSoftwareListChange" 
							@add="onSoftwareAdd" 
							item-key="id"
						>
							<template #item="{ element, index }">
								<div class="list-group-item">
									<div class="software-info">
										<span class="software-name">{{ element.name }}</span>
										<span class="software-category">{{ element.category }}</span>
										<span class="software-version" v-if="element.version">v{{ element.version }}</span>
									</div>
									<button @click="removeSoftware(index)" class="delete-button fa">&#xf014;</button>
								</div>
							</template>
						</draggable>
						<div v-show="additionalSoftwareList.length === 0" class="placeholder-container">
							<span class="placeholder-text">Software hier ablegen</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<hr class="shadow-line" />
		<div class="navigation-buttons">
			<button @click="$emit('go-back')" class="back-button">
				Hardware
			</button>
			<button @click="handleNextStep" class="next-button">
				{{ sapSelected ? 'SAP Profile' : 'Optionale Services' }}
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
import { onMounted, ref, watch, computed, nextTick } from 'vue';
import { storeToRefs } from 'pinia';

import { useJuStore } from '@/stores/ju'
import { useUserStore } from '@/stores/userStore'

import { useStoreCookieSync } from '@/components/useStoreCookieSync'

import draggable from 'vuedraggable';

const juStore = useJuStore();
// Sichere Referenz-Erstellung ohne storeToRefs
const ju = computed(() => juStore.ju);

const emit = defineEmits(['go-back', 'show-options', 'show-sap-profiles']);

// Software State
const softwareItems = ref([]);
const loading = ref(false);

// Additional Software Selection State
const sourceSoftwareList = ref([]);
const additionalSoftwareList = ref([]);
const manufacturers = ref([]);
const selectedManufacturer = ref(null);
const sapSelected = ref(false);

// API Funktion zum Laden der Software
const fetchSoftwareForProfile = async (profileName: string) => {
	loading.value = true;
	try {
		const response = await fetch(`/api/software/profile?profile=${encodeURIComponent(profileName)}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		softwareItems.value = data.software || [];
	} catch (error) {
		console.error('Fehler beim Laden der Software:', error);
		softwareItems.value = [];
	} finally {
		loading.value = false;
	}
};

// Watch für Änderungen am Referenzprofil
watch(() => juStore.ju.refprofil, (newProfiles) => {
	if (newProfiles && newProfiles.length > 0) {
		// Verwende das erste ausgewählte Profil
		const profileName = newProfiles[0].name;
		fetchSoftwareForProfile(profileName);
	} else {
		softwareItems.value = [];
	}
}, { immediate: true });

// API Funktion zum Laden der Hersteller
const fetchManufacturers = async () => {
	try {
		const response = await fetch('/api/software/manufacturers');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		manufacturers.value = data.manufacturers || [];
	} catch (error) {
		console.error('Fehler beim Laden der Hersteller:', error);
		manufacturers.value = [];
	}
};

// API Funktion zum Laden der Software für einen Hersteller
const fetchSoftwareByManufacturer = async (manufacturer: string) => {
	try {
		const response = await fetch(`/api/software/manufacturer?manufacturer=${encodeURIComponent(manufacturer)}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		sourceSoftwareList.value = data.software || [];
	} catch (error) {
		console.error('Fehler beim Laden der Software für Hersteller:', error);
		sourceSoftwareList.value = [];
	}
};

// SAP-Auswahl (Toggle-Button)
const selectSap = () => {
	sapSelected.value = !sapSelected.value;
	// Speichere SAP-Auswahl im Store
	juStore.ju.selectedSap = sapSelected.value;
	saveSapSelectionToCookie();
	console.log('SAP toggled:', sapSelected.value);
};

// Hersteller-Auswahl (unabhängig von SAP)
const selectManufacturer = async (manufacturer: string) => {
	selectedManufacturer.value = manufacturer;
	
	await fetchSoftwareByManufacturer(manufacturer);
	// Entferne bereits ausgewählte Software aus der Liste
	removeSelectedItemsFromSource();
};

// Hilfsfunktion zum Entfernen bereits ausgewählter Items aus der sourceList
const removeSelectedItemsFromSource = () => {
	additionalSoftwareList.value.forEach(softwareItem => {
		const index = sourceSoftwareList.value.findIndex(item => item.id === softwareItem.id);
		if (index > -1) {
			sourceSoftwareList.value.splice(index, 1);
		}
	});
};

// Software Drag & Drop Event Handler
const onSoftwareListChange = (event: any) => {
	if (event.added) {
		console.log(`Software hinzugefügt: ${event.added.element.name}`);
	}
	if (event.removed) {
		console.log(`Software entfernt: ${event.removed.element.name}`);
	}
	// Speichere zusätzliche Software im Store
	if (!juStore.ju.additionalSoftware) {
		juStore.ju.additionalSoftware = [];
	}
	juStore.ju.additionalSoftware = [...additionalSoftwareList.value];
	saveAdditionalSoftwareToCookie(additionalSoftwareList.value);
};

const onSoftwareAdd = (event: any) => {
	// Entferne Item aus der sourceList wenn es zur targetList hinzugefügt wird
	juStore.ju.additionalSoftware = [...additionalSoftwareList.value];
	saveAdditionalSoftwareToCookie(additionalSoftwareList.value);
};

const removeSoftware = (index: number) => {
	if (index > -1) {
		const [removedItem] = additionalSoftwareList.value.splice(index, 1);
		sourceSoftwareList.value.push(removedItem);
		// Update Store
		juStore.ju.additionalSoftware = [...additionalSoftwareList.value];
		saveAdditionalSoftwareToCookie(additionalSoftwareList.value);
	}
};

const addSoftwareItem = (item: any) => {
	// Finde Item in sourceList und entferne es
	const sourceIndex = sourceSoftwareList.value.findIndex(sourceItem => sourceItem.id === item.id);
	if (sourceIndex > -1) {
		const [movedItem] = sourceSoftwareList.value.splice(sourceIndex, 1);
		additionalSoftwareList.value.push(movedItem);
		
		// Update Store und Cookie
		if (!juStore.ju.additionalSoftware) {
			juStore.ju.additionalSoftware = [];
		}
		juStore.ju.additionalSoftware = [...additionalSoftwareList.value];
		saveAdditionalSoftwareToCookie(additionalSoftwareList.value);
		
		console.log(`Software hinzugefügt: ${item.name}`);
	}
};

// Cookie-System für zusätzliche Software
const saveAdditionalSoftwareToCookie = (software) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
	const cookieValue = JSON.stringify(software);
	document.cookie = `additionalSoftware=${encodeURIComponent(cookieValue)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
	console.log('Additional Software Cookie gespeichert:', software);
};

const loadAdditionalSoftwareFromCookie = () => {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'additionalSoftware') {
			try {
				const software = JSON.parse(decodeURIComponent(value));
				console.log('Additional Software Cookie geladen:', software);
				return software;
			} catch (e) {
				console.error('Fehler beim Laden des Additional Software Cookies:', e);
				return [];
			}
		}
	}
	return [];
};

// Cookie-System für SAP-Auswahl
const saveSapSelectionToCookie = () => {
	const expires = new Date();
	expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
	document.cookie = `selectedSap=${sapSelected.value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
	console.log('SAP Selection Cookie gespeichert:', sapSelected.value);
};

const loadSapSelectionFromCookie = () => {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'selectedSap') {
			return value === 'true';
		}
	}
	return false;
};

// Navigation Handler
const handleNextStep = () => {
	if (sapSelected.value) {
		emit('show-sap-profiles');
	} else {
		emit('show-options');
	}
};

// Initialize saved software from cookie
const initializeSavedSoftware = () => {
	const savedAdditionalSoftware = loadAdditionalSoftwareFromCookie();
	if (savedAdditionalSoftware && savedAdditionalSoftware.length > 0) {
		console.log('Initializing saved software:', savedAdditionalSoftware);
		
		// Clear and set the list
		additionalSoftwareList.value = [];
		additionalSoftwareList.value.push(...savedAdditionalSoftware);
		
		// Update store
		if (!juStore.ju.additionalSoftware) {
			juStore.ju.additionalSoftware = [];
		}
		juStore.ju.additionalSoftware = [...savedAdditionalSoftware];
		
		console.log('Additional software list after init:', additionalSoftwareList.value);
		return true;
	}
	return false;
};

// Watch for store changes and sync with local state
watch(() => juStore.ju.additionalSoftware, (newSoftware) => {
	if (newSoftware && newSoftware.length > 0 && additionalSoftwareList.value.length === 0) {
		additionalSoftwareList.value = [...newSoftware];
		console.log('Synced from store to local list:', additionalSoftwareList.value);
	}
}, { immediate: true, deep: true });

onMounted(async () => {
	// Initialize saved software first
	initializeSavedSoftware();
	
	// Initialize SAP selection from cookie
	const savedSapSelection = loadSapSelectionFromCookie();
	if (savedSapSelection) {
		sapSelected.value = true;
		juStore.ju.selectedSap = true;
		selectedManufacturer.value = 'SAP';
	}
	
	// Lade Software wenn bereits ein Profil ausgewählt ist
	if (juStore.ju.refprofil && juStore.ju.refprofil.length > 0) {
		const profileName = juStore.ju.refprofil[0].name;
		fetchSoftwareForProfile(profileName);
	}
	
	// Lade Hersteller für Auswahl (SAP wird automatisch entfernt falls vorhanden)
	await fetchManufacturers();
	// Entferne SAP aus der Herstellerliste da es einen separaten Button hat
	manufacturers.value = manufacturers.value.filter(manufacturer => manufacturer !== 'SAP');
	
	// Try again after a short delay in case store sync is needed
	setTimeout(() => {
		if (additionalSoftwareList.value.length === 0) {
			initializeSavedSoftware();
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

/* Software Styles */
.software-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1rem;
	margin-top: 1rem;
}

.software-card {
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
	padding: 1rem;
	background: var(--color-background);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.software-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.software-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 0.5rem;
}

.software-header h4 {
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

.description {
	color: var(--color-text-muted);
	margin: 0.5rem 0;
	font-size: 0.9rem;
	line-height: 1.4;
}

.version-info {
	color: var(--color-text-muted);
	font-size: 0.8rem;
	font-style: italic;
	margin-top: 0.5rem;
}

/* Software Selection Styles */
.software-selection {
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

/* Manufacturer Selection Styles */
.manufacturer-selection {
	margin-bottom: 2rem;
}

.no-manufacturer-selected {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 10rem;
	border: 2px dashed var(--color-border);
	border-radius: 0.5rem;
	background: var(--color-background);
}

.no-manufacturer-selected p {
	color: var(--color-text-muted);
	font-style: italic;
	margin: 0;
}

.manufacturer-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.manufacturer-button {
	padding: 0.5rem 1rem !important;
	font-size: 0.9rem !important;
	border: 1px solid var(--color-button) !important;
	background: var(--color-background) !important;
	color: var(--color-text) !important;
	border-radius: 0.25rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.manufacturer-button:hover {
	background: var(--color-button-hover) !important;
	color: var(--color-text-inverted) !important;
}

.manufacturer-button.active {
	background: var(--color-button) !important;
	color: var(--color-text) !important;
	font-weight: 500;
}

.software-lists {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 2rem;
	margin-top: 1rem;
}

@media (max-width: 768px) {
	.software-lists {
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

.software-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
}

.software-name {
	font-weight: 500;
	color: var(--color-text);
	font-size: 0.9rem;
}

.list-group-item:hover .software-name {
	color: var(--color-text-inverted);
}

.software-category {
	font-size: 0.75rem;
	color: var(--color-text-muted);
	background: var(--color-button);
	padding: 0.125rem 0.375rem;
	border-radius: 0.25rem;
	width: fit-content;
}

.software-version {
	font-size: 0.7rem;
	color: var(--color-text-muted);
	font-style: italic;
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

/* SAP Notice Styles */
.sap-notice h4 {
	margin: 0 0 1rem 0;
	color: var(--color-text);
	font-size: 1rem;
	font-weight: 600;
}

.sap-info-card {
	border: 1px solid var(--color-button);
	border-radius: 0.5rem;
	padding: 1.5rem;
	background: var(--color-background-soft);
	margin-top: 1rem;
}

.sap-info-card h5 {
	margin: 0 0 0.75rem 0;
	color: var(--color-heading);
	font-size: 1.1rem;
	font-weight: 600;
}

.sap-info-card p {
	margin: 0 0 1rem 0;
	color: var(--color-text);
	line-height: 1.5;
	font-size: 0.95rem;
}

.sap-features {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.feature-badge {
	background: var(--color-button);
	color: var(--color-text);
	padding: 0.375rem 0.75rem;
	border-radius: 0.25rem;
	font-size: 0.85rem;
	font-weight: 500;
}

/* SAP Section Styles */
.sap-section {
	margin-bottom: 2rem;
	padding: 2rem;
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
	background: var(--color-background-mute);
}

.sap-section h4 {
	margin: 0 0 0.5rem 0;
	color: var(--color-heading);
	font-size: 1.25rem;
	font-weight: 600;
}

.sap-section p {
	margin: 0 0 1.5rem 0;
	color: var(--color-text-muted);
	font-size: 0.95rem;
}

/* Standard Software Section Styles */
.standard-software-section {
	margin-bottom: 2rem;
	padding: 2rem;
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
	background: var(--color-background-mute);
}

.standard-software-section h4 {
	margin: 0 0 0.5rem 0;
	color: var(--color-heading);
	font-size: 1.25rem;
	font-weight: 600;
}

.standard-software-section p {
	margin: 0 0 1.5rem 0;
	color: var(--color-text-muted);
	font-size: 0.95rem;
}

.sap-button {
	display: flex !important;
	align-items: center !important;
	gap: 1rem !important;
	width: 100% !important;
	padding: 1.5rem !important;
	border: 2px solid var(--color-border) !important;
	border-radius: 0.5rem !important;
	background: var(--color-background) !important;
	color: var(--color-text) !important;
	font-size: 1rem !important;
	cursor: pointer !important;
	transition: all 0.3s ease !important;
	text-align: left !important;
	position: relative !important;
}

.sap-button:hover {
	border-color: var(--color-button) !important;
	background: rgba(var(--color-button-rgb), 0.05) !important;
	transform: translateY(-2px) !important;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.sap-button.active {
	border-color: var(--color-button) !important;
	background: rgba(var(--color-button-rgb), 0.1) !important;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.sap-icon {
	color: white;
	font-size: 2rem;
	width: 3rem;
	height: 3rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--color-button);
	border-radius: 50%;
	flex-shrink: 0;
}

.sap-icon .fa {
	margin: 0;
	font-size: 2rem;
	color: white;
}

.sap-button.active .sap-icon {
	background: var(--color-button-hover);
	transform: scale(1.1);
}

.sap-text {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
}

.sap-text strong {
	color: var(--color-text);
	font-size: 1.1rem;
}

.sap-text small {
	color: var(--color-text-muted);
	font-size: 0.85rem;
}

.sap-checkmark {
	font-size: 1.5rem;
	color: var(--color-button);
	font-weight: bold;
	position: absolute;
	right: 1.5rem;
	top: 50%;
	transform: translateY(-50%);
	opacity: 0.9;
}
</style>