<template>
<div class="page-layout">
	<hr class="shadow-line"/>
	<div class="ref">
		<div class="buttons-row">
			<p>Referenzprofile für Bereich: {{ selectedBereich || 'Alle' }}</p>
			<div class="controls-group">
				<select v-model="selectedBereich" @change="filterByBereich" class="bereich-select">
					<option value="">Alle Bereiche</option>
					<option v-for="bereich in availableBereiche" :key="bereich" :value="bereich">
						{{ bereich }}
					</option>
				</select>
			</div>
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
					<button @click="deleteItem(index)" class="delete-button">&#xf014;</button>
				</div>
			</template>
    	</draggable>
		<div v-show="targetList.length === 0" class="placeholder-container">
    		<span class="placeholder-text">Referenzprofil hier ablegen</span>
    	</div>
	</div>
		<hr class="shadow-line" />
		<div class="navigation-buttons">
			<button @click="goBack" class="back-button">← Basisdaten</button>
			<button @click="showHardware" class="next-button">Hardware →</button>
		</div>
		<hr class="shadow-line" />
	</div>
</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useJuStore } from '@/stores/ju'
import { useUserStore } from '@/stores/userStore'

import { useStoreCookieSync } from '@/components/useStoreCookieSync'

import draggable from 'vuedraggable';
import { id } from 'date-fns/locale';

const juStore = useJuStore();

const ju = computed(() => juStore.ju);

const { clearCache } = useStoreCookieSync(juStore, 'juStore');

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
		juStore.ju.refprofil = [...targetList.value];
		console.log('Nach deleteItem, refprofil:', juStore.ju.refprofil);
		updateSourceList();
		
		saveRefprofilToCookie(targetList.value);
	}
};

const addProfileItem = (item: any) => {
	if (targetList.value.length > 0) {
		const [currentItem] = targetList.value.splice(0, 1);
		sourceList.value.push(currentItem);
	}
	
	const sourceIndex = sourceList.value.findIndex(sourceItem => sourceItem.id === item.id);
	if (sourceIndex > -1) {
		const [movedItem] = sourceList.value.splice(sourceIndex, 1);
		targetList.value.push(movedItem);
		
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
	juStore.ju.refprofil = [...targetList.value];
	console.log('Nach onListChange, refprofil:', juStore.ju.refprofil);
	updateSourceList();
	
	saveRefprofilToCookie(targetList.value);
};

const onAdd = (event: any) => {
	if(targetList.value.length > 1) {
		const [removed] = targetList.value.splice(0, 1);
		sourceList.value.push(removed);
	}
	juStore.ju.refprofil = [...targetList.value];
	console.log('Nach onAdd, refprofil:', juStore.ju.refprofil);
	updateSourceList();
	
	saveRefprofilToCookie(targetList.value);
};

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
	
	const expires = new Date();
	expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
	const cookieValue = JSON.stringify(juStore.ju);
	document.cookie = `juStore=${encodeURIComponent(cookieValue)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
	console.log('Cookie manuell gespeichert:', cookieValue);
};

const sourceList = ref([]);
const targetList = ref([]);
const allReferenzprofile = ref([]);
const availableBereiche = ref([]);
const selectedBereich = ref('');

const fetchReferenzprofile = async () => {
	try {
		const response = await fetch('/api/referenzprofile');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		console.log('Raw API response:', data); // Debug log
		allReferenzprofile.value = data || [];
		
		// Extract available bereiche from loaded profiles
		const bereiche = [...new Set(allReferenzprofile.value
			.map(profile => profile.bereich)
			.filter(bereich => bereich && bereich !== 'Unbekannt' && bereich !== 'Kein Bereich zugeordnet')
		)].sort();
		availableBereiche.value = bereiche;
		
		updateSourceList();
		console.log('Referenzprofile geladen:', allReferenzprofile.value);
		console.log('Verfügbare Bereiche:', availableBereiche.value);
	} catch (error) {
		console.error('Fehler beim Laden der Referenzprofile:', error);
		allReferenzprofile.value = [];
		availableBereiche.value = [];
	}
};


// Check for updates every 30 seconds
let intervalId = null;

onMounted(async () => {
	await fetchReferenzprofile();
	
	setTimeout(() => {
		const savedProfiles = loadRefprofilFromCookie();
		if (savedProfiles && savedProfiles.length > 0) {
			targetList.value = [...savedProfiles];
			juStore.ju.refprofil = [...savedProfiles];
			updateSourceList();
		}
	}, 100);
	
	// Set up automatic refresh every 30 seconds
	intervalId = setInterval(async () => {
		console.log('Auto-refreshing profiles...');
		await fetchReferenzprofile();
	}, 30000);
});

// Clean up interval on unmount
onUnmounted(() => {
	if (intervalId) {
		clearInterval(intervalId);
	}
});

const updateSourceList = () => {
	let filtered = allReferenzprofile.value;
	
	if (selectedBereich.value) {
		filtered = filtered.filter(item => item.bereich === selectedBereich.value);
	}
	
	sourceList.value = filtered.filter(item => 
		!targetList.value.some(targetItem => targetItem.id === item.id)
	);
};

const filterByBereich = () => {
	updateSourceList();
	console.log('Bereich geändert zu:', selectedBereich.value);
};

</script>


<style scoped>
/* Navigation buttons styling inherited from main.css */


.arrow-left {
	font-size: 1rem;
	transition: transform 0.2s ease;
}

.back-button:hover .arrow-left {
	transform: translateX(-2px);
}

/* List group and draggable functionality inherited from main.css */

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

/* Add/delete button styling moved to main.css */

/* RefProfile-specific button customizations */
.delete-button {
	background: none !important;
	font-family: "FontAwesome" !important;
	font-size: 1.2rem;
	color: var(--color-text);
	border: none;
	cursor: pointer;
	padding: 0.25rem;
}

.delete-button:hover {
	color: #e74c3c;
}


.buttons-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.controls-group {
	display: flex;
	gap: 0.5rem;
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

.refresh-button {
	padding: 0.5rem;
	border: 1px solid var(--color-border);
	border-radius: 0.25rem;
	background: var(--color-background);
	color: var(--color-text);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.refresh-button:hover {
	background: var(--color-button);
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


</style>