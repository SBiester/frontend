<template>
<div>
	<hr class="shadow-line" />
	<div class="ref">
		<h2>Administrationsbereich</h2>
		<p>Verwalte Benutzer, Rollen, Hardware, Software und Referenzprofile</p>
		<hr class="shadow-line" />
		
		<div class="admin-modules">
			<div class="module-grid">
				<!-- Benutzer-Verwaltung -->
				<div class="module-card" @click="$emit('show-users')">
					<div class="module-header">
						<div class="module-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						</div>
						<h3>Benutzer</h3>
					</div>
					<p>Mitarbeiter verwalten, Rollen zuweisen und Berechtigungen konfigurieren</p>
					<div class="module-stats">
						<span class="stat-item">{{ userStats.total }} Benutzer</span>
					</div>
				</div>

				<!-- Rollen & SAP Profile -->
				<div class="module-card" @click="$emit('show-roles')">
					<div class="module-header">
						<div class="module-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
								<circle cx="12" cy="16" r="1"></circle>
								<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
							</svg>
						</div>
						<h3>Rollen & SAP Profile</h3>
					</div>
					<p>Rollengruppen und SAP-Profile verwalten, Berechtigungen definieren</p>
					<div class="module-stats">
						<span class="stat-item">{{ roleStats.groups }} Rollengruppen</span>
						<span class="stat-item">{{ roleStats.profiles }} SAP Profile</span>
					</div>
				</div>

				<!-- Hardware-Verwaltung -->
				<div class="module-card" @click="$emit('show-hardware')">
					<div class="module-header">
						<div class="module-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
								<line x1="8" y1="21" x2="16" y2="21"></line>
								<line x1="12" y1="17" x2="12" y2="21"></line>
							</svg>
						</div>
						<h3>Hardware</h3>
					</div>
					<p>Geräte katalog verwalten, neue Hardware hinzufügen und kategorisieren</p>
					<div class="module-stats">
						<span class="stat-item">{{ hardwareStats.total }} Geräte</span>
						<span class="stat-item">{{ hardwareStats.categories }} Kategorien</span>
					</div>
				</div>

				<!-- Software-Verwaltung -->
				<div class="module-card" @click="$emit('show-software')">
					<div class="module-header">
						<div class="module-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="16,18 22,12 16,6"></polyline>
								<polyline points="8,6 2,12 8,18"></polyline>
							</svg>
						</div>
						<h3>Software</h3>
					</div>
					<p>Software katalog verwalten, Lizenzen und Hersteller organisieren</p>
					<div class="module-stats">
						<span class="stat-item">{{ softwareStats.total }} Anwendungen</span>
						<span class="stat-item">{{ softwareStats.manufacturers }} Hersteller</span>
					</div>
				</div>

				<!-- Referenzprofil-Verwaltung -->
				<div class="module-card" @click="$emit('show-profiles')">
					<div class="module-header">
						<div class="module-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
								<circle cx="9" cy="9" r="2"></circle>
								<path d="M7 19c0-2 2-3 2-3s2 1 2 3"></path>
								<line x1="13" y1="11" x2="17" y2="11"></line>
								<line x1="13" y1="16" x2="17" y2="16"></line>
							</svg>
						</div>
						<h3>Referenzprofile</h3>
					</div>
					<p>Referenzprofile erstellen und verwalten, Hardware- und Software-Zuordnungen</p>
					<div class="module-stats">
						<span class="stat-item">{{ profileStats.total }} Profile</span>
						<span class="stat-item">{{ profileStats.departments }} Bereiche</span>
					</div>
				</div>

				<!-- Auftragsübersicht -->
				<div class="module-card" @click="$emit('show-orders')">
					<div class="module-header">
						<div class="module-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
								<polyline points="14,2 14,8 20,8"></polyline>
								<line x1="16" y1="13" x2="8" y2="13"></line>
								<line x1="16" y1="17" x2="8" y2="17"></line>
								<polyline points="10,9 9,9 8,9"></polyline>
							</svg>
						</div>
						<h3>Auftragsübersicht</h3>
					</div>
					<p>Übersicht über Job-Updates</p>
					<div class="module-stats">
						<span class="stat-item">{{ systemStats.activeUsers }} Aktive Aufträge</span>
						<span class="stat-item">{{ systemStats.pendingRequests }} Wartende Aufträge</span>
					</div>
				</div>
			</div>
		</div>
		
	</div>
</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const emit = defineEmits(['show-users', 'show-roles', 'show-hardware', 'show-software', 'show-profiles', 'back-to-navigation']);

// Mock Statistics - Diese sollten später aus der API geladen werden
const userStats = ref({
	total: 0
});

const roleStats = ref({
	groups: 0,
	profiles: 0
});

const hardwareStats = ref({
	total: 0,
	categories: 0
});

const softwareStats = ref({
	total: 0,
	manufacturers: 0
});

const profileStats = ref({
	total: 0,
	departments: 0
});

const systemStats = ref({
	activeUsers: 0,
	pendingRequests: 0
});

import adminService from '@/services/adminService';

// Load statistics
const loadStatistics = async () => {
	try {
		const stats = await adminService.getDashboardStats();
		
		// Update stats with API data
		if (stats.users) {
			userStats.value.total = stats.users.total;
		}
		
		if (stats.sap) {
			roleStats.value.groups = stats.sap.groups;
			roleStats.value.profiles = stats.sap.profiles;
		}
		
		if (stats.hardware) {
			hardwareStats.value.total = stats.hardware.total;
			hardwareStats.value.categories = stats.hardware.categories;
		}
		
		if (stats.software) {
			softwareStats.value.total = stats.software.total;
			softwareStats.value.manufacturers = stats.software.manufacturers;
		}
		
		// Referenzprofil-Statistiken (Mock)
		profileStats.value.total = 42;
		profileStats.value.departments = 8;
		
		// System-Statistiken (Mock)
		systemStats.value.activeUsers = 23;
		systemStats.value.pendingRequests = 5;
		
	} catch (error) {
		console.error('Fehler beim Laden der Statistiken:', error);
		// Fallback values if API fails
		userStats.value.total = 127;
		roleStats.value.groups = 8;
		roleStats.value.profiles = 45;
		hardwareStats.value.total = 156;
		hardwareStats.value.categories = 12;
		softwareStats.value.total = 87;
		softwareStats.value.manufacturers = 23;
	}
};

onMounted(() => {
	loadStatistics();
});
</script>

<style scoped>
.ref {
	max-width: 1200px;
	margin: 0 auto;
}

.admin-modules {
	margin: 2rem 0;
}

.module-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
	gap: 1.5rem;
	margin-bottom: 2rem;
}

@media (max-width: 768px) {
	.module-grid {
		grid-template-columns: 1fr;
		gap: 1rem;
	}
}

.module-card {
	background: var(--color-background);
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
	padding: 1.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
	overflow: hidden;
}

.module-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	border-color: var(--color-button);
}

.module-card.info-only {
	cursor: default;
	opacity: 0.8;
}

.module-card.info-only:hover {
	transform: none;
	box-shadow: none;
	border-color: var(--color-border);
}

.module-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
}

.module-icon {
	width: 2.5rem;
	height: 2.5rem;
	background: var(--color-button);
	border-radius: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--color-text);
	flex-shrink: 0;
}

.module-header h3 {
	margin: 0;
	color: var(--color-heading);
	font-size: 1.1rem;
	font-weight: 600;
}

.module-card p {
	color: var(--color-text-muted);
	margin: 0 0 1rem 0;
	font-size: 0.9rem;
	line-height: 1.4;
}

.module-stats {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-top: 1rem;
	padding-top: 1rem;
	border-top: 1px solid var(--color-border);
}

.stat-item {
	background: var(--color-background-soft);
	color: var(--color-text);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.8rem;
	font-weight: 500;
}

.navigation-buttons {
	display: flex;
	justify-content: center;
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

@media (max-width: 1024px) {
	.ref {
		width: 90%;
	}
}

@media (max-width: 640px) {
	.ref {
		width: 95%;
	}
	
	.module-card {
		padding: 1rem;
	}
	
	.module-header h3 {
		font-size: 1rem;
	}
	
	.navigation-buttons {
		flex-direction: column;
	}
}
</style>