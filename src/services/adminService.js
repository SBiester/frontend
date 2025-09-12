import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

class AdminService {
  // Dashboard
  async getDashboardStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`)
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  // User Management
  async getUsers(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  async createUser(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/users`, userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async deleteUser(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // Hardware Management
  async getHardwareItems(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/hardware`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching hardware items:', error)
      throw error
    }
  }

  async createHardwareItem(hardwareData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/hardware`, hardwareData)
      return response.data
    } catch (error) {
      console.error('Error creating hardware item:', error)
      throw error
    }
  }

  async updateHardwareItem(id, hardwareData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/hardware/${id}`, hardwareData)
      return response.data
    } catch (error) {
      console.error('Error updating hardware item:', error)
      throw error
    }
  }

  async deleteHardwareItem(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/hardware/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting hardware item:', error)
      throw error
    }
  }

  // Hardware Categories Management
  async getHardwareCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/hardware/categories`)
      return response.data
    } catch (error) {
      console.error('Error fetching hardware categories:', error)
      throw error
    }
  }

  async createHardwareCategory(categoryData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/hardware/categories`, categoryData)
      return response.data
    } catch (error) {
      console.error('Error creating hardware category:', error)
      throw error
    }
  }

  async updateHardwareCategory(id, categoryData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/hardware/categories/${id}`, categoryData)
      return response.data
    } catch (error) {
      console.error('Error updating hardware category:', error)
      throw error
    }
  }

  async deleteHardwareCategory(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/hardware/categories/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting hardware category:', error)
      throw error
    }
  }

  // Software Management
  async getSoftwareItems(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/software`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching software items:', error)
      throw error
    }
  }

  async createSoftwareItem(softwareData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/software`, softwareData)
      return response.data
    } catch (error) {
      console.error('Error creating software item:', error)
      throw error
    }
  }

  async updateSoftwareItem(id, softwareData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/software/${id}`, softwareData)
      return response.data
    } catch (error) {
      console.error('Error updating software item:', error)
      throw error
    }
  }

  async deleteSoftwareItem(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/software/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting software item:', error)
      throw error
    }
  }

  // Software Manufacturers Management
  async getSoftwareManufacturers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/software/manufacturers`)
      return response.data
    } catch (error) {
      console.error('Error fetching software manufacturers:', error)
      throw error
    }
  }

  async createSoftwareManufacturer(manufacturerData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/software/manufacturers`, manufacturerData)
      return response.data
    } catch (error) {
      console.error('Error creating software manufacturer:', error)
      throw error
    }
  }

  async updateSoftwareManufacturer(id, manufacturerData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/software/manufacturers/${id}`, manufacturerData)
      return response.data
    } catch (error) {
      console.error('Error updating software manufacturer:', error)
      throw error
    }
  }

  async deleteSoftwareManufacturer(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/software/manufacturers/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting software manufacturer:', error)
      throw error
    }
  }

  // SAP Management
  async getSapRoles(params = {}) {
    try {
      // Fetch all pages of SAP roles
      let allRoles = []
      let currentPage = 1
      let lastPage = 1
      
      do {
        const response = await axios.get(`${API_BASE_URL}/admin/sap/roles`, { 
          params: { ...params, page: currentPage } 
        })
        
        if (response.data.data) {
          allRoles = [...allRoles, ...response.data.data]
          lastPage = response.data.last_page || 1
          currentPage++
        } else {
          // Handle non-paginated response
          return response.data
        }
      } while (currentPage <= lastPage)
      
      // Return data in the same structure but with all items
      return {
        data: allRoles,
        total: allRoles.length
      }
    } catch (error) {
      console.error('Error fetching SAP roles:', error)
      throw error
    }
  }

  async getSapRoleGroups() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/sap/groups`)
      return response.data
    } catch (error) {
      console.error('Error fetching SAP role groups:', error)
      throw error
    }
  }

  async createSapRole(roleData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/sap/roles`, roleData)
      return response.data
    } catch (error) {
      console.error('Error creating SAP role:', error)
      throw error
    }
  }

  async updateSapRole(id, roleData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/sap/roles/${id}`, roleData)
      return response.data
    } catch (error) {
      console.error('Error updating SAP role:', error)
      throw error
    }
  }

  async deleteSapRole(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/sap/roles/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting SAP role:', error)
      throw error
    }
  }

  async createSapRoleGroup(groupData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/sap/groups`, groupData)
      return response.data
    } catch (error) {
      console.error('Error creating SAP role group:', error)
      throw error
    }
  }

  async updateSapRoleGroup(id, groupData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/sap/groups/${id}`, groupData)
      return response.data
    } catch (error) {
      console.error('Error updating SAP role group:', error)
      throw error
    }
  }

  async deleteSapRoleGroup(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/sap/groups/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting SAP role group:', error)
      throw error
    }
  }

  // Profile Management
  async getProfiles(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/profiles`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching profiles:', error)
      throw error
    }
  }

  async createProfile(profileData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/profiles`, profileData)
      return response.data
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  async updateProfile(id, profileData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/profiles/${id}`, profileData)
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  async deleteProfile(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/profiles/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting profile:', error)
      throw error
    }
  }

  // Master Data Management
  async getBereiche() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/bereiche`)
      return response.data
    } catch (error) {
      console.error('Error fetching bereiche:', error)
      throw error
    }
  }

  async createBereich(bereichData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/bereiche`, bereichData)
      return response.data
    } catch (error) {
      console.error('Error creating bereich:', error)
      throw error
    }
  }

  async updateBereich(id, bereichData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/bereiche/${id}`, bereichData)
      return response.data
    } catch (error) {
      console.error('Error updating bereich:', error)
      throw error
    }
  }

  async deleteBereich(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/bereiche/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting bereich:', error)
      throw error
    }
  }

  async getTeams() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/teams`)
      return response.data
    } catch (error) {
      console.error('Error fetching teams:', error)
      throw error
    }
  }

  async createTeam(teamData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/teams`, teamData)
      return response.data
    } catch (error) {
      console.error('Error creating team:', error)
      throw error
    }
  }

  async updateTeam(id, teamData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/teams/${id}`, teamData)
      return response.data
    } catch (error) {
      console.error('Error updating team:', error)
      throw error
    }
  }

  async deleteTeam(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/teams/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting team:', error)
      throw error
    }
  }

  async getFunktionen() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/funktionen`)
      return response.data
    } catch (error) {
      console.error('Error fetching funktionen:', error)
      throw error
    }
  }

  async createFunktion(funktionData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/funktionen`, funktionData)
      return response.data
    } catch (error) {
      console.error('Error creating funktion:', error)
      throw error
    }
  }

  async updateFunktion(id, funktionData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/funktionen/${id}`, funktionData)
      return response.data
    } catch (error) {
      console.error('Error updating funktion:', error)
      throw error
    }
  }

  async deleteFunktion(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/funktionen/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting funktion:', error)
      throw error
    }
  }
}

export default new AdminService()