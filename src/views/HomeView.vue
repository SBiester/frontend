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
			<!-- <a href="http://localhost:8000/auth/microsoft/redirect"><button>abmelden</button></a> -->
			<Link href="http://localhost:8000/logout" method="post" as="button" type="button">Abmelden</Link>
		</div>
	
		<template v-if="userStore.role">
			<div v-if="!showJobView">
				<div class="cell-wide dashboard-header">
					<h1 :class="{ 'fade-in': showHeadLine }">Dashboard</h1>
					<p class="subtitle">Zentrale Verwaltung für IT-Services und Mitarbeiter-Management</p>
				</div>
				<div class="navigation-content">
					<div class="navigation-buttons">
						<!-- <router-link v-if="userStore.role === 'admin'" to="/admin"><button>Admin Page</button></router-link> -->
						<router-link to="/admin"><button>Administration</button></router-link>
						<!-- <router-link v-if="userStore.role === 'admin' || userStore.role === 'pm'" to="/job"><button>Job Page</button></router-link> -->
						<button @click="showJobUpdate">Job-Update</button>
						<!--<router-link to="/test"><button>Drag-Test</button></router-link>-->
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
import { useRoute } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { Link } from '@inertiajs/vue3';
import JobView from './JobView.vue';

const authMessage = ref('');
const route = useRoute();
const userStore = useUserStore();
const showHeadLine = ref(false);
const showJobView = ref(false);
const showJobTitle = ref(false);

const showJobUpdate = () => {
	showJobView.value = true;
	// Start title animation after a short delay
	setTimeout(() => {
		showJobTitle.value = true;
	}, 100);
};

const goBackToNavigation = () => {
	showJobView.value = false;
	showJobTitle.value = false;
};

onMounted(() => {
	setTimeout(() => {
		showHeadLine.value = true;
	}, 100);
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

.dashboard-header {
	/* Extend existing cell-wide styles for dashboard */
}

.navigation-content {
	margin-top: 6rem; /* Space for fixed header */
	padding: 2rem 1rem;
	text-align: center;
}

@media (min-width: 1025px) {
	.navigation-content {
		margin-top: 8rem; /* More space for desktop */
	}
}

/* Header button hover effects */
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

</style>