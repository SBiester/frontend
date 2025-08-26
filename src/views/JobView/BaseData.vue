<script setup>

import { onMounted, ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia';

import { useJuStore } from '@/stores/ju'
import { useUserStore } from '@/stores/userStore'

import { useStoreCookieSync } from '@/components/useStoreCookieSync'

const juStore = useJuStore();
const { ju } = storeToRefs(juStore);

const { clearCache } = useStoreCookieSync(juStore, 'juStore');

const userStore = useUserStore();

const emit = defineEmits(['show-equip']);

const bereiche = ref([]);
const sachbereiche = ref([]);
const teams = ref([]);
const funktionen = ref([]);
const vorgesetzte = ref([]);

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
    view: 'tabs',
    items: ['Eintritt', 'Verlängerung', 'Wechsel', 'Änderung', 'Austritt']
  },
  it_user_data: {
    type: 'group',
    conditions: [['updateType', 'in', ['Verlängerung', 'Wechsel', 'Änderung', 'Austritt']]],
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
    placeholder: 'Sachbereich',
    items: sachbereiche.value,
    columns: { default: 12, tablet: 4 }
  },
  team: {
    type: 'select',
    placeholder: 'Team',
    items: teams.value,
    columns: { default: 12, tablet: 4 }
  },
  funktion: {
    type: 'select',
    placeholder: 'Funktion',
    items: funktionen.value
  },
  vorgesetzt: {
    type: 'select',
    placeholder: 'Vorgesetzte:r',
    items: vorgesetzte.value
  },
  eintritt: {
    type: 'date',
    transfer: true,
    placeholder: 'Eintritt zum:',
    columns: { default: 12, tablet: 6 }
  },
  frist: {
    type: 'date',
    transfer: true,
    placeholder: 'Befristet bis:',
    columns: { default: 12, tablet: 6 }
  }
}));

onMounted(async () => {
  await Promise.all([
    fetchData('bereiche', bereiche),
    fetchData('sachbereiche', sachbereiche),
    fetchData('teams', teams),
    fetchData('funktionen', funktionen),
    fetchData('vorgesetzte', vorgesetzte)
  ]);
});

watch(() => ju.value.updateType, (newValue) => {
  if (newValue === 'Eintritt') {
    ju.value.itUserName = null;
  }
});

</script>

<template>
  <div>
    <Vueform
      v-model="ju"
      ref="basedata"
      :schema="formSchema"
      :sync="true"
    />

    <hr class="shadow-line" />

    <div class="buttons-row">
        <button v-if="userStore.role === 'fach'" @click="$emit('show-equip')">Weiter</button>
        <button v-if="userStore.role === 'pm'" @click="() => console.log('Gespeicherte Parameter: ', { ...ju }), clearCache(), this.$refs.basedata.reset()">Absenden</button>
    </div>
  </div>
</template>

<style scoped>
.buttons-row {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}
</style>