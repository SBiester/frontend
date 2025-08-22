// Pinia-Store für Benutzerinformationen
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    role: null // Hier wird die Rolle aus dem AD gespeichert
  }),
  actions: {
    setUserRole(role) {
      this.role = role;
    }
  }
});