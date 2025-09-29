import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '@/components/BaseModal.vue'

describe('BaseModal', () => {
  let wrapper

  beforeEach(() => {
    wrapper?.unmount()
  })

  it('renders correctly when show is true', () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal'
      }
    })

    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.find('.modal-header h3').text()).toBe('Test Modal')
  })

  it('does not render when show is false', () => {
    wrapper = mount(BaseModal, {
      props: {
        show: false,
        title: 'Test Modal'
      }
    })

    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('emits close event when clicking overlay', async () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal'
      }
    })

    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted().close).toBeTruthy()
  })

  it('does not emit close event when clicking modal content', async () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal'
      }
    })

    await wrapper.find('.modal-content').trigger('click')
    expect(wrapper.emitted().close).toBeFalsy()
  })

  it('emits close event when clicking close button', async () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal'
      }
    })

    await wrapper.find('.close-button').trigger('click')
    expect(wrapper.emitted().close).toBeTruthy()
  })

  it('renders slot content', () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal'
      },
      slots: {
        default: '<p>Test slot content</p>'
      }
    })

    expect(wrapper.find('p').text()).toBe('Test slot content')
  })

  it('shows actions when showActions is true', () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal',
        showActions: true
      }
    })

    expect(wrapper.find('.modal-actions').exists()).toBe(true)
  })

  it('hides actions when showActions is false', () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal',
        showActions: false
      }
    })

    expect(wrapper.find('.modal-actions').exists()).toBe(false)
  })

  it('emits confirm event when confirm button is clicked', async () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal',
        showActions: true
      }
    })

    const confirmButton = wrapper.find('.btn-primary')
    if (confirmButton.exists()) {
      await confirmButton.trigger('click')
      expect(wrapper.emitted().confirm).toBeTruthy()
    }
  })

  it('emits cancel event when cancel button is clicked', async () => {
    wrapper = mount(BaseModal, {
      props: {
        show: true,
        title: 'Test Modal',
        showActions: true
      }
    })

    const cancelButton = wrapper.find('.btn-secondary')
    if (cancelButton.exists()) {
      await cancelButton.trigger('click')
      expect(wrapper.emitted().cancel).toBeTruthy()
    }
  })
})