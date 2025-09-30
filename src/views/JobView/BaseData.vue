<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import 'vue-datepicker-next/locale/de'

import { useJuStore } from '@/stores/ju'
import { useUserStore } from '@/stores/userStore'
import { apiHelpers } from '@/services/apiClient'

import { useStoreCookieSync } from '@/components/useStoreCookieSync'

const juStore = useJuStore()

const ju = computed({
  get: () => juStore.ju,
  set: (value) => {
    Object.assign(juStore.ju, value)
  },
})

const { clearCache } = useStoreCookieSync(juStore, 'juStore')

const userStore = useUserStore()

const emit = defineEmits(['show-ref'])

const bereiche = ref([])
const bereicheData = ref([]) // Full objects for filtering
const sachbereiche = ref([])
const teams = ref([])
const teamsData = ref([]) // Full objects for filtering
const funktionen = ref([])
const funktionenData = ref([]) // Full objects for filtering
// const positionen = ref([]); // Removed - Position is now a text field
const vorgesetzte = ref([])

const isMobile = ref(false)
const showCustomFunction = ref(false)

onMounted(() => {
  const mq = window.matchMedia('(max-width: 640px)')
  const update = () => (isMobile.value = mq.matches)
  update()
  mq.addEventListener('change', update)
  onBeforeUnmount(() => {
    mq.removeEventListener('change', update)
  })
})

async function fetchData(endpoint, targetRef) {
  try {
    const data = await apiHelpers.get(`/${endpoint}`)
    targetRef.value = data
  } catch (error) {
    console.error(`Fehler beim Laden von ${endpoint}:`, error)
  }
}

async function fetchBereiche() {
  try {
    const data = await apiHelpers.get('/admin/bereiche')
    bereicheData.value = data // Store full objects for filtering
    bereiche.value = data.map((item) => item.Bezeichnung)
    console.log('Bereiche geladen:', bereiche.value)
  } catch (error) {
    console.error('Fehler beim Laden der Bereiche:', error)
    bereiche.value = []
    bereicheData.value = []
  }
}

async function fetchTeams() {
  try {
    const data = await apiHelpers.get('/admin/teams')
    teamsData.value = data // Store full objects for filtering
    teams.value = data.map((item) => item.Bezeichnung)
    console.log('Teams geladen:', teams.value)
  } catch (error) {
    console.error('Fehler beim Laden der Teams:', error)
    teams.value = []
    teamsData.value = []
  }
}

async function fetchFunktionen() {
  try {
    const data = await apiHelpers.get('/admin/funktionen')
    funktionenData.value = data // Store full objects for filtering
    // Don't set funktionen.value here - will be set by computed property
    console.log('Funktionen geladen:', data)
  } catch (error) {
    console.error('Fehler beim Laden der Funktionen:', error)
    funktionenData.value = []
  }
}

// Computed properties for filtered teams
const filteredTeams = computed(() => {
  if (!ju.value.bereich) {
    return []
  }
  // Find the selected bereich by matching the Bezeichnung
  const selectedBereich = bereicheData.value.find((b) => b.Bezeichnung === ju.value.bereich)
  if (!selectedBereich) {
    return []
  }

  // Filter teams by BereichID and return only Bezeichnung strings
  return teamsData.value
    .filter((team) => team.BereichID === selectedBereich.BereichID)
    .map((team) => team.Bezeichnung)
})

// Computed property for filtered functions based on selected team
const filteredFunktionen = computed(() => {
  if (!ju.value.team) {
    return []
  }

  // Find the selected team by matching the Bezeichnung
  const selectedTeam = teamsData.value.find((t) => t.Bezeichnung === ju.value.team)
  if (!selectedTeam) {
    return []
  }

  // Filter functions by TeamID and return only Bezeichnung strings
  return funktionenData.value
    .filter((funktion) => funktion.TeamID === selectedTeam.TeamID)
    .map((funktion) => funktion.Bezeichnung)
})

// Update funktionen ref when filteredFunktionen changes
watch(filteredFunktionen, (newFunktionen) => {
  funktionen.value = newFunktionen
}, { immediate: true })

// Watch for bereich changes to clear team and funktion if not valid
watch(
  () => ju.value.bereich,
  (newBereich, oldBereich) => {
    if (newBereich !== oldBereich) {
      if (ju.value.team) {
        // Check if current team is still valid for new bereich
        const isTeamStillValid = filteredTeams.value.includes(ju.value.team)
        if (!isTeamStillValid) {
          ju.value.team = null // Clear team if not valid for new bereich
          ju.value.funktion = null // Clear funktion when team changes
        }
      }
      // Clear funktion when bereich changes
      if (ju.value.funktion && !showCustomFunction.value) {
        ju.value.funktion = null
      }
    }
  },
)

// Watch for team changes to clear funktion if not valid
watch(
  () => ju.value.team,
  (newTeam, oldTeam) => {
    if (newTeam !== oldTeam && ju.value.funktion && !showCustomFunction.value) {
      // Check if current funktion is still valid for new team
      const isFunktionStillValid = filteredFunktionen.value.includes(ju.value.funktion)
      if (!isFunktionStillValid) {
        ju.value.funktion = null // Clear funktion if not valid for new team
      }
    }
  },
)

function handleDateChange(field, value) {
  console.log(`Date changed for ${field}:`, value)
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    ju.value[field] = formattedDate
    console.log(`Updated ju.${field} to:`, formattedDate)
  } else if (typeof value === 'string') {
    ju.value[field] = value
    console.log(`Updated ju.${field} to:`, value)
  } else {
    ju.value[field] = value
    console.log(`Updated ju.${field} to:`, value)
  }
}

function toggleCustomFunction() {
  showCustomFunction.value = !showCustomFunction.value
  if (showCustomFunction.value) {
    ju.value.funktion = null
    ju.value.customFunktion = ''
  } else {
    ju.value.customFunktion = ''
  }
}

watch(
  () => ju.value.customFunktion,
  (newValue) => {
    if (showCustomFunction.value && newValue) {
      ju.value.funktion = newValue
    }
  },
)

watch(
  () => ju.value.funktion,
  (newValue) => {
    if (!showCustomFunction.value && newValue) {
      ju.value.customFunktion = ''
    }
  },
)

function getDateValue(dateString) {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

const formSchema = computed(() => ({
  ...(userStore.canAccessAdmin && {
    switchRole: {
      type: 'button',
      buttonLabel: 'Rolle wechseln',
      onClick: () => userStore.switchRole(),
      size: 'sm',
    },
  }),
  vorname: {
    type: 'text',
    placeholder: 'Vorname',
    rules: 'required',
    columns: { default: 12, tablet: 6 },
  },
  nachname: {
    type: 'text',
    placeholder: 'Nachname',
    rules: 'required',
    columns: { default: 12, tablet: 6 },
  },
  employerType: {
    type: 'toggle',
    class: 'toggle-element',
    labels: { on: 'intern', off: 'extern' },
  },
  updateType: {
    type: 'radiogroup',
    class: 'radio-element',
    view: isMobile.value ? 'select' : 'tabs',
    items: ['Eintritt', 'Verlängerung', 'Wechsel', 'Änderung', 'Austritt'],
  },
  it_user_data: {
    type: 'group',
    conditions: [['updateType', 'in', ['Verlängerung', 'Wechsel', 'Änderung', 'Austritt']]],
    schema: {
      itUserName: {
        type: 'text',
        placeholder: 'IT Benutzername',
      },
    },
  },
  bereich: {
    type: 'select',
    placeholder: 'Bereich',
    items: bereiche.value,
    columns: { default: 12, tablet: 4 },
  },
  team: {
    type: 'select',
    placeholder: 'Sachbereich & Team',
    items: filteredTeams.value,
    columns: { default: 12, tablet: 8 },
  },
  funktion: {
    type: 'select',
    placeholder: 'Funktion',
    items: funktionen.value,
    disabled: showCustomFunction.value,
    columns: { default: 12, sm: 12, tablet: 8, desktop: 8 },
  },
  funktionAddButton: {
    type: 'button',
    buttonLabel: '✎ bearbeiten',
    onClick: toggleCustomFunction,
    columns: { default: 12, sm: 12, tablet: 4, desktop: 4 },
    align: 'right',
  },
  customFunktion: {
    type: 'text',
    placeholder: 'Eigene Funktion eingeben...',
    conditions: [() => showCustomFunction.value === true],
  },
  position: {
    type: 'text',
    placeholder: 'Position eingeben...',
  },
  vorgesetzt: {
    type: 'select',
    placeholder: 'Vorgesetzte:r',
    items: vorgesetzte.value,
  },
}))

const commentSchema = computed(() => ({
  kommentar: {
    type: 'textarea',
    placeholder: 'Zusätzliche Kommentare oder Anmerkungen...',
    rows: 4,
  },
}))

onMounted(async () => {
  await Promise.all([
    fetchBereiche(),
    fetchData('sachbereiche', sachbereiche),
    fetchTeams(),
    fetchFunktionen(), // Use custom function for admin endpoint
    fetchData('vorgesetzte', vorgesetzte),
    // Position is now a text field, no API data needed
  ])
})

const germanLocale = {
  formatLocale: {
    firstDayOfWeek: 1,
    months: [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ],
    monthsShort: [
      'Jan',
      'Feb',
      'Mär',
      'Apr',
      'Mai',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Okt',
      'Nov',
      'Dez',
    ],
    weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    weekdaysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  },
}

watch(
  () => ju.value.updateType,
  (newValue) => {
    if (newValue === 'Eintritt') {
      ju.value.itUserName = null
      ju.value.verlaengerungbis = null
      ju.value.austritt_zum = null
      ju.value.wechsel_zum = null
      ju.value.aenderung_zum = null
    } else if (newValue === 'Verlängerung') {
      ju.value.eintritt = null
      ju.value.frist = null
      ju.value.austritt_zum = null
      ju.value.wechsel_zum = null
      ju.value.aenderung_zum = null
    } else if (newValue === 'Austritt') {
      ju.value.eintritt = null
      ju.value.frist = null
      ju.value.verlaengerungbis = null
      ju.value.wechsel_zum = null
      ju.value.aenderung_zum = null
    } else if (newValue === 'Wechsel') {
      ju.value.eintritt = null
      ju.value.frist = null
      ju.value.verlaengerungbis = null
      ju.value.austritt_zum = null
      ju.value.aenderung_zum = null
    } else if (newValue === 'Änderung') {
      ju.value.eintritt = null
      ju.value.frist = null
      ju.value.verlaengerungbis = null
      ju.value.austritt_zum = null
      ju.value.wechsel_zum = null
    } else {
      ju.value.verlaengerungbis = null
      ju.value.austritt_zum = null
      ju.value.wechsel_zum = null
      ju.value.aenderung_zum = null
    }
  },
)
</script>

<template>
  <hr class="shadow-line" />
  <div class="viewport" :class="{ 'custom-function-active': showCustomFunction }">
    <Vueform v-model="ju" ref="basedata" :schema="formSchema" :sync="true" />

    <div class="date-picker-section">
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

    <!-- Kommentar field moved below date pickers -->
    <div class="comment-section">
      <Vueform v-model="ju" :schema="commentSchema" :sync="true" />
    </div>

    <hr class="shadow-line" />

    <div class="buttons-row">
      <button
        v-if="userStore.role === 'fach' || userStore.role === 'admin'"
        @click="$emit('show-ref')"
      >
        Referenzprofil →
      </button>
      <button
        v-if="userStore.role === 'pm'"
        @click="
          (() => console.log('Gespeicherte Parameter: ', { ...ju }),
          clearCache(),
          $refs.basedata.reset())
        "
      >
        Absenden
      </button>
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

:deep(.vf-input-field) {
  border: none !important;
  box-shadow: none !important;
}

/* Fix spacing between Funktion field and button - make button fill column width */
:deep(#funktionAddButton) {
  margin-left: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* Force stacking at 767px and below (mobile breakpoint) */
@media (max-width: 767px) {
  :deep(.vf-col-11.vf-col-tablet-11),
  :deep(.vf-col-12.vf-col-sm-12.vf-col-tablet-11) {
    flex-basis: 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  :deep(.vf-col-1.vf-col-tablet-1),
  :deep(.vf-col-12.vf-col-sm-12.vf-col-tablet-1) {
    flex-basis: 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Change button text to 'Funktion bearbeiten' on mobile */
  :deep(#funktionAddButton) {
    font-size: 0 !important; /* Hide original icon text */
  }

  :deep(#funktionAddButton)::before {
    content: 'Funktion bearbeiten' !important;
    font-size: 1rem !important;
    display: inline !important;
  }
}

:deep(input) {
  color: var(--color-text) !important;
  background: transparent !important;
  border: 2px solid var(--color-border) !important;
  border-radius: 0.5rem !important;
  padding: 0.4rem 0.65rem !important;
  height: 2.125rem !important;
  line-height: 1.4 !important;
  font-family: Arial, sans-serif !important;
  font-size: 1rem !important;
  box-sizing: border-box !important;
  outline: none !important;
}

:deep(input:focus) {
  border-color: var(--color-border) !important;
  box-shadow: 0 0 6px 0px var(--color-button) !important;
}

:deep(.vf-floating-label) {
  background: var(--color-background) !important;
  color: var(--color-text) !important;
}

:deep(.vf-native-select) {
  background: var(--color-background) !important;
  color: var(--color-text) !important;
}

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

:deep(.mx-datepicker) {
  width: 100%;
}

:deep(.mx-input) {
  background: var(--color-background) !important;
  color: var(--color-text) !important;
  border: 1px solid var(--vf-border-color-input) !important;
  border-radius: var(--vf-radius-input) !important;
  padding: var(--vf-py-input) var(--vf-px-input) !important;
  height: var(--vf-min-height-input) !important;
  line-height: var(--vf-line-height) !important;
  font-family: inherit !important;
  font-size: var(--vf-font-size) !important;
  box-sizing: border-box !important;
  box-shadow: var(--vf-shadow-input) !important;
  outline: none !important;
}

:deep(.mx-input::placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

:deep(.mx-input::-webkit-input-placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

:deep(.mx-input::-moz-placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

:deep(.mx-input:-ms-input-placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

:deep(.mx-input:-moz-placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

.date-picker-section :deep(.mx-input::placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

.custom-datepicker :deep(.mx-input::placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

/* Calendar icons should match dropdown arrow colors */
:deep(.mx-icon-calendar) {
  color: var(--color-text) !important;
  opacity: 1 !important;
}

:deep(.mx-icon-calendar svg) {
  fill: currentColor !important;
}

:deep(.mx-input:focus) {
  outline: none !important;
  border-color: var(--vf-border-color-input-focus) !important;
  box-shadow: var(--vf-shadow-input-focus) !important;
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

/* Calendar header styling - comprehensive approach */
:deep(.mx-datepicker-popup .mx-calendar-header),
:deep(.mx-datepicker-popup .mx-time-header),
:deep(.mx-calendar-header),
:deep(.mx-time-header),
:deep(.mx-calendar-header > *),
:deep(.mx-calendar-header-label),
:deep(.mx-calendar-decade-separator),
:deep(.mx-btn-text),
:deep(.mx-calendar-header .mx-btn),
:deep(.mx-calendar-header .mx-btn-text) {
  background-color: var(--color-button) !important;
  background: var(--color-button) !important;
  color: white !important;
}

/* Additional specific targeting */
.date-picker-section :deep(.mx-calendar-header),
.date-picker-section :deep(.mx-time-header) {
  background-color: var(--color-button) !important;
  background: var(--color-button) !important;
  color: white !important;
}

.date-picker-section :deep(.mx-calendar-header *),
.date-picker-section :deep(.mx-time-header *) {
  background-color: var(--color-button) !important;
  background: var(--color-button) !important;
  color: white !important;
}

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

/* Force header styling on popup elements with highest specificity */
:deep(.mx-datepicker-popup) {
  --mx-primary-color: var(--color-button) !important;
}

:deep(.mx-datepicker-popup .mx-calendar-header),
:deep(.mx-datepicker-popup .mx-time-header) {
  background-color: var(--color-button) !important;
  background: var(--color-button) !important;
  color: white !important;
}

:deep(.mx-datepicker-popup .mx-calendar-header .mx-btn),
:deep(.mx-datepicker-popup .mx-calendar-header .mx-btn-text),
:deep(.mx-datepicker-popup .mx-time-header .mx-btn),
:deep(.mx-datepicker-popup .mx-time-header .mx-btn-text) {
  background-color: var(--color-button) !important;
  background: var(--color-button) !important;
  color: white !important;
}

/* Override any inline styles or component-specific styles */
:deep(.mx-calendar-header[style]),
:deep(.mx-time-header[style]) {
  background-color: var(--color-button) !important;
  background: var(--color-button) !important;
  color: white !important;
}

.custom-datepicker {
  --mx-primary-color: var(--color-button);
  --mx-text-color-primary: white;
}

/* Global override for all mx-datepicker components */
:deep(.mx-datepicker) {
  --mx-primary-color: var(--color-button);
  --mx-text-color-primary: white;
}

/* Direct targeting of mx-datepicker CSS variables */
.date-picker-section {
  --mx-primary-color: var(--color-button);
  --mx-text-color-primary: white;
}

/* Global CSS variables for mx-datepicker popup (set on body/html) */
:deep(body) {
  --mx-primary-color: var(--color-button);
  --mx-text-color-primary: white;
}

/* Make the edit icon larger and mirror it horizontally in the function button */
:deep(#funktionAddButton) {
  font-size: 1rem !important;
}

:deep(.vf-btn-right) {
  font-size: 1rem !important;
}

/* Mobile override for button transform - must come after the above rules */
@media (max-width: 767px) {
  :deep(#funktionAddButton) {
    transform: scaleX(1) !important; /* Override the mirror effect for mobile */
  }
}
</style>
