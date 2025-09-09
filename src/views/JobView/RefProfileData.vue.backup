<template>
<div class="page-layout">
	<hr class="shadow-line"/>
	<div class="ref">
		<div class="buttons-row">
			<p>Referenzprofile für Bereich: {{ selectedBereich || 'Alle' }}</p>
			<select v-model="selectedBereich" @change="filterByBereich" class="bereich-select">
				<option value="">Alle Bereiche</option>
				<option value="IT">IT</option>
				<option value="TK">TK</option>
				<option value="PM">PM</option>
				<option value="MK">MK</option>
			</select>
		</div>
		<hr class="shadow-line"/>
		<draggable class="list-group" :list="sourceList" group="items" item-key="id">
		<template #item="{ element }">
			<div class="list-group-item">
			    <div class="profile-info">
			    	<span class="profile-name">{{ element.name }}</span>
			    </div>
			    <button @click="addProfileItem(element)" class="add-button fa">&#10010;</button>
			</div>
		</template>
    </draggable>
	<hr class="shadow-line" />
	<div class="refcontainer">
    	<draggable class="list-group-full target-list" :list="targetList" group="items" @change="onListChange" @add="onAdd" item-key="id">
			<template #item="{ element, index }">
				<div class="list-group-item">
					<div class="profile-info">
						<span class="profile-name">{{ element.name }}</span>
					</div>
					<button @click="deleteItem(index)" class="delete-button fa">&#xf014;</button>
				</div>
			</template>
    	</draggable>
		<div v-show="targetList.length === 0" class="placeholder-container">
    		<span class="placeholder-text">Referenzprofil hier ablegen</span>
    	</div>
	</div>
		<hr class="shadow-line" />
		<div class="navigation-buttons">
			<button @click="goBack" class="back-button">Basisdaten</button>
			<button @click="showHardware" class="next-button">Hardware</button>
		</div>
		<hr class="shadow-line" />
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
import { id } from 'date-fns/locale';

const juStore = useJuStore();

// Sichere Referenz-Erstellung ohne storeToRefs
const ju = computed(() => juStore.ju);

const { clearCache } = useStoreCookieSync(juStore, 'juStore');

// Initialisiere refprofil sofort und nach Cookie-Laden
if (juStore && juStore.ju && !juStore.ju.hasOwnProperty('refprofil')) {
	juStore.ju.refprofil = [];
}

onMounted(() => {
	setTimeout(() => {
		if (!juStore.ju.hasOwnProperty('refprofil') || juStore.ju.refprofil === undefined) {
			juStore.ju.refprofil = [];
		}
	}, 200);
});

const emit = defineEmits(['show-hardware', 'go-back']);

// Navigation functions
const goBack = () => {
	console.log('Going back to BaseData');
	emit('go-back');
};

const showHardware = () => {
	console.log('Going to HardwareData');
	emit('show-hardware');
};

async function fetchData(endpoint, targetRef) {
	try {
		const response = await fetch(`/api/${endpoint}`);
		if (!response.ok) {
			throw new Error(`Netzwerk-Antwort für ${endpoint} war nicht in Ordnung`);
		}
		targetRef.value = await response.json();
	} catch (error) {
		console.error(`Fehler beim Laden von ${endpoint}:`, error);
	}
}

const deleteItem = (index: number) => {
	if (index > -1) {
		const [movedItem] = targetList.value.splice(index, 1);
		sourceList.value.push(movedItem);
		// Direkt im Store setzen
		juStore.ju.refprofil = [...targetList.value];
		console.log('Nach deleteItem, refprofil:', juStore.ju.refprofil);
		updateSourceList();
		
		// Separates Cookie für refprofil
		saveRefprofilToCookie(targetList.value);
	}
};

const addProfileItem = (item: any) => {
	// Überprüfe ob bereits ein Profil ausgewählt ist (nur eines erlaubt)
	if (targetList.value.length > 0) {
		// Entferne das aktuelle Profil und füge es zurück zur sourceList
		const [currentItem] = targetList.value.splice(0, 1);
		sourceList.value.push(currentItem);
	}
	
	// Finde Item in sourceList und entferne es
	const sourceIndex = sourceList.value.findIndex(sourceItem => sourceItem.id === item.id);
	if (sourceIndex > -1) {
		const [movedItem] = sourceList.value.splice(sourceIndex, 1);
		targetList.value.push(movedItem);
		
		// Update Store und Cookie
		juStore.ju.refprofil = [...targetList.value];
		saveRefprofilToCookie(targetList.value);
		
		console.log(`Referenzprofil hinzugefügt: ${item.name}`);
	}
};

const onListChange = (event: any) => {
	if (event.added) {
		console.log(`Neues Item hinzugefügt: ${event.added.element.name}`);
	}
	if (event.removed) {
		console.log(`Item entfernt: ${event.removed.element.name}`);
	}
	// Direkt im Store setzen
	juStore.ju.refprofil = [...targetList.value];
	console.log('Nach onListChange, refprofil:', juStore.ju.refprofil);
	updateSourceList();
	
	// Separates Cookie für refprofil
	saveRefprofilToCookie(targetList.value);
};

const onAdd = (event: any) => {
	if(targetList.value.length > 1) {
		const [removed] = targetList.value.splice(0, 1);
		sourceList.value.push(removed);
	}
	// Direkt im Store setzen
	juStore.ju.refprofil = [...targetList.value];
	console.log('Nach onAdd, refprofil:', juStore.ju.refprofil);
	updateSourceList();
	
	// Separates Cookie für refprofil
	saveRefprofilToCookie(targetList.value);
};

// Separates Cookie-System für refprofil
const saveRefprofilToCookie = (profiles) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
	const cookieValue = JSON.stringify(profiles);
	document.cookie = `refprofil=${encodeURIComponent(cookieValue)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
	console.log('Refprofil Cookie gespeichert:', profiles);
};

const loadRefprofilFromCookie = () => {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'refprofil') {
			try {
				const profiles = JSON.parse(decodeURIComponent(value));
				console.log('Refprofil Cookie geladen:', profiles);
				return profiles;
			} catch (e) {
				console.error('Fehler beim Laden des Refprofil Cookies:', e);
				return [];
			}
		}
	}
	return [];
};

// Debug-Funktionen
const getCookieValue = () => {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'juStore') {
			try {
				return JSON.stringify(JSON.parse(decodeURIComponent(value)), null, 2);
			} catch (e) {
				return value;
			}
		}
	}
	return 'Cookie nicht gefunden';
};

const testCookieWrite = () => {
	juStore.ju.refprofil = [{ id: 2, name: 'Test-Profil' }];
	console.log('Test Cookie Write - refprofil gesetzt auf:', juStore.ju.refprofil);
	
	// Manuell Cookie aktualisieren
	const expires = new Date();
	expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
	const cookieValue = JSON.stringify(juStore.ju);
	document.cookie = `juStore=${encodeURIComponent(cookieValue)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
	console.log('Cookie manuell gespeichert:', cookieValue);
};

const sourceList = ref([]);
const targetList = ref([]);
const allReferenzprofile = ref([]);
const selectedBereich = ref('IT'); // Standard auf IT setzen

// API-Funktion zum Laden der Referenzprofile
const fetchReferenzprofile = async () => {
	try {
		// Lade alle Referenzprofile
		const response = await fetch('/api/referenzprofile');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		allReferenzprofile.value = data || [];
		updateSourceList();
		console.log('Referenzprofile geladen:', allReferenzprofile.value);
	} catch (error) {
		console.error('Fehler beim Laden der Referenzprofile:', error);
		allReferenzprofile.value = [];
	}
};

// Lade gespeicherte Profile beim Mount
onMounted(async () => {
	// Lade Referenzprofile von API
	await fetchReferenzprofile();
	
	// Dann lade gespeicherte Profile aus Cookie
	setTimeout(() => {
		const savedProfiles = loadRefprofilFromCookie();
		if (savedProfiles && savedProfiles.length > 0) {
			targetList.value = [...savedProfiles];
			juStore.ju.refprofil = [...savedProfiles];
			updateSourceList();
		}
	}, 100);
});

// Funktion zum Aktualisieren der sourceList
const updateSourceList = () => {
	let filtered = allReferenzprofile.value;
	
	// Filter nach Bereich wenn ausgewählt
	if (selectedBereich.value) {
		filtered = filtered.filter(item => item.bereich === selectedBereich.value);
	}
	
	// Entferne bereits ausgewählte Profile
	sourceList.value = filtered.filter(item => 
		!targetList.value.some(targetItem => targetItem.id === item.id)
	);
};

// Funktion für Bereichsfilterung
const filterByBereich = () => {
	updateSourceList();
	console.log('Bereich geändert zu:', selectedBereich.value);
};

</script>


<style scoped>
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

.arrow-left {
	font-size: 1rem;
	transition: transform 0.2s ease;
}

.back-button:hover .arrow-left {
	transform: translateX(-2px);
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
	cursor: grab;
	user-select: none;
}

.list-group-item:hover {
	background-color: var(--color-button-hover);
	transform: scale(1.01);
	z-index: 10;
}

.list-group-item:active {
	cursor: grabbing;
}

.profile-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
}

.profile-name {
	font-weight: 500;
	color: var(--color-text);
	font-size: 0.9rem;
}

.list-group-item:hover .profile-name {
	color: var(--color-text-inverted);
}

.list-group {
	user-select: none;
	width: 100%;
}

@media (min-width: 1025px) {
	.list-group {
		user-select: none;
		width: 100%;
	}
}

.list-group-full {
	user-select: none;
	width: 100%;
}

.refcontainer {
	min-height: 4rem;
	border: 2px dashed var(--color-border);
	border-radius: 0.5rem;
	padding: 1rem;
	width: 100%;
	position: relative;
}

.list-group-full.target-list {
	min-height: 2rem;
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

.delete-button {
	background: none !important;
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

.buttons-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.bereich-select {
	padding: 0.5rem;
	border: 1px solid var(--color-border);
	border-radius: 0.25rem;
	background: var(--color-background);
	color: var(--color-text);
	font-size: 0.9rem;
}

.bereich-select:focus {
	outline: none;
	border-color: var(--color-button);
}

@media (min-width: 1025px) {
	.ref {
		width: 66%;
	}
}

.page-layout {
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - 14rem);
}

.add-button {
	background: transparent !important;
	border: none;
	color: var(--color-text);
	cursor: pointer;
	font-size: 1.2rem;
}

.add-button:hover {
	color: var(--color-text-hover);
}

</style>