import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import adminService from '@/services/adminService'

export const useAdminStore = defineStore('admin', () => {
  // Data state
  const bereiche = ref([])
  const teams = ref([])
  const funktionen = ref([])
  const users = ref([])
  const roles = ref([])
  const profiles = ref([])
  const hardware = ref([
    {
      id: 1,
      name: 'Dell Laptop XPS 13',
      category_id: 1,
      category: 'Laptops',
      MaxAnzahl: 10,
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      category_id: 2,
      category: 'Smartphones',
      MaxAnzahl: 5,
    },
    {
      id: 3,
      name: 'Samsung Monitor 27"',
      category_id: 3,
      category: 'Monitore',
      MaxAnzahl: null,
    },
  ])
  const hardwareCategories = ref([
    {
      id: 1,
      name: 'Laptops',
      hardware_count: 1,
    },
    {
      id: 2,
      name: 'Smartphones',
      hardware_count: 1,
    },
    {
      id: 3,
      name: 'Monitore',
      hardware_count: 1,
    },
  ])
  const software = ref([
    {
      id: 1,
      name: 'Microsoft Office 365',
      manufacturer_id: 1,
      manufacturer: 'Microsoft',
      license_type: 'Subscription',
    },
    {
      id: 2,
      name: 'Adobe Creative Suite',
      manufacturer_id: 2,
      manufacturer: 'Adobe',
      license_type: 'Subscription',
    },
    {
      id: 3,
      name: 'Slack',
      manufacturer_id: 3,
      manufacturer: 'Slack Technologies',
      license_type: 'Per User',
    },
  ])
  const manufacturers = ref([
    {
      id: 1,
      name: 'Microsoft',
      software_count: 1,
    },
    {
      id: 2,
      name: 'Adobe',
      software_count: 1,
    },
    {
      id: 3,
      name: 'Slack Technologies',
      software_count: 1,
    },
  ])
  const orders = ref([])

  // Loading states
  const loading = reactive({
    bereiche: false,
    teams: false,
    funktionen: false,
    users: false,
    roles: false,
    profiles: false,
    hardware: false,
    categories: false,
    software: false,
    manufacturers: false,
    orders: false,
  })

  // Error states
  const errors = reactive({
    bereiche: null,
    teams: null,
    funktionen: null,
    users: null,
    roles: null,
    profiles: null,
    hardware: null,
    categories: null,
    software: null,
    manufacturers: null,
    orders: null,
  })

  // Generic CRUD operations
  const createLoadFunction = (entityName, dataRef, serviceMethod) => {
    return async () => {
      loading[entityName] = true
      errors[entityName] = null

      try {
        const response = await serviceMethod()
        dataRef.value = response
        return response
      } catch (error) {
        errors[entityName] = error.message || `Fehler beim Laden der ${entityName}`
        console.error(`Fehler beim Laden der ${entityName}:`, error)
        throw error
      } finally {
        loading[entityName] = false
      }
    }
  }

  const createCRUDOperations = (entityName, dataRef, serviceConfig) => {
    const load = createLoadFunction(entityName, dataRef, serviceConfig.getAll)

    const create = async (data) => {
      try {
        const newItem = await serviceConfig.create(data)
        dataRef.value.push(newItem)
        await load() // Reload to ensure consistency
        return newItem
      } catch (error) {
        console.error(`Fehler beim Erstellen von ${entityName}:`, error)
        throw error
      }
    }

    const update = async (id, data) => {
      try {
        const updatedItem = await serviceConfig.update(id, data)
        const index = dataRef.value.findIndex((item) => item.id === id || item.ID === id)
        if (index !== -1) {
          dataRef.value[index] = updatedItem
        }
        await load() // Reload to ensure consistency
        return updatedItem
      } catch (error) {
        console.error(`Fehler beim Aktualisieren von ${entityName}:`, error)
        throw error
      }
    }

    const remove = async (id) => {
      if (!confirm(`Sind Sie sicher, dass Sie diesen ${entityName} löschen möchten?`)) {
        return false
      }

      try {
        await serviceConfig.delete(id)
        dataRef.value = dataRef.value.filter((item) => item.id !== id && item.ID !== id)
        return true
      } catch (error) {
        console.error(`Fehler beim Löschen von ${entityName}:`, error)
        throw error
      }
    }

    return { load, create, update, remove }
  }

  // Bereiche CRUD - simplified version
  const bereicheOps = {
    load: async () => {
      try {
        const response = await adminService.getBereiche()
        bereiche.value = response || []
        return response
      } catch (error) {
        console.error('Fehler beim Laden der Bereiche:', error)
        // Keep existing mock data
        return bereiche.value
      }
    },
    create: async (data) => {
      try {
        const newItem = await adminService.createBereich(data)
        bereiche.value.push(newItem)
        return newItem
      } catch (error) {
        // Fallback: add to local store with mock ID
        const mockItem = { BereichID: Date.now(), ...data }
        bereiche.value.push(mockItem)
        console.error('Fehler beim Erstellen - Mock-Modus:', error)
        return mockItem
      }
    },
    update: async (id, data) => {
      try {
        const updatedItem = await adminService.updateBereich(id, data)
        const index = bereiche.value.findIndex((item) => item.BereichID === id)
        if (index !== -1) {
          bereiche.value[index] = updatedItem
        }
        return updatedItem
      } catch (error) {
        // Fallback: update local store
        const index = bereiche.value.findIndex((item) => item.BereichID === id)
        if (index !== -1) {
          bereiche.value[index] = { ...bereiche.value[index], ...data }
        }
        console.error('Fehler beim Update - Mock-Modus:', error)
        return bereiche.value[index]
      }
    },
    remove: async (id) => {
      if (!confirm('Sind Sie sicher, dass Sie diesen Bereich löschen möchten?')) {
        return false
      }
      try {
        await adminService.deleteBereich(id)
        bereiche.value = bereiche.value.filter((item) => item.BereichID !== id)
        return true
      } catch (error) {
        // Fallback: remove from local store
        bereiche.value = bereiche.value.filter((item) => item.BereichID !== id)
        console.error('Fehler beim Löschen - Mock-Modus:', error)
        return true
      }
    },
  }

  // Teams CRUD
  const teamsOps = {
    load: async () => {
      try {
        const response = await adminService.getTeams()
        teams.value = response || []
        return response
      } catch (error) {
        console.error('Fehler beim Laden der Teams:', error)
        if (teams.value.length === 0) {
          teams.value = [
            { TeamID: 1, Team: 'Development Team', BereichID: 1 },
            { TeamID: 2, Team: 'Marketing Team', BereichID: 2 },
            { TeamID: 3, Team: 'HR Team', BereichID: 3 },
          ]
        }
        return teams.value
      }
    },
    create: async (data) => {
      try {
        const newItem = await adminService.createTeam(data)
        teams.value.push(newItem)
        return newItem
      } catch (error) {
        const mockItem = { TeamID: Date.now(), ...data }
        teams.value.push(mockItem)
        console.error('Fehler beim Erstellen - Mock-Modus:', error)
        return mockItem
      }
    },
    update: async (id, data) => {
      try {
        const updatedItem = await adminService.updateTeam(id, data)
        const index = teams.value.findIndex((item) => item.TeamID === id)
        if (index !== -1) {
          teams.value[index] = updatedItem
        }
        return updatedItem
      } catch (error) {
        const index = teams.value.findIndex((item) => item.TeamID === id)
        if (index !== -1) {
          teams.value[index] = { ...teams.value[index], ...data }
        }
        console.error('Fehler beim Update - Mock-Modus:', error)
        return teams.value[index]
      }
    },
    remove: async (id) => {
      if (!confirm('Sind Sie sicher, dass Sie dieses Team löschen möchten?')) {
        return false
      }
      try {
        await adminService.deleteTeam(id)
        teams.value = teams.value.filter((item) => item.TeamID !== id)
        return true
      } catch (error) {
        teams.value = teams.value.filter((item) => item.TeamID !== id)
        console.error('Fehler beim Löschen - Mock-Modus:', error)
        return true
      }
    },
  }

  // Funktionen CRUD
  const funktionenOps = {
    load: async () => {
      try {
        const response = await adminService.getFunktionen()
        funktionen.value = response || []
        return response
      } catch (error) {
        console.error('Fehler beim Laden der Funktionen:', error)
        if (funktionen.value.length === 0) {
          funktionen.value = [
            { FunktionID: 1, Funktion: 'Software Developer' },
            { FunktionID: 2, Funktion: 'Marketing Manager' },
            { FunktionID: 3, Funktion: 'System Administrator' },
          ]
        }
        return funktionen.value
      }
    },
    create: async (data) => {
      try {
        const newItem = await adminService.createFunktion(data)
        funktionen.value.push(newItem)
        return newItem
      } catch (error) {
        const mockItem = { FunktionID: Date.now(), ...data }
        funktionen.value.push(mockItem)
        console.error('Fehler beim Erstellen - Mock-Modus:', error)
        return mockItem
      }
    },
    update: async (id, data) => {
      try {
        const updatedItem = await adminService.updateFunktion(id, data)
        const index = funktionen.value.findIndex((item) => item.FunktionID === id)
        if (index !== -1) {
          funktionen.value[index] = updatedItem
        }
        return updatedItem
      } catch (error) {
        const index = funktionen.value.findIndex((item) => item.FunktionID === id)
        if (index !== -1) {
          funktionen.value[index] = { ...funktionen.value[index], ...data }
        }
        console.error('Fehler beim Update - Mock-Modus:', error)
        return funktionen.value[index]
      }
    },
    remove: async (id) => {
      if (!confirm('Sind Sie sicher, dass Sie diese Funktion löschen möchten?')) {
        return false
      }
      try {
        await adminService.deleteFunktion(id)
        funktionen.value = funktionen.value.filter((item) => item.FunktionID !== id)
        return true
      } catch (error) {
        funktionen.value = funktionen.value.filter((item) => item.FunktionID !== id)
        console.error('Fehler beim Löschen - Mock-Modus:', error)
        return true
      }
    },
  }

  // Users CRUD
  const usersOps = {
    load: async (params = {}) => {
      try {
        const response = await adminService.getUsers(params)
        if (response.data) {
          users.value = response.data
          return response
        } else {
          users.value = response || []
          return { data: response, current_page: 1, last_page: 1 }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Users:', error)
        if (users.value.length === 0) {
          users.value = [
            {
              id: 1,
              name: 'Max Mustermann',
              email: 'max.mustermann@company.com',
              department: 'IT',
              role: 'Admin',
              status: 'active',
              lastActivity: new Date('2024-01-15T10:30:00'),
            },
            {
              id: 2,
              name: 'Anna Schmidt',
              email: 'anna.schmidt@company.com',
              department: 'HR',
              role: 'Manager',
              status: 'active',
              lastActivity: new Date('2024-01-14T16:45:00'),
            },
            {
              id: 3,
              name: 'Tom Weber',
              email: 'tom.weber@company.com',
              department: 'Marketing',
              role: 'Mitarbeiter',
              status: 'inactive',
              lastActivity: new Date('2024-01-10T09:15:00'),
            },
          ]
        }
        return { data: users.value, current_page: 1, last_page: 1 }
      }
    },
    create: async (data) => {
      try {
        const newItem = await adminService.createUser(data)
        users.value.push(newItem)
        return newItem
      } catch (error) {
        const mockItem = {
          id: Date.now(),
          ...data,
          lastActivity: new Date(),
        }
        users.value.push(mockItem)
        console.error('Fehler beim Erstellen - Mock-Modus:', error)
        return mockItem
      }
    },
    update: async (id, data) => {
      try {
        const updatedItem = await adminService.updateUser(id, data)
        const index = users.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          users.value[index] = updatedItem
        }
        return updatedItem
      } catch (error) {
        const index = users.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...data }
        }
        console.error('Fehler beim Update - Mock-Modus:', error)
        return users.value[index]
      }
    },
    remove: async (id) => {
      try {
        await adminService.deleteUser(id)
        users.value = users.value.filter((item) => item.id !== id)
        return true
      } catch (error) {
        users.value = users.value.filter((item) => item.id !== id)
        console.error('Fehler beim Löschen - Mock-Modus:', error)
        return true
      }
    },
  }

  // Hardware CRUD
  const hardwareOps = {
    load: async (params = {}) => {
      try {
        const response = await adminService.getHardwareItems(params)
        if (response && response.data) {
          hardware.value = response.data
          return response
        } else {
          hardware.value = response || []
          return { data: response, current_page: 1, last_page: 1 }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Hardware:', error)
        if (!Array.isArray(hardware.value) || hardware.value.length === 0) {
          hardware.value = [
            {
              id: 1,
              name: 'Dell Laptop XPS 13',
              category_id: 1,
              category: 'Laptops',
              MaxAnzahl: 10,
            },
            {
              id: 2,
              name: 'iPhone 15 Pro',
              category_id: 2,
              category: 'Smartphones',
              MaxAnzahl: 5,
            },
            {
              id: 3,
              name: 'Samsung Monitor 27"',
              category_id: 3,
              category: 'Monitore',
              MaxAnzahl: null,
            },
          ]
        }
        return hardware.value
      }
    },
    create: async (data) => {
      try {
        const newItem = await adminService.createHardwareItem(data)
        hardware.value.push(newItem)
        return newItem
      } catch (error) {
        const mockItem = {
          id: Date.now(),
          ...data,
        }
        hardware.value.push(mockItem)
        console.error('Fehler beim Erstellen - Mock-Modus:', error)
        return mockItem
      }
    },
    update: async (id, data) => {
      try {
        const updatedItem = await adminService.updateHardwareItem(id, data)
        const index = hardware.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          hardware.value[index] = updatedItem
        }
        return updatedItem
      } catch (error) {
        const index = hardware.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          hardware.value[index] = { ...hardware.value[index], ...data }
        }
        console.error('Fehler beim Update - Mock-Modus:', error)
        return hardware.value[index]
      }
    },
    remove: async (id) => {
      if (!confirm('Sind Sie sicher, dass Sie diese Hardware löschen möchten?')) {
        return false
      }
      try {
        await adminService.deleteHardwareItem(id)
        hardware.value = hardware.value.filter((item) => item.id !== id)
        return true
      } catch (error) {
        hardware.value = hardware.value.filter((item) => item.id !== id)
        console.error('Fehler beim Löschen - Mock-Modus:', error)
        return true
      }
    },
  }

  // Hardware Categories CRUD
  const categoriesOps = {
    load: async () => {
      try {
        const response = await adminService.getHardwareCategories()
        hardwareCategories.value = response || []
        return response
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error)
        if (!Array.isArray(hardwareCategories.value) || hardwareCategories.value.length === 0) {
          hardwareCategories.value = [
            {
              id: 1,
              name: 'Laptops',
              hardware_count: 1,
            },
            {
              id: 2,
              name: 'Smartphones',
              hardware_count: 1,
            },
            {
              id: 3,
              name: 'Monitore',
              hardware_count: 1,
            },
          ]
        }
        return hardwareCategories.value
      }
    },
    create: async (data) => {
      try {
        const response = await adminService.createHardwareCategory(data)
        // response = { message: '...', category: { id, name, hardware_count } }
        const newItem = response.category

        if (!newItem) {
          throw new Error('Invalid response structure: no category field')
        }

        // The backend already returns the correct structure
        const categoryItem = {
          id: newItem.id,
          name: newItem.name,
          hardware_count: newItem.hardware_count || 0,
        }

        hardwareCategories.value.push(categoryItem)
        console.log('Category added to store:', categoryItem)
        console.log('Current categories:', hardwareCategories.value)
        return categoryItem
      } catch (error) {
        const mockItem = {
          id: Date.now(),
          name: data.name,
          hardware_count: 0,
        }
        hardwareCategories.value.push(mockItem)
        console.log('Mock category added to store:', mockItem)
        console.log('Current categories (mock):', hardwareCategories.value)
        console.error('Fehler beim Erstellen - Mock-Modus:', error)
        return mockItem
      }
    },
    update: async (id, data) => {
      try {
        const response = await adminService.updateHardwareCategory(id, data)
        const updatedItem = response.category

        if (!updatedItem) {
          throw new Error('Invalid response structure: no category field')
        }

        const categoryItem = {
          id: updatedItem.id,
          name: updatedItem.name,
          hardware_count: updatedItem.hardware_count || 0,
        }

        const index = hardwareCategories.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          hardwareCategories.value[index] = categoryItem
        }
        return categoryItem
      } catch (error) {
        const index = hardwareCategories.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          const updatedItem = {
            ...hardwareCategories.value[index],
            name: data.name,
            ...data,
          }
          hardwareCategories.value[index] = updatedItem
        }
        console.error('Fehler beim Update - Mock-Modus:', error)
        return hardwareCategories.value[index]
      }
    },
    remove: async (id) => {
      if (!confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) {
        return false
      }
      try {
        await adminService.deleteHardwareCategory(id)
        hardwareCategories.value = hardwareCategories.value.filter((item) => item.id !== id)
        return true
      } catch (error) {
        hardwareCategories.value = hardwareCategories.value.filter((item) => item.id !== id)
        console.error('Fehler beim Löschen - Mock-Modus:', error)
        return true
      }
    },
  }

  // Software CRUD
  const softwareOps = {
    load: async (params = {}) => {
      try {
        const response = await adminService.getSoftwareItems(params)
        if (response && response.data) {
          software.value = response.data
          return response
        } else {
          software.value = response || []
          return { data: response, current_page: 1, last_page: 1 }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Software:', error)
        if (!Array.isArray(software.value) || software.value.length === 0) {
          software.value = [
            {
              id: 1,
              name: 'Microsoft Office 365',
              manufacturer_id: 1,
              manufacturer: 'Microsoft',
              license_type: 'Subscription',
            },
            {
              id: 2,
              name: 'Adobe Creative Suite',
              manufacturer_id: 2,
              manufacturer: 'Adobe',
              license_type: 'Subscription',
            },
            {
              id: 3,
              name: 'Slack',
              manufacturer_id: 3,
              manufacturer: 'Slack Technologies',
              license_type: 'Per User',
            },
          ]
        }
        return software.value
      }
    },
    create: async (data) => {
      try {
        const newItem = await adminService.createSoftwareItem(data)
        software.value.push(newItem)
        return newItem
      } catch (error) {
        const mockItem = {
          id: Date.now(),
          ...data,
        }
        software.value.push(mockItem)
        console.error('Fehler beim Erstellen - Mock-Modus:', error)
        return mockItem
      }
    },
    update: async (id, data) => {
      try {
        const updatedItem = await adminService.updateSoftwareItem(id, data)
        const index = software.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          software.value[index] = updatedItem
        }
        return updatedItem
      } catch (error) {
        const index = software.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          software.value[index] = { ...software.value[index], ...data }
        }
        console.error('Fehler beim Update - Mock-Modus:', error)
        return software.value[index]
      }
    },
    remove: async (id) => {
      if (!confirm('Sind Sie sicher, dass Sie diese Software löschen möchten?')) {
        return false
      }
      try {
        await adminService.deleteSoftwareItem(id)
        software.value = software.value.filter((item) => item.id !== id)
        return true
      } catch (error) {
        software.value = software.value.filter((item) => item.id !== id)
        console.error('Fehler beim Löschen - Mock-Modus:', error)
        return true
      }
    },
  }

  // Manufacturers CRUD
  const manufacturersOps = {
    load: async () => {
      try {
        const response = await adminService.getSoftwareManufacturers()
        manufacturers.value = response || []
        return response
      } catch (error) {
        console.error('Fehler beim Laden der Hersteller:', error)
        if (!Array.isArray(manufacturers.value) || manufacturers.value.length === 0) {
          manufacturers.value = [
            {
              id: 1,
              name: 'Microsoft',
              software_count: 1,
            },
            {
              id: 2,
              name: 'Adobe',
              software_count: 1,
            },
            {
              id: 3,
              name: 'Slack Technologies',
              software_count: 1,
            },
          ]
        }
        return manufacturers.value
      }
    },
    create: async (data) => {
      try {
        const newItem = await adminService.createSoftwareManufacturer(data)
        manufacturers.value.push(newItem)
        return newItem
      } catch (error) {
        const mockItem = {
          id: Date.now(),
          ...data,
          software_count: 0,
        }
        manufacturers.value.push(mockItem)
        console.error('Fehler beim Erstellen - Mock-Modus:', error)
        return mockItem
      }
    },
    update: async (id, data) => {
      try {
        const updatedItem = await adminService.updateSoftwareManufacturer(id, data)
        const index = manufacturers.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          manufacturers.value[index] = updatedItem
        }
        return updatedItem
      } catch (error) {
        const index = manufacturers.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          manufacturers.value[index] = { ...manufacturers.value[index], ...data }
        }
        console.error('Fehler beim Update - Mock-Modus:', error)
        return manufacturers.value[index]
      }
    },
    remove: async (id) => {
      if (!confirm('Sind Sie sicher, dass Sie diesen Hersteller löschen möchten?')) {
        return false
      }
      try {
        await adminService.deleteSoftwareManufacturer(id)
        manufacturers.value = manufacturers.value.filter((item) => item.id !== id)
        return true
      } catch (error) {
        manufacturers.value = manufacturers.value.filter((item) => item.id !== id)
        console.error('Fehler beim Löschen - Mock-Modus:', error)
        return true
      }
    },
  }

  // Initialize all data
  const initializeAll = async () => {
    const operations = [
      bereicheOps.load(),
      teamsOps.load(),
      funktionenOps.load(),
      usersOps.load(),
      hardwareOps.load(),
      categoriesOps.load(),
      softwareOps.load(),
      manufacturersOps.load(),
    ]

    try {
      await Promise.allSettled(operations)
    } catch (error) {
      console.error('Fehler beim Initialisieren der Admin-Daten:', error)
    }
  }

  return {
    // Data
    bereiche,
    teams,
    funktionen,
    users,
    hardware,
    hardwareCategories,
    software,
    manufacturers,

    // States
    loading,
    errors,

    // Operations
    bereicheOps,
    teamsOps,
    funktionenOps,
    usersOps,
    hardwareOps,
    categoriesOps,
    softwareOps,
    manufacturersOps,

    // Utils
    initializeAll,

    // Service access
    adminService,
  }
})
