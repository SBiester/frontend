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
		<h2>Weitere Optionen</h2>
		<p>Wähle die gewünschten Services aus:</p>
		
		<div class="options-container">
			<div 
				v-for="option in availableOptions" 
				:key="option.id" 
				class="option-item"
			>
				<button 
					@click="toggleOption(option.id)"
					:class="{ 'selected': selectedOptions[option.id] }"
					class="option-button"
				>
					<div class="option-content">
						<div class="option-icon">
							<p class="fa">{{ option.icon }}</p>
						</div>
						<div class="option-text">
							<h4>{{ option.name }}</h4>
							<p>{{ option.description }}</p>
						</div>
					</div>
					<span v-if="selectedOptions[option.id]" class="option-checkmark">✓</span>
				</button>
				
				<div v-if="option.id === 'telefonnummer' && selectedOptions.telefonnummer" class="telefon-type-selection">
					<h5>Telefontyp auswählen:</h5>
					<div class="telefon-types">
						<label 
							v-for="type in telefonTypes" 
							:key="type.id" 
							class="telefon-type-option"
						>
							<input 
								type="radio" 
								:value="type.id" 
								v-model="selectedOptions.telefontyp"
								@change="saveOptionsData"
								name="telefontyp"
							>
							<span class="telefon-type-label">{{ type.description }}</span>
						</label>
					</div>
				</div>
			</div>
		</div>
		
		<hr class="shadow-line" />
		<div class="navigation-buttons">
			<button @click="$emit('go-back')" class="back-button">
				← {{ backButtonText }}
			</button>
			<button @click="$emit('show-summary')" class="next-button">
				Zusammenfassung →
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
import { onMounted, ref, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useJuStore } from '@/stores/ju'
import { useUserStore } from '@/stores/userStore'

import { useStoreCookieSync } from '@/components/useStoreCookieSync'

const juStore = useJuStore();
const ju = computed(() => juStore.ju);

const emit = defineEmits(['go-back', 'show-summary']);

const availableOptions = ref([]);
const telefonTypes = ref([]);

const selectedOptions = reactive({
	telefonnummer: false,
	tuerschild: false,
	visitenkarten: false,
	telefontyp: null
});

const sapWasSelected = computed(() => {
	if (juStore.ju.sapProfiles && juStore.ju.sapProfiles.length > 0) {
		return true;
	}
	
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'sapProfiles') {
			try {
				const profiles = JSON.parse(decodeURIComponent(value));
				return profiles && profiles.length > 0;
			} catch (e) {
				return false;
			}
		}
	}
	
	return false;
});

const backButtonText = computed(() => {
	return sapWasSelected.value ? 'SAP Berechtigungen' : 'Software';
});

const fetchOptions = async () => {
	try {
		const response = await fetch('/api/options');
		if (!response.ok) {
			throw new Error('Netzwerk-Antwort für Options war nicht in Ordnung');
		}
		availableOptions.value = await response.json();
		console.log('Options geladen:', availableOptions.value);
	} catch (error) {
		console.error('Fehler beim Laden der Options:', error);
	}
};

const fetchTelefonTypes = async () => {
	try {
		const response = await fetch('/api/telefon-types');
		if (!response.ok) {
			throw new Error('Netzwerk-Antwort für Telefon-Types war nicht in Ordnung');
		}
		telefonTypes.value = await response.json();
		console.log('Telefon Types geladen:', telefonTypes.value);
	} catch (error) {
		console.error('Fehler beim Laden der Telefon Types:', error);
	}
};

const toggleOption = (optionId) => {
	selectedOptions[optionId] = !selectedOptions[optionId];
	saveOptionsData();
};

const saveOptionsData = () => {
	if (!juStore.ju.additionalOptions) {
		juStore.ju.additionalOptions = {
			telefonnummer: false,
			tuerschild: false,
			visitenkarten: false,
			telefontyp: null
		};
	}
	juStore.ju.additionalOptions = { ...selectedOptions };
	saveOptionsDataToCookie(selectedOptions);
	console.log('Options gespeichert:', selectedOptions);
};

const saveOptionsDataToCookie = (options) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
	const cookieValue = JSON.stringify(options);
	document.cookie = `additionalOptions=${encodeURIComponent(cookieValue)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
	console.log('Options Cookie gespeichert:', options);
};

const loadOptionsDataFromCookie = () => {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'additionalOptions') {
			try {
				const options = JSON.parse(decodeURIComponent(value));
				console.log('Options Cookie geladen:', options);
				return options;
			} catch (e) {
				console.error('Fehler beim Laden des Options Cookies:', e);
				return {};
			}
		}
	}
	return {};
};

const initializeSavedOptions = () => {
	const savedOptions = loadOptionsDataFromCookie();
	if (savedOptions && Object.keys(savedOptions).length > 0) {
		console.log('Initializing saved options:', savedOptions);
		Object.assign(selectedOptions, savedOptions);
		
		if (!juStore.ju.additionalOptions) {
			juStore.ju.additionalOptions = {
				telefonnummer: false,
				tuerschild: false,
				visitenkarten: false,
				telefontyp: null
			};
		}
		juStore.ju.additionalOptions = { ...savedOptions };
		
		console.log('Options list after init:', selectedOptions);
		return true;
	}
	return false;
};

onMounted(async () => {
	await Promise.all([
		fetchOptions(),
		fetchTelefonTypes()
	]);
	initializeSavedOptions();
});
</script>

<style scoped>
@media (min-width: 1025px) {
	.ref {
		width: 66%;
	}
}

/* List group styling inherited from main.css */

@media (min-width: 1025px) {
	.list-group {
		user-select: none;
		width: 100%;
	}
}

.options-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin: 2rem 0;
}

.option-item {
	/* Container only for layout, styling moved to .option-button */
}

.option-button:hover {
	border-color: var(--color-button) !important;
	background: rgba(var(--color-button-rgb, 59, 130, 246), 0.05) !important;
	transform: translateY(-2px) !important;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Option button base styling moved to main.css */

/* OptionsData-specific overrides */
.option-button {
	gap: 1rem !important;
	padding: 1.5rem !important;
	background: var(--color-background-mute) !important;
	transition: all 0.3s ease !important;
	text-align: left !important;
	position: relative !important;
}

.option-icon {
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

.outline {
	filter: brightness(0) saturate(100%);
	-webkit-text-stroke: 1px white;
	color: transparent;
}

.option-text {
	flex: 1;
}

.option-text h4 {
	margin: 0 0 0.5rem 0;
	color: var(--color-text);
	font-size: 1.1rem;
	font-weight: 600;
}

.option-text p {
	margin: 0;
	color: var(--color-text-muted);
	font-size: 0.9rem;
	line-height: 1.4;
}

.option-button.selected .option-icon {
	background: var(--color-button-hover);
	transform: scale(1.1);
}

.option-button.selected .option-text h4 {
	color: var(--color-button-hover);
}

.option-button.selected {
	border-color: var(--color-button) !important;
	background: rgba(var(--color-button-rgb, 59, 130, 246), 0.1) !important;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.option-checkmark {
	font-size: 1.5rem;
	color: var(--color-button-hover);
	font-weight: bold;
	position: absolute;
	right: 1.5rem;
	top: 50%;
	transform: translateY(-50%);
}

/* Navigation buttons styling inherited from main.css */

.telefon-type-selection {
	margin-top: 1rem;
	padding: 1rem;
	background: var(--color-background-mute);
	border-radius: 0.5rem;
	border-top: 1px solid var(--color-border);
}

.telefon-type-selection h5 {
	margin: 0 0 1rem 0;
	color: var(--color-text);
	font-size: 1rem;
	font-weight: 600;
}

.telefon-types {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.telefon-type-option {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
	padding: 0.5rem;
	border-radius: 0.3rem;
	transition: background-color 0.2s ease;
}

.telefon-type-option:hover {
	background: rgba(var(--color-button-rgb), 0.1);
}

.telefon-type-option input[type="radio"] {
	width: 16px;
	height: 16px;
	accent-color: var(--color-button);
}

.telefon-type-label {
	color: var(--color-text);
	font-size: 0.9rem;
	font-weight: 500;
}
</style>