<template>
<div>
    <div v-if="juStore.ju.refprofil && juStore.ju.refprofil.length > 0" class="sap-profiles">
        <h2>SAP Profile auswählen</h2>
        <p>Wähle die benötigten SAP Profile aus den verschiedenen Kategorien:</p>
        
        <div v-if="loading" class="loading">
            <p>SAP Profile werden geladen...</p>
        </div>
        
        <div v-else-if="profileGroups.length > 0" class="profile-groups">
            <div v-for="group in profileGroups" :key="group.id" class="profile-group">
                <div class="group-header" @click="toggleGroup(group.id)">
                    <div class="group-header-content">
                        <h3>{{ group.name }}</h3>
                        <p class="group-description">{{ group.description }}</p>
                    </div>
                    <div class="expand-icon" :class="{ 'expanded': isGroupExpanded(group.id) }">
                        <span> ▼ </span>
                    </div>
                </div>
                
                <div v-if="isGroupExpanded(group.id)" class="profile-selection">
                    <div class="available-profiles">
                        <h4>Verfügbare Profile</h4>
                        <div class="profiles-grid">
                            <div 
                                v-for="profile in group.profiles" 
                                :key="profile.id"
                                :class="{ 'selected': isProfileSelected(profile) }"
                                class="profile-card"
                                @click="toggleProfile(profile)"
                            >
                                <div class="profile-header">
                                    <h5>{{ profile.name }}</h5>
                                    <span class="profile-code">{{ profile.code }}</span>
                                </div>
                                <p class="profile-description">{{ profile.description }}</p>
                                <div class="profile-permissions" v-if="profile.permissions && profile.permissions.length > 0">
                                    <span class="permissions-label">Berechtigungen:</span>
                                    <div class="permissions-list">
                                        <span 
                                            v-for="permission in profile.permissions.slice(0, 3)" 
                                            :key="permission"
                                            class="permission-badge"
                                        >
                                            {{ permission }}
                                        </span>
                                        <span v-if="profile.permissions.length > 3" class="more-permissions">
                                            + {{ profile.permissions.length - 3 }} weitere
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div v-else class="no-profiles">
            <p>Keine SAP Profile gefunden.</p>
        </div>
        
        <div v-if="selectedProfiles.length > 0" class="selected-summary">
            <h3>Ausgewählte SAP Profile</h3>
            <div class="selected-profiles-list">
                <div 
                    v-for="profile in selectedProfiles" 
                    :key="profile.id"
                    class="selected-profile-item"
                >
                    <span class="selected-profile-name">{{ profile.name }}</span>
                    <span class="selected-profile-code">{{ profile.code }}</span>
                    <button @click="removeProfile(profile)" class="remove-button">×</button>
                </div>
            </div>
        </div>
        
        <hr class="shadow-line" />
        <div class="navigation-buttons">
            <button @click="goBack" class="back-button">
                Software
            </button>
            <button @click="continueToOptions" class="next-button">
                Optionale Services
            </button>
        </div>
        <hr class="shadow-line" />
    </div>
    <div v-else>
        <p>Keine Referenzprofile gespeichert</p>
    </div>
</div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useJuStore } from '@/stores/ju';

const juStore = useJuStore();
const emit = defineEmits(['go-back', 'show-options']);

const profileGroups = ref([]);
const selectedProfiles = ref([]);
const loading = ref(false);
const expandedGroups = ref(new Set());

const fetchSapProfiles = async () => {
    loading.value = true;
    try {
        const response = await fetch('/api/sap/profiles');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        profileGroups.value = data.groups || [];
    } catch (error) {
        console.error('Fehler beim Laden der SAP Profile:', error);
        profileGroups.value = [];
    } finally {
        loading.value = false;
    }
};

const isProfileSelected = (profile) => {
    return selectedProfiles.value.some(p => p.id === profile.id);
};

const toggleProfile = (profile) => {
    const index = selectedProfiles.value.findIndex(p => p.id === profile.id);
    if (index > -1) {
        selectedProfiles.value.splice(index, 1);
    } else {
        selectedProfiles.value.push(profile);
    }
    
    juStore.ju.sapProfiles = [...selectedProfiles.value];
    saveSapProfilesToCookie();
};

const removeProfile = (profile) => {
    const index = selectedProfiles.value.findIndex(p => p.id === profile.id);
    if (index > -1) {
        selectedProfiles.value.splice(index, 1);
        juStore.ju.sapProfiles = [...selectedProfiles.value];
        saveSapProfilesToCookie();
    }
};

const toggleGroup = (groupId) => {
    if (expandedGroups.value.has(groupId)) {
        expandedGroups.value.delete(groupId);
    } else {
        expandedGroups.value.add(groupId);
    }
};

const isGroupExpanded = (groupId) => {
    return expandedGroups.value.has(groupId);
};

const saveSapProfilesToCookie = () => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (3 * 24 * 60 * 60 * 1000));
    const cookieValue = JSON.stringify(selectedProfiles.value);
    document.cookie = `sapProfiles=${encodeURIComponent(cookieValue)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    console.log('SAP Profiles Cookie gespeichert:', selectedProfiles.value);
};

const loadSapProfilesFromCookie = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'sapProfiles') {
            try {
                const profiles = JSON.parse(decodeURIComponent(value));
                console.log('SAP Profiles Cookie geladen:', profiles);
                return profiles;
            } catch (e) {
                console.error('Fehler beim Laden des SAP Profile Cookies:', e);
                return [];
            }
        }
    }
    return [];
};

const goBack = () => {
    emit('go-back');
};

const continueToOptions = () => {
    emit('show-options');
};

onMounted(async () => {
    await fetchSapProfiles();
    
    const savedProfiles = loadSapProfilesFromCookie();
    if (savedProfiles && savedProfiles.length > 0) {
        selectedProfiles.value = savedProfiles;
        if (!juStore.ju.sapProfiles) {
            juStore.ju.sapProfiles = [];
        }
        juStore.ju.sapProfiles = [...savedProfiles];
    }
});
</script>

<style scoped>
@media (min-width: 1025px) {
    .sap-profiles {
        width: 66%;
    }
}

.loading {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-muted);
}

.profile-groups {
    margin-top: 1.5rem;
}

.profile-group {
    margin-bottom: 2rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-background);
    overflow: hidden;
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid transparent;
}

.group-header:hover {
    background: var(--color-background-mute);
}

.group-header-content {
    flex: 1;
}

.group-header h3 {
    margin: 0 0 0.5rem 0;
    color: var(--color-heading);
    font-size: 1.25rem;
    font-weight: 600;
}

.group-description {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.95rem;
}

.expand-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-background-mute);
    transition: all 0.3s ease;
    font-size: 0.8rem;
    color: var(--color-text-muted);
}

.expand-icon.expanded {
    transform: rotate(180deg);
    background: var(--color-button);
    color: white;
}

.expand-icon:hover {
    background: var(--color-button);
    color: white;
}

.profile-selection {
    padding: 0 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid var(--color-border);
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        max-height: 0;
    }
    to {
        opacity: 1;
        max-height: 2000px;
    }
}

.available-profiles h4 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 500;
}

.profiles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.profile-card {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem;
    background: var(--color-background);
    cursor: pointer;
    transition: all 0.2s ease;
}

.profile-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--color-button);
}

.profile-card.selected {
    border-color: var(--color-button);
    background: var(--color-background-mute);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.profile-header h5 {
    margin: 0;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 600;
}

.profile-code {
    background: var(--color-button);
    color: var(--color-text);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    font-family: monospace;
}

.profile-description {
    color: var(--color-text-muted);
    margin: 0.5rem 0 1rem 0;
    font-size: 0.9rem;
    line-height: 1.4;
}

.profile-permissions {
    margin-top: 1rem;
}

.permissions-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 0.5rem;
}

.permissions-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}

.permission-badge {
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
}

.selected-summary {
    margin-top: 2rem;
    padding: 1.5rem;
    border: 1px solid var(--color-button);
    border-radius: 0.5rem;
    background: var(--color-background-soft);
}

.selected-summary h3 {
    margin: 0 0 1rem 0;
    color: var(--color-heading);
    font-size: 1.1rem;
}

.selected-profiles-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.selected-profile-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-button);
    color: var(--color-text);
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.9rem;
}

.selected-profile-name {
    font-weight: 500;
}

.selected-profile-code {
    font-family: monospace;
    font-size: 0.8rem;
    opacity: 0.8;
}

.remove-button {
    background: none !important;
    border: none !important;
    color: var(--color-text) !important;
    cursor: pointer;
    padding: 0 !important;
    margin-left: 0.25rem;
    font-size: 1.2rem;
    font-weight: bold;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.remove-button:hover {
    background-color: rgba(0, 0, 0, 0.1) !important;
}

.no-profiles {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-muted);
    font-style: italic;
}

.navigation-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.back-button,
.next-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>