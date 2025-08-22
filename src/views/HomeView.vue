<template>
	<div class="home-view-container">

		<div v-if="!userStore.role" class="navigation-buttons-fixed">
			<a href="http://localhost:8000/auth/microsoft/redirect"><button>Mit Microsoft anmelden</button></a>
		</div>
		<div v-if="userStore.role" class="navigation-buttons-fixed">
			<!-- <a href="http://localhost:8000/auth/microsoft/redirect"><button>abmelden</button></a> -->
			<Link href="http://localhost:8000/logout" method="post" as="button" type="button">Abmelden</Link>
		</div>

		<!-- <template v-if="userStore.role"> -->
		<template v-if="true">
			<h1 :class="{ 'fade-in': showHeadLine }">Navigation</h1>
			<div class="navigation-buttons">
				<!-- <router-link v-if="userStore.role === 'admin'" to="/admin"><button>Admin Page</button></router-link> -->
				<router-link to="/admin"><button>Administration</button></router-link>
				<!-- <router-link v-if="userStore.role === 'admin' || userStore.role === 'pm'" to="/job"><button>Job Page</button></router-link> -->
				<router-link to="/job"><button>Job-Update</button></router-link>
				<router-link to="/test"><button>Drag-Test</button></router-link>
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

	const authMessage = ref('');
	const route = useRoute();
	const userStore = useUserStore();
	const showHeadLine = ref(false);

	onMounted(() => {
		setTimeout(() => {
			showHeadLine.value = true;
		}, 100);
	});

</script>

<style scoped>

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

</style>