<template>
    <div :class="{ 'fade-in': showWorkArea }" class="new-div">
        <!-- Clear Data Button -->
        <hr class="shadow-line" />
        <div v-if="userStore.canAccessAdmin" class="clear-data-section">
            <button @click="clearAllData" class="clear-data-button" title="Alle gespeicherten Daten löschen">
                🗑️ Daten zurücksetzen
            </button>
        </div>
        
        <BaseData v-if="activeComponent === 'BaseData'" @show-ref="activeComponent = 'RefProfileData'" />
        <RefProfileData v-if="activeComponent === 'RefProfileData'" 
            @show-hardware="activeComponent = 'HardwareData'" 
            @go-back="activeComponent = 'BaseData'" />
        <HardwareData v-if="activeComponent === 'HardwareData'" 
            @go-back="activeComponent = 'RefProfileData'" 
            @show-software="activeComponent = 'SoftwareData'" />
        <SoftwareData v-if="activeComponent === 'SoftwareData'" 
            @go-back="activeComponent = 'HardwareData'" 
            @show-options="activeComponent = 'OptionsData'"
            @show-sap-profiles="activeComponent = 'SapProfiles'" />
        <SapProfiles v-if="activeComponent === 'SapProfiles'"
            @go-back="activeComponent = 'SoftwareData'"
            @show-options="activeComponent = 'OptionsData'" />
        <OptionsData v-if="activeComponent === 'OptionsData'" 
            @go-back="handleOptionsGoBack"
            @show-summary="activeComponent = 'SummaryData'" />
        <SummaryData v-if="activeComponent === 'SummaryData'"
            @go-back="activeComponent = 'OptionsData'"
            @submit="() => console.log('Job-Update abgeschickt!')"
            @back-to-navigation="$emit('back-to-navigation')" />
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useJuStore } from '@/stores/ju';
import { useUserStore } from '@/stores/userStore';
import { useStoreCookieSync } from '@/components/useStoreCookieSync';

const emit = defineEmits(['back-to-navigation']);
import BaseData from './JobView/BaseData.vue';
import RefProfileData from './JobView/RefProfileData.vue';
import HardwareData from './JobView/HardwareData.vue';
import SoftwareData from './JobView/SoftwareData.vue';
import SapProfiles from './JobView/SapProfiles.vue';
import OptionsData from './JobView/OptionsData.vue';
import SummaryData from './JobView/SummaryData.vue';

// Store and cookie management
const juStore = useJuStore();
const userStore = useUserStore();
const { clearCache } = useStoreCookieSync(juStore, 'juStore');

const activeComponent = ref('BaseData');

const handleOptionsGoBack = () => {
    const cookies = document.cookie.split(';');
    let sapWasSelected = false;
    
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'selectedSap') {
            sapWasSelected = value === 'true';
            break;
        }
    }
    
    activeComponent.value = sapWasSelected ? 'SapProfiles' : 'SoftwareData';
};

const clearAllData = () => {
    console.log('Clearing all data...');
    
    // Reset Pinia store using custom reset function
    juStore.resetJu();
    
    // Clear cookie cache
    clearCache();
    
    // Clear all cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name] = cookie.trim().split('=');
        if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        }
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset to first component
    activeComponent.value = 'BaseData';
    
    console.log('Data cleared successfully');
};

const showHeadLine = ref(false);
const showWorkArea = ref(false);
onMounted(() => {
    setTimeout(() => {
        showHeadLine.value = true;
    }, 100);
    setTimeout(() => {
        showWorkArea.value = true;
    }, 200);
});
</script>

<style scoped>
.cell-wide {
    position: fixed;
    padding-bottom: 0rem;
    margin-top: 0px;
    background-color: var(--color-background);
    z-index: 9999;
    display: flexbox;
    margin-left: -1.2rem !important;
    padding-left: 1.2rem !important;
    padding-right: 12rem !important;
}

.new-div {
    margin-top: 2rem;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    grid-column: 1 / 4;
    grid-row: 2 / 3;
}

.new-div.fade-in {
    opacity: 1;
}

.clear-data-section {
    position: relative;
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-end;
}

.clear-data-button {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1001;
}

.clear-data-button:hover {
    background-color: #c82333;
}
</style>