<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
          @click="toastStore.remove(toast.id)"
        >
          <div class="toast-icon">
            <i :class="{
              'bx bx-check-circle': toast.type === 'success',
              'bx bx-x-circle': toast.type === 'error',
              'bx bx-info-circle': toast.type === 'info',
              'bx bx-error': toast.type === 'warning'
            }"></i>
          </div>
          <p class="toast-msg">{{ toast.message }}</p>
          <button class="toast-close"><i class="bx bx-x"></i></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '../stores/toast'
const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 14px;
  min-width: 300px;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  pointer-events: all;
  cursor: pointer;
  backdrop-filter: blur(10px);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 500;
  animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-success { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
.toast-error   { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
.toast-info    { background: #eff6ff; border: 1px solid #93c5fd; color: #1e40af; }
.toast-warning { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }

.toast-icon { font-size: 1.4rem; flex-shrink: 0; }
.toast-success .toast-icon { color: #16a34a; }
.toast-error   .toast-icon { color: #dc2626; }
.toast-info    .toast-icon { color: #2563eb; }
.toast-warning .toast-icon { color: #d97706; }

.toast-msg { flex: 1; line-height: 1.4; }

.toast-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.5;
  padding: 0;
  color: inherit;
  flex-shrink: 0;
}
.toast-close:hover { opacity: 1; }

/* Transition */
.toast-enter-from { opacity: 0; transform: translateX(60px); }
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-to { opacity: 0; transform: translateX(60px); }
.toast-leave-active { transition: all 0.25s ease-in; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(60px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
