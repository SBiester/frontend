<template>
<div>
    <div v-if="juStore.ju.refprofil && juStore.ju.refprofil.length > 0" class="sap-profiles">
        <h2>SAP Profile auswählen</h2>
        <p>Wähle die benötigten SAP Profile aus den verschiedenen Kategorien:</p>
        
        <!-- Show pre-selected profiles from reference profile -->
        <div v-if="selectedProfiles.some(p => p.fromReferenceProfile)" class="reference-profiles-section">
            <h3>Durch Referenzprofil zugewiesene SAP Profile</h3>
            <div class="profiles-grid">
                <div 
                    v-for="profile in selectedProfiles.filter(p => p.fromReferenceProfile)" 
                    :key="`ref-${profile.id}`"
                    class="profile-card selected"
                >
                    <div class="profile-header">
                        <h5>{{ profile.name }}</h5>
                    </div>
                </div>
            </div>
            <hr class="shadow-line" />
        </div>
        
        <div class="search-section">
            <div class="search-input-container">
                <input 
                    v-model="searchQuery"
                    @input="onSearchInput"
                    type="text" 
                    class="search-input"
                    placeholder="Profile durchsuchen (Name oder Schlüssel)..."
                />
                <div class="search-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </div>
            </div>
            
            <div v-if="searchQuery && searchResults !== null" class="search-results-info">
                <span v-if="searchResults.total_results > 0">
                    {{ searchResults.total_results }} Profile gefunden für "{{ searchQuery }}"
                </span>
                <span v-else>
                    Keine Profile gefunden für "{{ searchQuery }}"
                </span>
                <button @click="clearSearch" class="clear-search-btn">Suche löschen</button>
            </div>
        </div>
        
        <div v-if="loading" class="loading">
            <p>SAP Profile werden geladen...</p>
        </div>
        
        <div v-else-if="currentProfileGroups.length > 0" class="profile-groups">
            <div v-for="group in currentProfileGroups" :key="group.id" class="profile-group">
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
                                </div>
                                <span class="profile-code">{{ profile.code }}</span>
                                <!-- <p class="profile-description">{{ profile.description }}</p>
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
                                </div> -->
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
                    :class="{ 'from-reference': profile.fromReferenceProfile }"
                    class="selected-profile-item"
                >
                    <span class="selected-profile-name">{{ profile.name }}</span>
                    <button 
                        v-if="!profile.fromReferenceProfile"
                        @click="removeProfile(profile)" 
                        class="remove-button"
                        title="Profil entfernen"
                    >×</button>
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
const searchQuery = ref('');
const searchResults = ref(null);
const searchTimeout = ref(null);

// Get IDs of SAP profiles already assigned from reference profile
const getAssignedSapProfileIds = () => {
    const assignedIds = selectedProfiles.value
        .filter(profile => profile.fromReferenceProfile)
        .map(profile => profile.id);
    return assignedIds;
};

const currentProfileGroups = computed(() => {
    const groups = searchQuery.value && searchResults.value ? searchResults.value.groups : profileGroups.value;
    
    // Filter out already assigned SAP profiles from reference profile
    const assignedIds = getAssignedSapProfileIds();
    
    return groups.map(group => ({
        ...group,
        profiles: group.profiles.filter(profile => !assignedIds.includes(profile.id))
    })).filter(group => group.profiles.length > 0); // Only show groups that have available profiles
});

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
    // Prevent removal of profiles from reference profile
    if (profile.fromReferenceProfile) {
        console.warn('Cannot remove SAP profile from reference profile:', profile.name);
        return;
    }
    
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

const searchSapProfiles = async (query) => {
    if (!query.trim()) {
        searchResults.value = null;
        return;
    }
    
    try {
        const response = await fetch(`/api/sap/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        searchResults.value = data;
        
        // Auto-expand all categories when search results are found
        if (data.groups && data.groups.length > 0) {
            expandedGroups.value = new Set(data.groups.map(group => group.id));
        }
    } catch (error) {
        console.error('Fehler bei der SAP Profile Suche:', error);
        searchResults.value = { groups: [], total_results: 0 };
    }
};

const onSearchInput = () => {
    // Clear existing timeout
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
    }
    
    // Set new timeout for debounced search
    searchTimeout.value = setTimeout(() => {
        searchSapProfiles(searchQuery.value);
    }, 300); // 300ms delay for live search
};

const clearSearch = () => {
    searchQuery.value = '';
    searchResults.value = null;
    // Reset expanded groups to initial state when clearing search
    expandedGroups.value = new Set();
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
    }
};

// Load SAP profiles from reference profile
const loadSapProfilesFromReferenceProfile = async () => {
    if (juStore.ju.refprofil && juStore.ju.refprofil.length > 0) {
        try {
            const profileName = juStore.ju.refprofil[0].name;
            const response = await fetch('/api/admin/profiles');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Find the profile by name
            const profile = data.data.find(p => p.name === profileName);
            if (profile && profile.sapItems && profile.sapItems.length > 0) {
                // Map SAP items from reference profile to the expected format
                const referenceSapProfiles = profile.sapItems.map(item => ({
                    id: item.id,
                    name: item.Bezeichnung,
                    code: item.Bezeichnung, // Use Bezeichnung as code for now
                    category: item.Rollengruppe?.Bezeichnung || 'Allgemein',
                    fromReferenceProfile: true
                }));
                
                console.log('SAP profiles loaded from reference profile:', referenceSapProfiles);
                return referenceSapProfiles;
            }
        } catch (error) {
            console.error('Error loading SAP profiles from reference profile:', error);
        }
    }
    return [];
};

onMounted(async () => {
    await fetchSapProfiles();
    
    // First load SAP profiles from reference profile
    const referenceSapProfiles = await loadSapProfilesFromReferenceProfile();
    
    // Then load any additionally saved profiles from cookie
    const savedProfiles = loadSapProfilesFromCookie();
    
    // Combine reference profile SAP items with saved selections
    const allSelectedProfiles = [...referenceSapProfiles];
    if (savedProfiles && savedProfiles.length > 0) {
        // Add saved profiles that are not already in reference profile
        savedProfiles.forEach(saved => {
            if (!allSelectedProfiles.some(ref => ref.id === saved.id)) {
                allSelectedProfiles.push(saved);
            }
        });
    }
    
    if (allSelectedProfiles.length > 0) {
        selectedProfiles.value = allSelectedProfiles;
        if (!juStore.ju.sapProfiles) {
            juStore.ju.sapProfiles = [];
        }
        juStore.ju.sapProfiles = [...allSelectedProfiles];
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

.search-section {
    margin-bottom: 2rem;
}

.search-input-container {
    position: relative;
    margin-bottom: 1rem;
}

.search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-background);
    color: var(--color-text);
    font-size: 1rem;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--color-button);
    box-shadow: 0 0 0 3px rgba(var(--color-button-rgb, 59, 130, 246), 0.1);
}

.search-input::placeholder {
    color: var(--color-text-muted);
}

.search-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    pointer-events: none;
}

.search-results-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: var(--color-background-soft);
    border-radius: 0.25rem;
    font-size: 0.9rem;
    color: var(--color-text-muted);
}

.clear-search-btn {
    background: none !important;
    border: 1px solid var(--color-border) !important;
    color: var(--color-text-muted) !important;
    padding: 0.25rem 0.5rem !important;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.clear-search-btn:hover {
    background: var(--color-background-mute) !important;
    border-color: var(--color-button) !important;
    color: var(--color-text) !important;
}
</style>