<template>
  <Teleport to="body">
    <div v-show="show" class="edit-overlay" @click="handleOverlayClick">
      <div class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button @click="closeModal" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div v-if="showActions" class="modal-actions">
            <button v-if="showCancelButton" type="button" @click="closeModal" class="btn-secondary">
              {{ cancelText }}
            </button>
            <button
              v-if="showSubmitButton"
              type="submit"
              @click="handleSubmit"
              class="btn-primary"
              :disabled="submitDisabled"
            >
              {{ submitText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    showCancelButton: {
      type: Boolean,
      default: true,
    },
    showSubmitButton: {
      type: Boolean,
      default: true,
    },
    cancelText: {
      type: String,
      default: 'Abbrechen',
    },
    submitText: {
      type: String,
      default: 'Speichern',
    },
    submitDisabled: {
      type: Boolean,
      default: false,
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['close', 'submit'],
  methods: {
    closeModal() {
      this.$emit('close')
    },
    handleSubmit() {
      this.$emit('submit')
    },
    handleOverlayClick() {
      if (this.closeOnOverlayClick) {
        this.closeModal()
      }
    },
  },
})
</script>

<style scoped>
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--color-text);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-background-soft);
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: var(--color-button);
  color: var(--color-text);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-button-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
