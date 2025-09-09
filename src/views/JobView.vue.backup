<template>
    <!-- <div class="cell-wide">
        <h1 :class="{ 'fade-in': showHeadLine }">Job-Update</h1>
        <p>Erfasse hier &Auml;nderungen zu Rolle, Team oder Software und Hardware von Mitarbeitenden.</p>
    </div> -->
    <div :class="{ 'fade-in': showWorkArea }" class="new-div">
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

const emit = defineEmits(['back-to-navigation']);
import BaseData from './JobView/BaseData.vue';
import RefProfileData from './JobView/RefProfileData.vue';
import HardwareData from './JobView/HardwareData.vue';
import SoftwareData from './JobView/SoftwareData.vue';
import SapProfiles from './JobView/SapProfiles.vue';
import OptionsData from './JobView/OptionsData.vue';
import SummaryData from './JobView/SummaryData.vue';

const activeComponent = ref('BaseData');

// Navigation logic for Options go-back button
const handleOptionsGoBack = () => {
    // Check if SAP was selected by looking at cookie or checking if we came from SAP profiles
    const cookies = document.cookie.split(';');
    let sapWasSelected = false;
    
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'selectedSap') {
            sapWasSelected = value === 'true';
            break;
        }
    }
    
    // Navigate back to SapProfiles if SAP was selected, otherwise to SoftwareData
    activeComponent.value = sapWasSelected ? 'SapProfiles' : 'SoftwareData';
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
    /* grid-column: 1 / 3;
    grid-row: 1 / 2; */
    /* mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%); */
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
</style>