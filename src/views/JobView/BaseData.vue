<script setup>

  import { FormSteps } from '@vueform/vueform';
import { onMounted, ref, reactive, watch, computed } from 'vue'

  // const ju = reactive({
  //   employerType: true,
  //   updateType: null,
  //   itUserName: null,
  //   vorname: null,
  //   nachname: null,
  //   bereich: null,
  //   funktion: null,
  //   vorgesetzt: null,
  //   eintritt: null,
  //   frist: null,
  // })
  const { ju } = defineProps({
    ju: Object
  })

  function submit() {
    console.log('Gespeicherte Parameter: ', { ...ju } )
  };

  watch(() => ju.updateType, (newValue, oldValue) => {
    console.log('ju.updateType changed from', oldValue, 'to', newValue);
    if (newValue === 'Eintritt') {
      ju.itUserName = null;
    }
  });

  const showItUserNameField = computed(() => {
    const shouldShow = ju.updateType === 'Verlängerung' || ju.updateType === 'Wechsel' || ju.updateType === 'Änderung' || ju.updateType === 'Austritt';
    return shouldShow;
  });

  function customFormat(date) {
    if (!date) return '';
    return format(date, 'dd.MM.yyyy', { locale: de });
  }

  

</script>

<template>
  <hr class="shadow-line" />

    <Vueform :model-value="ju" @update:model-value="ju = $event" :sync="true">

      <group-element name="pers_daten">

        <text-element
          :model-value="ju.vorname"
          @update:model-value="ju.vorname = $event"
          name="vorname"
          placeholder="Vorname"
          rules="required"
        />

        <text-element
          :model-value="ju.nachname"
          @update:model-value="ju.nachname = $event"
          name="nachname"
          placeholder="Nachname"
          rules="required"
        />
      </group-element>

      <hr class="shadow-line" />

      <toggle-element
        class="toggle-element"
        name="employerType"
        :model-value="ju.employerType"
        @update:model-value="ju.employerType = $event"
        :labels="{ on: 'intern', off: 'extern' }"
      />

      <hr class="shadow-line" />

      <radiogroup-element
        name="updateType"
        :items="['Eintritt', 'Verlängerung', 'Wechsel', 'Änderung', 'Austritt']"
        view="tabs"
        v-model="ju.updateType"
      />

      <Transition name="slide-fade">
        <group-element name="it_user_data" v-if="showItUserNameField">
          <hr class="shadow-line" />
          <text-element
            name="itUserName"
            placeholder="IT Benutzername"
            v-model="ju.itUserName"
          />
        </group-element>
      </Transition>

      <hr class="shadow-line" />

      <select-element
        v-model="ju.bereich"
        placeholder="Bereich / Sachbereich / Team"
        name="bereich"
        :items="['TK', 'IT', 'PM']"
      />

      <select-element
        :model-value="ju.funktion"
        placeholder="Funktion"
        @update:model-value="ju.funktion = $event"
        name="funktion"
        :items="['Projektleiter', 'Entwickler']"
      />

      <select-element
        :model-value="ju.vorgesetzt"
        placeholder="Vorgesetzte:r"
        @update:model-value="ju.vorgesetzt = $event"
        name="vorgesetzt"
        :items="['Wehmann Frank', 'Baumgart Christian']"
      />

      <hr class="shadow-line" />

      <date-element
        :model-value="ju.eintritt"
        placeholder="Eintritt zum:"
        @update:model-value="ju.eintritt = $event"
        name="eintritt"
        :custom-format="customFormat"
      />

      <date-element
        :model-value="ju.frist"
        placeholder="Befristet bis:"
        @update:model-value="ju.frist = $event"
        name="frist"
        :custom-format="customFormat"
      />

      <hr class="shadow-line" />

      <button-element @click="submit" name="submit">absenden</button-element>

    </Vueform>

</template>

<style scoped>  

  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.5s ease;
    overflow: hidden;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .slide-fade-enter-to,
  .slide-fade-leave-from {
    max-height: 1000px;
    opacity: 1;
  }

  input {
    width: 100%;
    height: 2rem;
    border: 0.1rem solid var(--color-border);
    border-radius: 0.2rem;
  }

  .toggle-container {
    width: 100%;
    margin-bottom: 20px;
  }

  

  .toggle-element {
    display: flex;
    --toggle-bg-on: #007a8c;
    --toggle-bg-off: #78c6bf;
    --toggle-border-on: #007a8c;
    --toggle-border-off: #78c6bf;
    --toggle-font-size: 1rem !important;
  }

  .full-width-toggle:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  .list-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-button);
    border-radius: 0.2rem;
    margin: 0.2rem;
    padding: 0.4rem;
  }

  .list-group {
    user-select: none;
  }

  .delete-button {
    background: none !important;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    margin-left: 10px;
  }

  /* Portrait */
  @media screen and (orientation: portrait) {
    ::v-deep(.full-width-toggle) {
      --toggle-width: 40vw !important;
      --toggle-height: 2.5rem !important;
    }
  }

  /* Landscape */
  @media screen and (orientation: landscape) and (pointer: fine) {
    ::v-deep(.full-width-toggle) {
      --toggle-width: 20vw !important;
      --toggle-height: 2rem !important;
    }

    ::v-deep(.toggle-container) {
      max-width: fit-content;
      margin-inline: auto !important;
    }
  }

  @media screen and (orientation: landscape) and (pointer: coarse) {
    ::v-deep(.full-width-toggle) {
      --toggle-width: 20vw !important;
      --toggle-height: 2rem !important;
    }
  }

  ::v-deep(.vf-tabs-tab-label) {
    white-space: normal !important;
    word-break: break-word !important;
    text-align: center !important;
  }
  
</style>
