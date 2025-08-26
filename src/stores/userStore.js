// Pinia-Store für Benutzerinformationen
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    role: 'fach'
  }),
  actions: {
    setUserRole(role) {
      this.role = role;
    },
    switchRole() {
      if (this.role === 'fach') {
        this.role = 'pm';
      } else {
        this.role = 'fach';
      }
    }
  }
});