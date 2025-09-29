import SapProfiles from '@/views/JobView/SapProfiles.vue'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useJuStore = defineStore('ju', () => {
  const ju = reactive({
    employerType: true,
    updateType: null,
    itUserName: null,
    vorname: null,
    nachname: null,
    bereich: null,
    sachbereich: null,
    team: null,
    funktion: null,
    position: null,
    vorgesetzt: null,
    eintritt: null,
    frist: null,
    verlaengerungbis: null,
    austritt_zum: null,
    wechsel_zum: null,
    aenderung_zum: null,
    refprofil: [],
    additionalHardware: [],
    additionalSoftware: [],
    additionalOptions: {
      telefonnummer: false,
      tuerschild: false,
      visitenkarten: false,
      telefontyp: null,
    },
    selectedSap: false,
    sapProfiles: [],
    kommentar: null,
  })

  function resetJu() {
    Object.assign(ju, {
      employerType: true,
      updateType: null,
      itUserName: null,
      vorname: null,
      nachname: null,
      bereich: null,
      sachbereich: null,
      team: null,
      funktion: null,
      position: null,
      vorgesetzt: null,
      eintritt: null,
      frist: null,
      verlaengerungbis: null,
      austritt_zum: null,
      wechsel_zum: null,
      aenderung_zum: null,
      refprofil: [],
      additionalHardware: [],
      additionalSoftware: [],
      additionalOptions: {
        telefonnummer: false,
        tuerschild: false,
        visitenkarten: false,
        telefontyp: null,
      },
      selectedSap: false,
      sapProfiles: [],
      kommentar: null,
    })
  }

  return { ju, resetJu }
})
