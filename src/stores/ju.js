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
    vorgesetzt: null,
    eintritt: null,
    frist: null,
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
      vorgesetzt: null,
      eintritt: null,
      frist: null,
    })
  }

  return { ju, resetJu }
})
