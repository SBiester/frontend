<template>
	<div class="home-view-container">
		<div class="cell-wide" v-if="showJobView">
			<h1 :class="{ 'fade-in': showJobTitle }">Job-Update</h1>
			<p class="subtitle">Erfasse hier &Auml;nderungen zu Rolle, Team oder Software und Hardware von Mitarbeitenden.</p>
		</div>
		<div v-if="!userStore.role" class="navigation-buttons-fixed">
			<a href="http://localhost:8000/auth/microsoft/redirect"><button>Mit Microsoft anmelden</button></a>
		</div>
		<div v-if="userStore.role && !showJobView" class="navigation-buttons-fixed">
			<Link href="http://localhost:8000/logout" method="post" as="button" type="button">Abmelden</Link>
		</div>
		<div v-if="userStore.role && showJobView" class="navigation-buttons-fixed">
			<button @click="goBackToNavigation" class="back-button-header">Dashboard</button>
			<Link href="http://localhost:8000/logout" method="post" as="button" type="button">Abmelden</Link>
		</div>
	
		<template v-if="userStore.role">
			<div v-if="!showJobView">
				<div class="cell-wide dashboard-header">
					<h1 :class="{ 'fade-in': showHeadLine }">Dashboard</h1>
					<p class="subtitle">Zentrale Verwaltung für IT-Services und Mitarbeiter-Management</p>
				</div>
				<div class="navigation-content">
					<!-- User Orders Status -->
					<div v-if="userOrders.length > 0" class="user-orders-widget">
						<div class="orders-header">
							<h3>Ihre offenen Job-Updates</h3>
							<span class="orders-count">{{ userOrders.length }}</span>
						</div>
						<div class="orders-list">
							<div v-for="order in userOrders.slice(0, 3)" :key="order.id" class="order-item">
								<div class="order-info">
									<span class="order-id">#{{ order.id }}</span>
									<span class="order-type">{{ getOrderTypeLabel(order.type) }}</span>
								</div>
								<span :class="`order-status ${order.status}`">{{ getOrderStatusLabel(order.status) }}</span>
							</div>
							<div v-if="userOrders.length > 3" class="more-orders">
								<button @click="navigateToOrders" class="view-all-btn">
									Alle {{ userOrders.length }} Aufträge anzeigen
								</button>
							</div>
						</div>
					</div>

					<div class="navigation-buttons">
						<router-link to="/admin"><button>Administration</button></router-link>
						<button @click="showJobUpdate">Job-Update</button>
						<button @click="navigateToOrders">Auftragsübersicht</button>
					</div>
				</div>
			</div>
			<div v-else class="job-view-container">
				<JobView @back-to-navigation="goBackToNavigation" />
			</div>
		</template>

		<template v-else>
			<h1 :class="{ 'fade-in': showHeadLine }">Willkommen</h1>
			<p>Bitte melde Dich an, um diese Anwendung nutzen zu k&ouml;nnen.</p>
		</template>
  	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { Link } from '@inertiajs/vue3';
import JobView from './JobView.vue';

const authMessage = ref('');
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const showHeadLine = ref(false);
const showJobView = ref(false);
const showJobTitle = ref(false);
const userOrders = ref([]);

const showJobUpdate = () => {
	showJobView.value = true;
	setTimeout(() => {
		showJobTitle.value = true;
	}, 100);
};

const goBackToNavigation = () => {
	showJobView.value = false;
	showJobTitle.value = false;
};

const navigateToOrders = () => {
	// Navigiere zum Admin-Bereich und setze Query-Parameter für direkte Navigation zur Auftragsübersicht
	router.push('/admin?section=orders');
};

const getOrderTypeLabel = (type) => {
	const typeLabels = {
		'new_employee': 'Neuer Mitarbeiter',
		'employee_change': 'Mitarbeiteränderung',
		'employee_departure': 'Mitarbeiteraustritt',
		'extension': 'Verlängerung'
	};
	return typeLabels[type] || type;
};

const getOrderStatusLabel = (status) => {
	const statusLabels = {
		'pending': 'Ausstehend',
		'in_progress': 'In Bearbeitung',
		'completed': 'Abgeschlossen',
		'cancelled': 'Abgebrochen'
	};
	return statusLabels[status] || status;
};

const fetchUserOrders = async () => {
	if (!userStore.role) return;
	
	try {
		const response = await fetch('/api/orders/user', {
			headers: {
				'Authorization': `Bearer ${userStore.token}`,
				'Content-Type': 'application/json'
			}
		});
		
		if (response.ok) {
			const data = await response.json();
			userOrders.value = data.filter(order => order.status !== 'completed' && order.status !== 'cancelled');
		}
	} catch (error) {
		console.error('Fehler beim Laden der Benutzer-Aufträge:', error);
	}
};

onMounted(() => {
	setTimeout(() => {
		showHeadLine.value = true;
	}, 100);
	fetchUserOrders();
});
</script>

<style scoped>
@media (min-width: 1025px) {
	.subtitle {
		display: block !important;
		font-size: 1.2rem;
	}
}

.subtitle {
	display: none;
	color: var(--vt-c-white);
}

.cell-wide {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    padding-bottom: 1rem;
    padding-top: 1rem;
    background-color: var(--color-button-hover);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.cell-wide h1,
.cell-wide p {
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: 0 1.2rem;
}

button {
	min-width: 8rem;
}

.navigation-buttons {
	margin-bottom: 1.5rem;
	display: flex;
	gap: 0.5rem;
}

.form-container {
	margin-bottom: 1.5rem;
	display: flex;
	gap: 0.5rem;
}

.home-view-container {
	position: relative;
}

.back-button-header {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	min-width: auto !important;
	padding: 0.5rem 1rem;
}

.back-button-header:hover {
	transform: translateX(-2px);
}

@media (min-width: 1025px) {
	.job-view-container {
		margin-top: 6rem !important;
		padding-top: 1rem;
	}
}

.job-view-container {
	margin-top: 3.4rem;
	padding-top: 1rem;
}

.navigation-content {
	margin-top: 6rem;
	padding: 2rem 1rem;
	text-align: center;
}

@media (min-width: 1025px) {
	.navigation-content {
		margin-top: 8rem;
	}
}

.navigation-buttons-fixed button:hover,
.navigation-buttons-fixed a button:hover {
	border: 1px solid var(--color-button) !important;
	transform: none !important;
}

.navigation-buttons-fixed button {
	border: 1px solid transparent !important;
}

.navigation-buttons-fixed a button {
	border: 1px solid transparent !important;
}

.user-orders-widget {
	background: var(--color-background-mute);
	border-radius: 0.5rem;
	padding: 1.5rem;
	margin-bottom: 2rem;
	border: 1px solid var(--color-border);
}

.orders-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.orders-header h3 {
	margin: 0;
	color: var(--color-heading);
	font-size: 1.25rem;
}

.orders-count {
	background: var(--color-button);
	color: var(--color-button-text);
	padding: 0.25rem 0.75rem;
	border-radius: 1rem;
	font-size: 0.875rem;
	font-weight: bold;
}

.orders-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.order-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 1rem;
	background: var(--color-background);
	border-radius: 0.375rem;
	border: 1px solid var(--color-border-hover);
}

.order-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.order-id {
	font-weight: bold;
	color: var(--color-heading);
	font-size: 0.875rem;
}

.order-type {
	color: var(--color-text-2);
	font-size: 0.8rem;
}

.order-status {
	padding: 0.25rem 0.75rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: bold;
	text-transform: uppercase;
}

.order-status.pending {
	background: #fef3c7;
	color: #92400e;
}

.order-status.in_progress {
	background: #dbeafe;
	color: #1e40af;
}

.order-status.completed {
	background: #d1fae5;
	color: #065f46;
}

.order-status.cancelled {
	background: #fee2e2;
	color: #991b1b;
}

.more-orders {
	margin-top: 0.5rem;
	text-align: center;
}

.view-all-btn {
	background: transparent;
	color: var(--color-button);
	border: 1px solid var(--color-button);
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
	font-size: 0.875rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.view-all-btn:hover {
	background: var(--color-button);
	color: var(--color-button-text);
}

</style>