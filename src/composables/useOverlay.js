import { ref, reactive } from 'vue'

export function useOverlay() {
  const showEditOverlay = ref(false)
  const activeModals = reactive(new Set())

  const openModal = (modalName) => {
    activeModals.add(modalName)
    showEditOverlay.value = true
  }

  const closeModal = (modalName) => {
    activeModals.delete(modalName)
    if (activeModals.size === 0) {
      showEditOverlay.value = false
    }
  }

  const closeAllModals = () => {
    activeModals.clear()
    showEditOverlay.value = false
  }

  const isModalOpen = (modalName) => {
    return activeModals.has(modalName)
  }

  return {
    showEditOverlay,
    activeModals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
  }
}

export function useModalState() {
  const modalStates = reactive({})
  const editingStates = reactive({})
  const formData = reactive({})

  const createModalState = (modalName, initialFormData = {}) => {
    modalStates[modalName] = ref(false)
    editingStates[modalName] = ref(null)
    formData[modalName] = reactive({ ...initialFormData })
  }

  const openCreateModal = (modalName, overlay) => {
    editingStates[modalName].value = null
    Object.assign(formData[modalName], {})
    modalStates[modalName].value = true
    overlay.openModal(modalName)
  }

  const openEditModal = (modalName, overlay, editData) => {
    editingStates[modalName].value = editData
    Object.assign(formData[modalName], editData)
    modalStates[modalName].value = true
    overlay.openModal(modalName)
  }

  const closeModalState = (modalName, overlay) => {
    modalStates[modalName].value = false
    editingStates[modalName].value = null
    Object.assign(formData[modalName], {})
    overlay.closeModal(modalName)
  }

  return {
    modalStates,
    editingStates,
    formData,
    createModalState,
    openCreateModal,
    openEditModal,
    closeModalState,
  }
}

export function useAdminService(serviceName) {
  const loading = ref(false)
  const error = ref(null)

  const executeOperation = async (operation, successMessage) => {
    loading.value = true
    error.value = null

    try {
      const result = await operation()
      if (successMessage) {
        console.log(successMessage)
      }
      return result
    } catch (err) {
      error.value = err.message || `Fehler bei ${serviceName} Operation`
      console.error(`Fehler bei ${serviceName}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const confirmDelete = (itemName) => {
    return confirm(`Sind Sie sicher, dass Sie ${itemName} löschen möchten?`)
  }

  return {
    loading,
    error,
    executeOperation,
    confirmDelete,
  }
}
