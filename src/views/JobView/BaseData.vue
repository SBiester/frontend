<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';
import 'vue-datepicker-next/locale/de';

import { useJuStore } from '@/stores/ju'
import { useUserStore } from '@/stores/userStore'

import { useStoreCookieSync } from '@/components/useStoreCookieSync'

const juStore = useJuStore();

const ju = computed({
	get: () => juStore.ju,
	set: (value) => {

		Object.assign(juStore.ju, value);
	}
});

const { clearCache } = useStoreCookieSync(juStore, 'juStore');

const userStore = useUserStore();

const emit = defineEmits(['show-ref']);

const bereiche = ref([]);
const sachbereiche = ref([]);
const teams = ref([]);
const funktionen = ref([]);
const positionen = ref([]);
const vorgesetzte = ref([]);

const isMobile = ref(false);
const showCustomFunction = ref(false);

onMounted(() => {
  const mq = window.matchMedia('(max-width: 640px)')
  const update = () => (isMobile.value = mq.matches)
  update()
  mq.addEventListener('change', update)
  // clean up
  onBeforeUnmount(() => {
    mq.removeEventListener('change', update)
    // Clean up datepicker observer
    if (datepickerObserver.value) {
      datepickerObserver.value.disconnect();
      datepickerObserver.value = null;
    }
  })
})

async function fetchData(endpoint, targetRef) {
    try {
        const response = await fetch(`/api/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Netzwerk-Antwort für ${endpoint} war nicht in Ordnung`);
        }
        targetRef.value = await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden von ${endpoint}:`, error);
    }
}

function handleDateChange(field, value) {
    console.log(`Date changed for ${field}:`, value);
    if (value instanceof Date) {
        // Use local date to avoid timezone issues
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        ju.value[field] = formattedDate;
        console.log(`Updated ju.${field} to:`, formattedDate);
    } else if (typeof value === 'string') {
        ju.value[field] = value;
        console.log(`Updated ju.${field} to:`, value);
    } else {
        ju.value[field] = value;
        console.log(`Updated ju.${field} to:`, value);
    }
    // Force header styling after date change
    setTimeout(() => applyHeaderStyling(), 100);
}

function applyHeaderStyling() {
    const headers = document.querySelectorAll('.mx-calendar-header, .mx-time-header');
    headers.forEach(header => {
        header.style.backgroundColor = 'var(--color-button)';
        header.style.color = 'white';
        // Get computed style to apply actual color value
        const buttonColor = getComputedStyle(document.documentElement).getPropertyValue('--color-button').trim();
        if (buttonColor) {
            header.style.backgroundColor = buttonColor;
        }
    });
}

function toggleCustomFunction() {
    showCustomFunction.value = !showCustomFunction.value;
    if (showCustomFunction.value) {
        // Clear dropdown selection when switching to custom input
        ju.value.funktion = null;
        ju.value.customFunktion = '';
    } else {
        // Clear custom input when switching back to dropdown
        ju.value.customFunktion = '';
    }
}

// Watch for changes in custom function input
watch(() => ju.value.customFunktion, (newValue) => {
    if (showCustomFunction.value && newValue) {
        ju.value.funktion = newValue;
    }
});

// Watch for changes in dropdown selection
watch(() => ju.value.funktion, (newValue) => {
    if (!showCustomFunction.value && newValue) {
        ju.value.customFunktion = '';
    }
});

// Convert date string to Date object for display, avoiding timezone issues
function getDateValue(dateString) {
    if (!dateString) return null;
    // Parse date string as local date to avoid timezone conversion
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

const formSchema = computed(() => ({
    switchRole: {
        type: 'button',
        buttonLabel: 'Rolle wechseln',
        onClick: () => userStore.switchRole(),
        size: 'sm'
    },
    vorname: {
        type: 'text',
        placeholder: 'Vorname',
        rules: 'required',
        columns: { default: 12, tablet: 6 }
    },
    nachname: {
        type: 'text',
        placeholder: 'Nachname',
        rules: 'required',
        columns: { default: 12, tablet: 6 }
    },
    employerType: {
        type: 'toggle',
        class: 'toggle-element',
        labels: { on: 'intern', off: 'extern' }
    },
    updateType: {
        type: 'radiogroup',
        class: 'radio-element',
        view: isMobile.value ? 'select' : 'tabs',
        items: ['Eintritt', 'Verlängerung', 'Wechsel', 'Änderung', 'Austritt'],
    },
    it_user_data: {
        type: 'group',
        conditions: [
            ['updateType', 'in', ['Verlängerung', 'Wechsel', 'Änderung', 'Austritt']]
        ],
        schema: {
            itUserName: {
                type: 'text',
                placeholder: 'IT Benutzername'
            }
        }
    },
    bereich: {
        type: 'select',
        placeholder: 'Bereich',
        items: bereiche.value,
        columns: { default: 12, tablet: 4 }
    },
    sachbereich: {
        type: 'select',
        placeholder: 'Sachbereich & Team',
        items: sachbereiche.value,
        columns: { default: 12, tablet: 8 }
    },
    funktion: {
        type: 'select',
        placeholder: 'Funktion',
        items: funktionen.value,
        disabled: showCustomFunction.value,
        columns: { default: 11, tablet: 11 }
    },
    funktionAddButton: {
        type: 'button',
        buttonLabel: '+',
        onClick: toggleCustomFunction,
        columns: { default: 1, tablet: 1 },
        align: 'right'
    },
    customFunktion: {
        type: 'text',
        placeholder: 'Eigene Funktion eingeben...',
        conditions: [
            () => showCustomFunction.value === true
        ]
    },
    position: {
        type: 'select',
        placeholder: 'Position',
        items: positionen.value
    },
    vorgesetzt: {
        type: 'select',
        placeholder: 'Vorgesetzte:r',
        items: vorgesetzte.value
    },
}));

onMounted(async () => {
    await Promise.all([
        fetchData('bereiche', bereiche),
        fetchData('sachbereiche', sachbereiche),
        fetchData('teams', teams),
        fetchData('funktionen', funktionen),
        fetchData('vorgesetzte', vorgesetzte),
        fetchData('positionen', positionen)
    ]);
    
    // Initialize custom function if there's already a function value that's not in the dropdown
    if (ju.value.funktion && !funktionen.value.includes(ju.value.funktion)) {
        showCustomFunction.value = true;
        ju.value.customFunktion = ju.value.funktion;
    }
    
    // Set up observer for datepicker styling
    setupDatepickerObserver();
});

const datepickerObserver = ref(null);

// German locale configuration for datepicker
const germanLocale = {
  formatLocale: {
    firstDayOfWeek: 1,
    months: [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ],
    monthsShort: [
      'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
    ],
    weekdays: [
      'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 
      'Donnerstag', 'Freitag', 'Samstag'
    ],
    weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    weekdaysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  }
};

function setupDatepickerObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if datepicker popup was added
                        if (node.classList?.contains('mx-datepicker-popup') || 
                            node.querySelector?.('.mx-datepicker-popup')) {
                            setTimeout(() => applyHeaderStyling(), 50);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    datepickerObserver.value = observer;
}

watch(() => ju.value.updateType, (newValue) => {
    if (newValue === 'Eintritt') {
        ju.value.itUserName = null;
        ju.value.verlaengerungbis = null;
        ju.value.austritt_zum = null;
        ju.value.wechsel_zum = null;
        ju.value.aenderung_zum = null;
    } else if (newValue === 'Verlängerung') {
        ju.value.eintritt = null;
        ju.value.frist = null;
        ju.value.austritt_zum = null;
        ju.value.wechsel_zum = null;
        ju.value.aenderung_zum = null;
    } else if (newValue === 'Austritt') {
        ju.value.eintritt = null;
        ju.value.frist = null;
        ju.value.verlaengerungbis = null;
        ju.value.wechsel_zum = null;
        ju.value.aenderung_zum = null;
    } else if (newValue === 'Wechsel') {
        ju.value.eintritt = null;
        ju.value.frist = null;
        ju.value.verlaengerungbis = null;
        ju.value.austritt_zum = null;
        ju.value.aenderung_zum = null;
    } else if (newValue === 'Änderung') {
        ju.value.eintritt = null;
        ju.value.frist = null;
        ju.value.verlaengerungbis = null;
        ju.value.austritt_zum = null;
        ju.value.wechsel_zum = null;
    } else {
        ju.value.verlaengerungbis = null;
        ju.value.austritt_zum = null;
        ju.value.wechsel_zum = null;
        ju.value.aenderung_zum = null;
    }
});
</script>

<template>
    <hr class="shadow-line" />
    <div class="viewport" :class="{ 'custom-function-active': showCustomFunction }">
        <Vueform v-model="ju" ref="basedata" :schema="formSchema" :sync="true" />
        
        
        <!-- Custom Date Picker Fields -->
        <div class="date-picker-section">
            <!-- Eintritt Date Fields -->
            <div v-if="ju.updateType === 'Eintritt'" class="date-picker-row">
                <div class="date-picker-field">
                    <DatePicker
                        :value="getDateValue(ju.eintritt)"
                        placeholder="Eintritt zum"
                        format="DD.MM.YYYY"
                        value-format="YYYY-MM-DD"
                        :clearable="true"
                        :editable="false"
                        :locale="germanLocale"
                        :first-day-of-week="1"
                        @change="(value) => handleDateChange('eintritt', value)"
                        class="custom-datepicker"
                    />
                </div>
                <div class="date-picker-field">
                    <DatePicker
                        :value="getDateValue(ju.frist)"
                        placeholder="Befristet bis"
                        format="DD.MM.YYYY"
                        value-format="YYYY-MM-DD"
                        :clearable="true"
                        :editable="false"
                        :locale="germanLocale"
                        :first-day-of-week="1"
                        @change="(value) => handleDateChange('frist', value)"
                        class="custom-datepicker"
                    />
                </div>
            </div>
            
            <!-- Verlängerung Date Field -->
            <div v-if="ju.updateType === 'Verlängerung'" class="date-picker-row">
                <div class="date-picker-field">
                    <DatePicker
                        :value="getDateValue(ju.verlaengerungbis)"
                        placeholder="Verlängerung bis"
                        format="DD.MM.YYYY"
                        value-format="YYYY-MM-DD"
                        :clearable="true"
                        :editable="false"
                        :locale="germanLocale"
                        :first-day-of-week="1"
                        @change="(value) => handleDateChange('verlaengerungbis', value)"
                        class="custom-datepicker"
                    />
                </div>
            </div>
            
            <!-- Austritt Date Field -->
            <div v-if="ju.updateType === 'Austritt'" class="date-picker-row">
                <div class="date-picker-field">
                    <DatePicker
                        :value="getDateValue(ju.austritt_zum)"
                        placeholder="Austritt zum"
                        format="DD.MM.YYYY"
                        value-format="YYYY-MM-DD"
                        :clearable="true"
                        :editable="false"
                        :locale="germanLocale"
                        :first-day-of-week="1"
                        @change="(value) => handleDateChange('austritt_zum', value)"
                        class="custom-datepicker"
                    />
                </div>
            </div>
            
            <!-- Wechsel Date Field -->
            <div v-if="ju.updateType === 'Wechsel'" class="date-picker-row">
                <div class="date-picker-field">
                    <DatePicker
                        :value="getDateValue(ju.wechsel_zum)"
                        placeholder="Wechsel zum"
                        format="DD.MM.YYYY"
                        value-format="YYYY-MM-DD"
                        :clearable="true"
                        :editable="false"
                        :locale="germanLocale"
                        :first-day-of-week="1"
                        @change="(value) => handleDateChange('wechsel_zum', value)"
                        class="custom-datepicker"
                    />
                </div>
            </div>
            
            <!-- Änderung Date Field -->
            <div v-if="ju.updateType === 'Änderung'" class="date-picker-row">
                <div class="date-picker-field">
                    <DatePicker
                        :value="getDateValue(ju.aenderung_zum)"
                        placeholder="Änderung zum"
                        format="DD.MM.YYYY"
                        value-format="YYYY-MM-DD"
                        :clearable="true"
                        :editable="false"
                        :locale="germanLocale"
                        :first-day-of-week="1"
                        @change="(value) => handleDateChange('aenderung_zum', value)"
                        class="custom-datepicker"
                    />
                </div>
            </div>
        </div>
    
        <hr class="shadow-line" />
    
        <div class="buttons-row">
            <button v-if="userStore.role === 'fach'" @click="$emit('show-ref')">Referenzprofil</button>
            <button v-if="userStore.role === 'pm'" @click="() => console.log('Gespeicherte Parameter: ', { ...ju }), clearCache(), $refs.basedata.reset()">Absenden</button>
        </div>
    </div>
    <hr class="shadow-line" />
</template>

<style scoped>

.buttons-row {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

@media (min-width: 1025px) {
	.viewport {
		width: 66%;
	}
}

:deep(.vf-input-group) {
  	background: var(--color-background) !important;
}

:deep(input) {
	color: var(--color-text) !important;
}

:deep(.vf-floating-label) {
  	background: var(--color-background) !important;
  	color: var(--color-text) !important;
}

:deep(.vf-native-select) {
	background: var(--color-background) !important;
	color: var(--color-text) !important;
}


/* Date Picker Styles */
.date-picker-section {
	margin: 1.5rem 0;
}

.date-picker-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
	margin-bottom: 1rem;
}

@media (max-width: 768px) {
	.date-picker-row {
		grid-template-columns: 1fr;
	}
}

.date-picker-field {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.date-picker-field label {
	color: var(--color-text);
	font-weight: 500;
	font-size: 0.9rem;
}

/* Override vue-datepicker-next styles to match theme */
:deep(.mx-datepicker) {
	width: 100%;
}

:deep(.mx-input) {
	background: var(--color-background) !important;
	color: var(--color-text) !important;
	border: 1px solid var(--color-border) !important;
	border-radius: 4px;
	padding: 0.75rem;
	font-size: 1rem;
}

/* Datepicker placeholder color - match Vueform fields */
:deep(.mx-input::placeholder) {
	color: #9CA3AF !important;
	opacity: 1 !important;
}

:deep(.mx-input::-webkit-input-placeholder) {
	color: #9CA3AF !important;
	opacity: 1 !important;
}

:deep(.mx-input::-moz-placeholder) {
	color: #9CA3AF !important;
	opacity: 1 !important;
}

:deep(.mx-input:-ms-input-placeholder) {
	color: #9CA3AF !important;
	opacity: 1 !important;
}

:deep(.mx-input:-moz-placeholder) {
	color: #9CA3AF !important;
	opacity: 1 !important;
}

/* More specific targeting for vue-datepicker-next */
.date-picker-section :deep(.mx-input::placeholder) {
	color: #9CA3AF !important;
	opacity: 1 !important;
}

.custom-datepicker :deep(.mx-input::placeholder) {
	color: #9CA3AF !important;
	opacity: 1 !important;
}


:deep(.mx-input:focus) {
	border-color: var(--color-button) !important;
	box-shadow: 0 0 0 2px rgba(var(--color-button-rgb), 0.2);
}

:deep(.mx-datepicker-popup) {
	background: var(--color-background) !important;
	border: 1px solid var(--color-border) !important;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.mx-calendar-header) {
	background: var(--color-background-mute) !important;
	color: var(--color-text) !important;
}

:deep(.mx-btn) {
	color: var(--color-text) !important;
}

:deep(.mx-btn:hover) {
	background: var(--color-button-hover) !important;
	color: white !important;
}

:deep(.mx-calendar-content .mx-table-date) {
	color: var(--color-text) !important;
}

:deep(.mx-table-date:hover) {
	background: var(--color-button-hover) !important;
	color: white !important;
}

:deep(.mx-active-date) {
	background: var(--color-button) !important;
	color: white !important;
}

/* More specific targeting for header background */
:deep(.mx-datepicker .mx-calendar-header),
:deep(.mx-calendar .mx-calendar-header),
:deep(.mx-calendar-header),
:deep(.mx-calendar-header > *),
:deep(.mx-calendar-header-label),
:deep(.mx-calendar-decade-separator),
:deep(.mx-btn-text) {
    background-color: var(--color-button) !important;
    background: var(--color-button) !important;
    color: white !important;
}

/* Force override with even higher specificity */
.date-picker-section :deep(.mx-calendar-header) {
    background-color: var(--color-button) !important;
    background: var(--color-button) !important;
    color: white !important;
}

.date-picker-section :deep(.mx-calendar-header *) {
    background-color: var(--color-button) !important;
    background: var(--color-button) !important;
    color: white !important;
}

/* Target exact classes from F12 inspection */
.custom-datepicker :deep(.mx-calendar-header),
.custom-datepicker :deep(.mx-time-header) {
    box-sizing: border-box;
    height: 34px;
    line-height: 34px;
    text-align: center;
    overflow: hidden;
    background-color: var(--color-button) !important;
    background: var(--color-button) !important;
    color: white !important;
}

/* Alternative approach using CSS variables */
.custom-datepicker {
    --mx-primary-color: var(--color-button);
    --mx-text-color-primary: white;
}

</style>