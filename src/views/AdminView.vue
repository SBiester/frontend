<template>
    <div class="admin-view-container">
        <!-- Header Section -->
        <div class="cell-wide">
            <h1 :class="{ 'fade-in': showHeadLine }">Administration</h1>
            <p class="subtitle">Zentrale Verwaltung für Rechte, Rollen, Hardware und Software</p>
        </div>
        
        <!-- Navigation Buttons -->
        <div class="navigation-buttons-fixed">
            <button @click="goBackToNavigation" class="back-button-header">Navigation</button>
            <button v-if="!isDirectOrderAccess" @click="activeComponent = 'AdminDashboard'" class="dashboard-button-header">Dashboard</button>
            <!-- Navigation between admin sections -->
            <div class="admin-navigation" v-if="activeComponent !== 'AdminDashboard' && !isDirectOrderAccess">
                <select v-model="activeComponent" @change="navigateToSection" class="section-select">
                    <option value="AdminDashboard">Übersicht</option>
                    <option value="AdminUsers">Benutzer</option>
                    <option value="AdminRoles">Rollen & SAP</option>
                    <option value="AdminHardware">Hardware</option>
                    <option value="AdminSoftware">Software</option>
                    <option value="AdminProfiles">Profile</option>
                    <option value="AdminOrders">Auftragsübersicht</option>
                </select>
            </div>
            <Link href="http://localhost:8000/logout" method="post" as="button" type="button">Abmelden</Link>
        </div>
        
        <div :class="{ 'fade-in': showWorkArea }" class="new-div">
            <AdminDashboard v-if="activeComponent === 'AdminDashboard'" 
                @show-users="activeComponent = 'AdminUsers'"
                @show-roles="activeComponent = 'AdminRoles'" 
                @show-hardware="activeComponent = 'AdminHardware'"
                @show-software="activeComponent = 'AdminSoftware'"
                @show-profiles="activeComponent = 'AdminProfiles'"
                @show-orders="activeComponent = 'AdminOrders'" />
            
            <AdminUsers v-if="activeComponent === 'AdminUsers'" 
                @go-back="activeComponent = 'AdminDashboard'" />
                
            <AdminRoles v-if="activeComponent === 'AdminRoles'" 
                @go-back="activeComponent = 'AdminDashboard'" />
                
            <AdminHardware v-if="activeComponent === 'AdminHardware'" 
                @go-back="activeComponent = 'AdminDashboard'" />
                
            <AdminSoftware v-if="activeComponent === 'AdminSoftware'" 
                @go-back="activeComponent = 'AdminDashboard'" />
                
            <AdminProfiles v-if="activeComponent === 'AdminProfiles'" 
                @go-back="activeComponent = 'AdminDashboard'" />
                
            <AdminOrders v-if="activeComponent === 'AdminOrders'" 
                @go-back="activeComponent = 'AdminDashboard'" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Link } from '@inertiajs/vue3';

const emit = defineEmits(['back-to-navigation']);
const router = useRouter();
const route = useRoute();

import AdminDashboard from './AdminView/AdminDashboard.vue';
import AdminUsers from './AdminView/AdminUsers.vue';
import AdminRoles from './AdminView/AdminRoles.vue';
import AdminHardware from './AdminView/AdminHardware.vue';
import AdminSoftware from './AdminView/AdminSoftware.vue';
import AdminProfiles from './AdminView/AdminProfiles.vue';
import AdminOrders from './AdminView/AdminOrders.vue';

const activeComponent = ref('AdminDashboard');
const showHeadLine = ref(false);
const showWorkArea = ref(false);
const isDirectOrderAccess = ref(false);

const goBackToNavigation = () => {
    router.push('/');
};

const navigateToSection = () => {
    // Function is called when select changes, activeComponent is already updated via v-model
};

onMounted(() => {
    // Check for query parameter to navigate directly to a section
    const section = route.query.section;
    if (section === 'orders') {
        activeComponent.value = 'AdminOrders';
        isDirectOrderAccess.value = true;
    }
    
    setTimeout(() => {
        showHeadLine.value = true;
    }, 100);
    setTimeout(() => {
        showWorkArea.value = true;
    }, 200);
});
</script>

<style scoped>
.admin-view-container {
    min-height: 100vh;
}

/* Header styles from HomeView */
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

.subtitle {
	color: var(--vt-c-white);
}

.subtitle {
    font-family: "GT Pressura";  
    font-size: 1.2rem;
    margin-top: 0.5rem;
    opacity: 0.9;
}

/* Navigation buttons styles from HomeView */
.navigation-buttons-fixed {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
    z-index: 1001;
    align-items: center;
}

/* Button styles from HomeView */
button {
    min-width: 8rem;
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

.navigation-buttons-fixed button:hover,
.navigation-buttons-fixed a button:hover {
    border: 1px solid var(--color-button) !important;
    transform: none !important;
}

.navigation-buttons-fixed button {
    border: 1px solid transparent !important;
}

/* Admin navigation select */
.admin-navigation {
    margin-left: 0.5rem;
}

.section-select {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: 'GT Pressura';
    font-size: 1rem;
    cursor: pointer;
    min-width: 10rem;
}

.section-select:focus {
    outline: none;
    border-color: var(--color-button);
}

/* Content area */
.new-div {
    margin-top: 8rem; /* Space for fixed header */
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s ease-in-out;
}

.new-div.fade-in {
    opacity: 1;
    transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .navigation-buttons-fixed {
        flex-direction: column;
        top: 0.5rem;
        right: 0.5rem;
        gap: 0.25rem;
    }
    
    .navigation-buttons-fixed button {
        min-width: 6rem;
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
    }
    
    .admin-navigation {
        margin-left: 0;
        margin-top: 0.25rem;
    }
    
    .section-select {
        min-width: 8rem;
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
    }
    
    .new-div {
        margin-top: 10rem; /* More space on mobile */
    }
}
</style>