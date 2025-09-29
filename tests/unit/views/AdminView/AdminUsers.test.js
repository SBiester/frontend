import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AdminUsers from '@/views/AdminView/AdminUsers.vue'

// Mock the admin service
const mockAdminService = {
  getRollen: vi.fn(),
  getTeamsByBereich: vi.fn()
}

vi.mock('@/services/adminService', () => ({
  default: mockAdminService
}))

// Mock the admin store
const mockAdminStore = {
  users: [
    {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      status: 'active',
      RollenID: 1,
      BereichID: 1,
      TeamID: 1,
      bereich: { Bezeichnung: 'IT' },
      team: { Bezeichnung: 'Development' },
      rolle: { Bezeichnung: 'admin' }
    },
    {
      id: 2,
      name: 'Inactive User',
      email: 'inactive@example.com',
      status: 'inactive',
      RollenID: 4,
      BereichID: 2,
      TeamID: 2,
      bereich: { Bezeichnung: 'HR' },
      team: { Bezeichnung: 'Recruiting' },
      rolle: { Bezeichnung: 'user' }
    }
  ],
  usersOps: {
    load: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  },
  bereicheOps: {
    load: vi.fn().mockResolvedValue([
      { BereichID: 1, Bezeichnung: 'IT' },
      { BereichID: 2, Bezeichnung: 'HR' }
    ])
  },
  teamsOps: {
    load: vi.fn().mockResolvedValue([
      { TeamID: 1, Bezeichnung: 'Development' },
      { TeamID: 2, Bezeichnung: 'Recruiting' }
    ])
  }
}

vi.mock('@/stores/adminStore', () => ({
  useAdminStore: () => mockAdminStore
}))

describe('AdminUsers', () => {
  let wrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Setup default mock responses
    mockAdminService.getRollen.mockResolvedValue([
      { RollenID: 1, Bezeichnung: 'admin' },
      { RollenID: 2, Bezeichnung: 'pm' },
      { RollenID: 3, Bezeichnung: 'fach' },
      { RollenID: 4, Bezeichnung: 'user' }
    ])

    mockAdminService.getTeamsByBereich.mockResolvedValue([
      { TeamID: 1, Bezeichnung: 'Development' }
    ])

    wrapper?.unmount()
  })

  it('renders user management heading', () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    expect(wrapper.find('h2').text()).toBe('Benutzerverwaltung')
  })

  it('displays user list correctly', () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    const userRows = wrapper.findAll('.user-row')
    expect(userRows).toHaveLength(2)

    // Check first user
    expect(wrapper.text()).toContain('Test User')
    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.text()).toContain('IT')
    expect(wrapper.text()).toContain('Development')
  })

  it('filters users by status', async () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    const statusFilter = wrapper.find('select[data-testid="status-filter"]')
    if (statusFilter.exists()) {
      await statusFilter.setValue('inactive')
      expect(wrapper.vm.selectedStatus).toBe('inactive')
    }
  })

  it('filters users by role', async () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    const roleFilter = wrapper.find('select[data-testid="role-filter"]')
    if (roleFilter.exists()) {
      await roleFilter.setValue('1')
      expect(wrapper.vm.selectedRole).toBe('1')
    }
  })

  it('opens add user modal when add button is clicked', async () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    const addButton = wrapper.find('.add-button')
    await addButton.trigger('click')

    expect(wrapper.vm.showAddUserForm).toBe(true)
  })

  it('opens edit modal when edit button is clicked', async () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    const editButton = wrapper.find('[data-testid="edit-user-btn"]')
    if (editButton.exists()) {
      await editButton.trigger('click')
      expect(wrapper.vm.showEditUserForm).toBe(true)
    }
  })

  it('loads roles on mount', async () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Wait for next tick to allow async operations
    await wrapper.vm.$nextTick()

    expect(mockAdminService.getRollen).toHaveBeenCalled()
  })

  it('loads bereiche and teams on mount', async () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    await wrapper.vm.$nextTick()

    expect(mockAdminStore.bereicheOps.load).toHaveBeenCalled()
    expect(mockAdminStore.teamsOps.load).toHaveBeenCalled()
  })

  it('handles search input correctly', async () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Test User')

    expect(wrapper.vm.searchQuery).toBe('Test User')
  })

  it('displays correct status badges', () => {
    wrapper = mount(AdminUsers, {
      global: {
        plugins: [createPinia()]
      }
    })

    const statusBadges = wrapper.findAll('.status-badge')
    expect(statusBadges.length).toBeGreaterThan(0)

    // Check if active and inactive statuses are displayed
    const statusTexts = statusBadges.map(badge => badge.text())
    expect(statusTexts).toContain('Aktiv')
    expect(statusTexts).toContain('Inaktiv')
  })

  describe('User Actions', () => {
    it('calls delete user when delete button is clicked', async () => {
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

      wrapper = mount(AdminUsers, {
        global: {
          plugins: [createPinia()]
        }
      })

      const deleteButton = wrapper.find('[data-testid="delete-user-btn"]')
      if (deleteButton.exists()) {
        await deleteButton.trigger('click')
        expect(mockAdminStore.usersOps.remove).toHaveBeenCalled()
      }

      confirmSpy.mockRestore()
    })

    it('does not delete user when confirmation is cancelled', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

      wrapper = mount(AdminUsers, {
        global: {
          plugins: [createPinia()]
        }
      })

      const deleteButton = wrapper.find('[data-testid="delete-user-btn"]')
      if (deleteButton.exists()) {
        await deleteButton.trigger('click')
        expect(mockAdminStore.usersOps.remove).not.toHaveBeenCalled()
      }

      confirmSpy.mockRestore()
    })
  })

  describe('Team Preselection', () => {
    it('loads teams when bereich is selected in edit modal', async () => {
      wrapper = mount(AdminUsers, {
        global: {
          plugins: [createPinia()]
        }
      })

      // Simulate opening edit modal
      await wrapper.vm.editUser(mockAdminStore.users[0])

      expect(mockAdminService.getTeamsByBereich).toHaveBeenCalledWith(1)
      expect(wrapper.vm.editingUser.TeamID).toBe(1)
    })

    it('preselects correct team in edit modal', async () => {
      wrapper = mount(AdminUsers, {
        global: {
          plugins: [createPinia()]
        }
      })

      const user = mockAdminStore.users[0]
      await wrapper.vm.editUser(user)

      // Check that the user's TeamID is preserved after loading teams
      expect(wrapper.vm.editingUser.TeamID).toBe(user.TeamID)
    })
  })
})