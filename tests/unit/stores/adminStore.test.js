import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminStore } from '@/stores/adminStore'

// Mock adminService
const mockAdminService = {
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getRollen: vi.fn(),
  getBereiche: vi.fn(),
  getTeams: vi.fn(),
  getTeamsByBereich: vi.fn()
}

vi.mock('@/services/adminService', () => ({
  default: mockAdminService
}))

describe('Admin Store', () => {
  let adminStore

  beforeEach(() => {
    setActivePinia(createPinia())
    adminStore = useAdminStore()
    vi.clearAllMocks()
  })

  describe('User Operations', () => {
    it('loads users correctly', async () => {
      const mockUsers = {
        data: [
          { id: 1, name: 'Test User 1', email: 'test1@example.com' },
          { id: 2, name: 'Test User 2', email: 'test2@example.com' }
        ]
      }

      mockAdminService.getUsers.mockResolvedValue(mockUsers)

      await adminStore.usersOps.load()

      expect(mockAdminService.getUsers).toHaveBeenCalled()
      expect(adminStore.users).toEqual(mockUsers.data)
    })

    it('handles user loading errors gracefully', async () => {
      mockAdminService.getUsers.mockRejectedValue(new Error('Network error'))

      await adminStore.usersOps.load()

      expect(adminStore.users).toEqual([])
    })

    it('creates user successfully', async () => {
      const newUser = { id: 3, name: 'New User', email: 'new@example.com' }
      mockAdminService.createUser.mockResolvedValue({ user: newUser })

      const userData = { name: 'New User', email: 'new@example.com' }
      await adminStore.usersOps.create(userData)

      expect(mockAdminService.createUser).toHaveBeenCalledWith(userData)
      expect(adminStore.users).toContain(newUser)
    })

    it('updates user successfully', async () => {
      // Setup initial users
      adminStore.users = [
        { id: 1, name: 'Old Name', email: 'test@example.com' },
        { id: 2, name: 'User 2', email: 'test2@example.com' }
      ]

      const updatedUser = { id: 1, name: 'Updated Name', email: 'test@example.com' }
      mockAdminService.updateUser.mockResolvedValue({ user: updatedUser })

      await adminStore.usersOps.update(1, { name: 'Updated Name' })

      expect(mockAdminService.updateUser).toHaveBeenCalledWith(1, { name: 'Updated Name' })
      expect(adminStore.users[0].name).toBe('Updated Name')
    })

    it('removes user successfully', async () => {
      // Setup initial users
      adminStore.users = [
        { id: 1, name: 'User 1', email: 'test1@example.com' },
        { id: 2, name: 'User 2', email: 'test2@example.com' }
      ]

      mockAdminService.deleteUser.mockResolvedValue({ message: 'User deleted' })

      await adminStore.usersOps.remove(1)

      expect(mockAdminService.deleteUser).toHaveBeenCalledWith(1)
      expect(adminStore.users).toHaveLength(1)
      expect(adminStore.users[0].id).toBe(2)
    })
  })

  describe('Bereiche Operations', () => {
    it('loads bereiche correctly', async () => {
      const mockBereiche = [
        { BereichID: 1, Bezeichnung: 'IT' },
        { BereichID: 2, Bezeichnung: 'HR' }
      ]

      mockAdminService.getBereiche.mockResolvedValue(mockBereiche)

      const result = await adminStore.bereicheOps.load()

      expect(mockAdminService.getBereiche).toHaveBeenCalled()
      expect(result).toEqual(mockBereiche)
    })
  })

  describe('Teams Operations', () => {
    it('loads teams correctly', async () => {
      const mockTeams = [
        { TeamID: 1, Bezeichnung: 'Development' },
        { TeamID: 2, Bezeichnung: 'Testing' }
      ]

      mockAdminService.getTeams.mockResolvedValue(mockTeams)

      const result = await adminStore.teamsOps.load()

      expect(mockAdminService.getTeams).toHaveBeenCalled()
      expect(result).toEqual(mockTeams)
    })

    it('loads teams by bereich correctly', async () => {
      const mockTeams = [
        { TeamID: 1, Bezeichnung: 'Development', BereichID: 1 }
      ]

      mockAdminService.getTeamsByBereich.mockResolvedValue(mockTeams)

      const result = await adminStore.teamsOps.loadByBereich(1)

      expect(mockAdminService.getTeamsByBereich).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockTeams)
    })
  })

  describe('Error Handling', () => {
    it('handles network errors in user operations', async () => {
      mockAdminService.getUsers.mockRejectedValue(new Error('Network error'))

      // Should not throw
      await expect(adminStore.usersOps.load()).resolves.toBeUndefined()
      expect(adminStore.users).toEqual([])
    })

    it('handles API errors in create operations', async () => {
      mockAdminService.createUser.mockRejectedValue(new Error('Validation error'))

      // Should not throw but also should not modify store
      await expect(
        adminStore.usersOps.create({ name: 'Test' })
      ).rejects.toThrow('Validation error')
    })
  })
})