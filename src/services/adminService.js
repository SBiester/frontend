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

  // SAP Management
  async getSapRoles(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/sap/roles`, { params })
      return response.data
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
}

export default new AdminService()