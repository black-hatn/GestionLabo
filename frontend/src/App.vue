<template>
  <div id="app" class="min-h-screen">
    <!-- Authenticated Layout -->
    <template v-if="showDashboardLayout">
      <Sidebar :open="sidebarOpen" />
      <div class="lg:ml-64 flex flex-col min-h-screen">
        <Navbar 
          @toggle-sidebar="sidebarOpen = !sidebarOpen" 
          @toggle-theme="toggleTheme"
          :is-dark="isDark"
        />
        <main class="flex-1 overflow-auto">
          <div class="p-6">
            <RouterView />
          </div>
        </main>
      </div>
    </template>

    <!-- Login/Home Layout -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import { RouterView, useRoute } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()
const sidebarOpen = ref(true)

// Theme Management
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.theme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.theme = 'light'
  }
}

onMounted(() => {
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
  }
  updateTheme()
})

const showDashboardLayout = computed(() => {
  return authStore.isAuthenticated && route.name !== 'Home' && route.name !== 'Login'
})
</script>
