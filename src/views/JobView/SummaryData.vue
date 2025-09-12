<template>
<div>
	<div v-if="hasAnyData" class="ref">
		<h3>Zusammenfassung - Job-Update</h3>
		<div class="warning-container">
			<p class="warning">Vergewissere dich noch einmal, dass alle von dir eingegebenen Daten korrekt sind.</p>
		</div>
		<div class="summary-section" v-if="hasBasicData">
			<h4>Mitarbeiter:in</h4>
			<div class="summary-content">
				<div class="summary-item" v-if="ju.vorname && ju.nachname">
					<strong>Name:</strong> {{ ju.vorname }} {{ ju.nachname }}
				</div>
				<div class="summary-item" v-if="ju.itUserName">
					<strong>IT Benutzername:</strong> {{ ju.itUserName }}
				</div>
				<div class="summary-item" v-if="ju.employerType !== null">
					<strong>Typ:</strong> {{ ju.employerType ? 'Intern' : 'Extern' }}
				</div>
				<div class="summary-item" v-if="ju.updateType">
					<strong>Update-Typ:</strong> {{ ju.updateType }}
				</div>
				<div class="summary-item" v-if="ju.bereich">
					<strong>Bereich:</strong> {{ ju.bereich }}
				</div>
				<div class="summary-item" v-if="ju.sachbereich">
					<strong>Sachbereich & Team:</strong> {{ ju.sachbereich }}
				</div>
				<div class="summary-item" v-if="ju.funktion">
					<strong>Funktion:</strong> {{ ju.funktion }}
				</div>
				<div class="summary-item" v-if="ju.position">
					<strong>Position:</strong> {{ ju.position }}
				</div>
				<div class="summary-item" v-if="ju.vorgesetzt">
					<strong>Vorgesetzte:r:</strong> {{ ju.vorgesetzt }}
				</div>
				<div class="summary-item" v-if="ju.eintritt">
					<strong>Eintritt zum:</strong> {{ formatDate(ju.eintritt) }}
				</div>
				<div class="summary-item" v-if="ju.frist">
					<strong>Befristet bis:</strong> {{ formatDate(ju.frist) }}
				</div>
				<div class="summary-item" v-if="ju.verlaengerungbis">
					<strong>Verlängerung bis:</strong> {{ formatDate(ju.verlaengerungbis) }}
				</div>
				<div class="summary-item" v-if="ju.austritt_zum">
					<strong>Austritt zum:</strong> {{ formatDate(ju.austritt_zum) }}
				</div>
				<div class="summary-item" v-if="ju.wechsel_zum">
					<strong>Wechsel zum:</strong> {{ formatDate(ju.wechsel_zum) }}
				</div>
				<div class="summary-item" v-if="ju.aenderung_zum">
					<strong>Änderung zum:</strong> {{ formatDate(ju.aenderung_zum) }}
				</div>
				<div class="summary-item" v-if="ju.kommentar">
					<strong>Kommentare:</strong> 
					<div class="comment-text">{{ ju.kommentar }}</div>
				</div>
			</div>
		</div>

		<div class="summary-section" v-if="ju.refprofil && ju.refprofil.length > 0">
			<h4>Ausgewählte Referenzprofile</h4>
			<div class="summary-content">
				<div v-for="profil in ju.refprofil" :key="profil.id" class="profile-container">
					<div class="summary-item profile-item">
						{{ profil.name }}
					</div>
					
					<div v-if="profileHardware[profil.name] && profileHardware[profil.name].length > 0" class="profile-items">
						<h5>Hardware aus diesem Profil:</h5>
						<div class="profile-item-list">
							<div v-for="item in profileHardware[profil.name]" :key="`hw-${item.id}`" class="summary-item hardware-item profile-sub-item">
								<span class="item-name">{{ item.name }}</span>
								<span class="item-category" v-if="item.category">({{ item.category }})</span>
							</div>
						</div>
					</div>

					<div v-if="profileSoftware[profil.name] && profileSoftware[profil.name].length > 0" class="profile-items">
						<h5>Software aus diesem Profil:</h5>
						<div class="profile-item-list">
							<div v-for="item in profileSoftware[profil.name]" :key="`sw-${item.id}`" class="summary-item software-item profile-sub-item">
								<span class="item-name">{{ item.name }}</span>
								<span class="item-version" v-if="item.version">(v{{ item.version }})</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="summary-section" v-if="ju.additionalHardware && ju.additionalHardware.length > 0">
			<h4>Zusätzlich ausgewählte Hardware</h4>
			<div class="summary-content">
				<div v-for="item in ju.additionalHardware" :key="item.id" class="summary-item hardware-item">
					<span class="item-name">{{ item.name }}</span>
					<span class="item-category" v-if="item.kategorie">({{ item.kategorie }})</span>
				</div>
			</div>
		</div>

		<div class="summary-section" v-if="ju.additionalSoftware && ju.additionalSoftware.length > 0">
			<h4>Zusätzlich ausgewählte Software</h4>
			<div class="summary-content">
				<div v-for="item in ju.additionalSoftware" :key="item.id" class="summary-item software-item">
					<span class="item-name">{{ item.name }}</span>
					<span class="item-manufacturer" v-if="item.hersteller">({{ item.hersteller }})</span>
				</div>
			</div>
		</div>

		<div class="summary-section" v-if="ju.sapProfiles && ju.sapProfiles.length > 0">
			<h4>Ausgewählte SAP Profile</h4>
			<div class="summary-content">
				<div v-for="profile in ju.sapProfiles" :key="profile.id" class="summary-item sap-profile-item">
					<div class="sap-profile-header">
						<span class="sap-profile-name">{{ profile.name }}</span>
						<span class="sap-profile-code">{{ profile.code }}</span>
					</div>
					<!-- <div v-if="profile.description" class="sap-profile-description">
						{{ profile.description }}
					</div>
					<div v-if="profile.permissions && profile.permissions.length > 0" class="sap-profile-permissions">
						<span class="permissions-label">Berechtigungen:</span>
						<div class="permissions-tags">
							<span 
								v-for="permission in profile.permissions.slice(0, 5)" 
								:key="permission"
								class="permission-tag"
							>
								{{ permission }}
							</span>
							<span v-if="profile.permissions.length > 5" class="more-permissions">
								+{{ profile.permissions.length - 5 }} weitere
							</span>
						</div>
					</div> -->
				</div>
			</div>
		</div>

		<div class="summary-section" v-if="ju.additionalOptions && hasSelectedOptions">
			<h4>Zusätzliche Services</h4>
			<div class="summary-content">
				<div v-if="ju.additionalOptions.telefonnummer" class="summary-item option-item">
					<div class="option-main">
						<span>Telefonnummer - Firmennummer mit persönlicher Durchwahl</span>
					</div>
					<div v-if="ju.additionalOptions.telefontyp" class="profile-items">
						<h5>Telefontyp:</h5>
						<div class="profile-item-list">
							<div class="summary-item profile-sub-item">
								<span class="item-name">{{ getTelefonTypeName(ju.additionalOptions.telefontyp) }}</span>
							</div>
						</div>
					</div>
				</div>
				<div v-if="ju.additionalOptions.tuerschild" class="summary-item option-item">
					<div class="option-main">
						<span>Türschild - Namensschild für Büro oder Arbeitsplatz</span>
					</div>
				</div>
				<div v-if="ju.additionalOptions.visitenkarten" class="summary-item option-item">
					<div class="option-main">
						<span>Visitenkarten - Persönliche Visitenkarten mit Firmenlayout</span>
					</div>
				</div>
			</div>
		</div>

		<hr class="shadow-line" />
		<div class="navigation-buttons">
			<button @click="$emit('go-back')" class="back-button">
				Optionale Services
			</button>
			<button @click="submitJobUpdate" class="submit-button">
				Job-Update abschicken
			</button>
		</div>
		<hr class="shadow-line" />
	</div>
	<div v-else>
		<p>Keine Daten für die Zusammenfassung gefunden.</p>
	</div>
</div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useJuStore } from '@/stores/ju';

const juStore = useJuStore();
const ju = computed(() => juStore.ju);

const emit = defineEmits(['go-back', 'submit', 'back-to-navigation']);

const profileHardware = ref({});
const profileSoftware = ref({});

const hasBasicData = computed(() => {
	return ju.value.vorname || ju.value.nachname || ju.value.bereich || ju.value.sachbereich;
});

const hasAnyData = computed(() => {
	return hasBasicData.value || 
		   (ju.value.refprofil && ju.value.refprofil.length > 0) ||
		   (ju.value.additionalHardware && ju.value.additionalHardware.length > 0) ||
		   (ju.value.additionalSoftware && ju.value.additionalSoftware.length > 0) ||
		   (ju.value.sapProfiles && ju.value.sapProfiles.length > 0) ||
		   hasSelectedOptions.value;
});

const hasSelectedOptions = computed(() => {
	const options = ju.value.additionalOptions;
	if (!options || Array.isArray(options)) return false;
	return options.telefonnummer || options.tuerschild || options.visitenkarten;
});

const formatDate = (dateString) => {
	if (!dateString) return '';
	const date = new Date(dateString);
	return date.toLocaleDateString('de-DE');
};

const fetchProfileData = async () => {
	if (!ju.value.refprofil || ju.value.refprofil.length === 0) return;

	console.log('Lade Profil-Daten für:', ju.value.refprofil);

	for (const profil of ju.value.refprofil) {
		try {
			console.log(`Lade Hardware für Profil: ${profil.name}`);
			// Fetch hardware for this profile using profile name
			const hardwareResponse = await fetch(`/api/hardware/profile?profile=${encodeURIComponent(profil.name)}`);
			console.log(`Hardware Response Status: ${hardwareResponse.status}`);
			if (hardwareResponse.ok) {
				const hardwareData = await hardwareResponse.json();
				console.log(`Hardware Data für ${profil.name}:`, hardwareData);
				if (hardwareData.hardware && hardwareData.hardware.length > 0) {
					profileHardware.value[profil.name] = hardwareData.hardware;
				}
			}

			console.log(`Lade Software für Profil: ${profil.name}`);
			// Fetch software for this profile using profile name
			const softwareResponse = await fetch(`/api/software/profile?profile=${encodeURIComponent(profil.name)}`);
			console.log(`Software Response Status: ${softwareResponse.status}`);
			if (softwareResponse.ok) {
				const softwareData = await softwareResponse.json();
				console.log(`Software Data für ${profil.name}:`, softwareData);
				if (softwareData.software && softwareData.software.length > 0) {
					profileSoftware.value[profil.name] = softwareData.software;
				}
			}
		} catch (error) {
			console.error(`Fehler beim Laden der Profil-Daten für ${profil.name}:`, error);
		}
	}

	console.log('Final profileHardware:', profileHardware.value);
	console.log('Final profileSoftware:', profileSoftware.value);
};

const getTelefonTypeName = (typeId) => {
	if (typeId === 'standard') return 'Standard';
	if (typeId === 'komfort') return 'Komfort';
	return typeId;
};

const clearAllJobUpdateCookies = () => {
	const cookieNames = [
		'juStore',
		'refprofil',
		'additionalHardware',
		'additionalSoftware',
		'sapProfiles',
		'selectedSap',
		'additionalOptions'
	];
	
	cookieNames.forEach(cookieName => {
		document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
	});
	
	console.log('Alle Job-Update Cookies gelöscht');
};

const clearJobUpdateStore = () => {
	juStore.ju = {
		vorname: '',
		nachname: '',
		itUserName: '',
		employerType: null,
		updateType: '',
		bereich: '',
		sachbereich: '',
		team: '',
		funktion: '',
		position: '',
		vorgesetzt: '',
		eintritt: '',
		frist: '',
		verlaengerungbis: '',
		austritt_zum: '',
		wechsel_zum: '',
		aenderung_zum: '',
		refprofil: [],
		additionalHardware: [],
		additionalSoftware: [],
		sapProfiles: [],
		selectedSap: false,
		kommentar: '',
		additionalOptions: {
			telefonnummer: false,
			tuerschild: false,
			visitenkarten: false,
			telefontyp: null
		}
	};
	
	console.log('Job-Update Store zurückgesetzt');
};

const submitJobUpdate = async () => {
	console.log('Job-Update wird abgeschickt:', ju.value);
	
	try {
		const response = await fetch('/api/job-update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(ju.value)
		});

		const result = await response.json();

		if (response.ok && result.success) {
			console.log('Job-Update erfolgreich übermittelt:', result);
			alert(`Job-Update erfolgreich übermittelt!\nTicket-ID: ${result.ticket_id}`);
			
				clearAllJobUpdateCookies();
			clearJobUpdateStore();
			
			emit('submit');
			setTimeout(() => {
				emit('back-to-navigation');
			}, 100);
		} else {
			console.error('Fehler beim Übermitteln des Job-Updates:', result);
			alert(`Fehler beim Übermitteln des Job-Updates: ${result.message || 'Unbekannter Fehler'}`);
		}
	} catch (error) {
		console.error('Netzwerkfehler beim Übermitteln des Job-Updates:', error);
		alert('Netzwerkfehler beim Übermitteln des Job-Updates. Bitte versuchen Sie es erneut.');
	}
};

onMounted(() => {
	fetchProfileData();
});
</script>

<style scoped>
@media (min-width: 1025px) {
	.ref {
		width: 66%;
	}
}

.summary-section {
	margin-bottom: 2rem;
	padding: 1.5rem;
	background: var(--color-background);
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
}

.summary-section h4 {
	margin: 0 0 1rem 0;
	color: var(--color-button-hover);
	font-size: 1.1rem;
	font-weight: 600;
	border-bottom: 2px solid var(--color-button-hover);
	padding-bottom: 0.5rem;
}

.summary-content {
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
}

.summary-item {
	padding: 0.8rem;
	background: var(--color-background-mute);
	border-radius: 0.3rem;
	border-left: 3px solid var(--color-button);
}

.comment-text {
	margin-top: 0.5rem;
	padding: 0.5rem;
	background: var(--color-background-soft);
	border-radius: 0.25rem;
	white-space: pre-wrap;
	word-wrap: break-word;
	font-style: italic;
	color: var(--color-text-muted);
}

.profile-item {
	background: rgba(var(--color-button-hover-rgb), 0.1);
	border-left-color: var(--color-button-hover);
	font-weight: 500;
}

.hardware-item, .software-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.item-name {
	font-weight: 500;
}

.item-category, .item-manufacturer {
	color: var(--color-text-muted);
	font-size: 0.9rem;
	font-style: italic;
}

.option-item {
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
	background: rgba(var(--color-button-hover-rgb), 0.05);
	border-left-color: var(--color-button-hover);
}

.option-main {
	font-weight: 500;
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

.submit-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: var(--color-button-hover);
	color: white;
}

.submit-button:hover {
	background: var(--color-button);
	transform: translateY(-1px);
}

.profile-container {
	margin-bottom: 2rem;
}

.profile-items {
	margin: 1rem 0 0 1rem;
	padding: 1rem;
	background: var(--color-background-mute);
	border-radius: 0.3rem;
	border: 1px solid var(--color-border);
}

.profile-items h5 {
	margin: 0 0 0.8rem 0;
	color: var(--color-text);
	font-size: 0.95rem;
	font-weight: 600;
}

.profile-item-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.profile-sub-item {
	margin: 0;
	padding: 0.6rem;
	background: var(--color-background);
	border-left: 2px solid var(--color-border);
	font-size: 0.9rem;
}

.profile-sub-item .item-name {
	font-weight: 400;
}

.item-version {
	color: var(--color-text-muted);
	font-size: 0.85rem;
	font-style: italic;
}

.warning-container {
	padding-bottom: 0.3rem;
}

.sap-profile-item {
	background: var(--color-background-mute);
	border-left-color: var(--color-button);
}

.sap-profile-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
}

.sap-profile-name {
	font-weight: 600;
	color: var(--color-text);
	font-size: 1rem;
}

.sap-profile-code {
	background: var(--color-button);
	color: var(--color-text);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 500;
	font-family: monospace;
}

.sap-profile-description {
	color: var(--color-text-muted);
	font-size: 0.9rem;
	line-height: 1.4;
	margin-bottom: 0.75rem;
}

.sap-profile-permissions {
	margin-top: 0.75rem;
}

.permissions-label {
	display: block;
	font-size: 0.85rem;
	font-weight: 500;
	color: var(--color-text);
	margin-bottom: 0.5rem;
}

.permissions-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem;
}

.permission-tag {
	background: var(--color-background-mute);
	border: 1px solid var(--color-border);
	color: var(--color-text-muted);
	padding: 0.125rem 0.375rem;
	border-radius: 0.25rem;
	font-size: 0.7rem;
	font-family: monospace;
}

.more-permissions {
	color: var(--color-text-muted);
	font-size: 0.7rem;
	font-style: italic;
	padding: 0.125rem 0.25rem;
	align-self: center;
}

</style>