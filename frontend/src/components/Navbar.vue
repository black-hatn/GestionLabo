<template>
  <nav class="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
    <div class="flex items-center justify-between px-6 h-16">
      <!-- Left: Menu toggle + Search -->
      <div class="flex items-center gap-4 flex-1">
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden text-slate-600 dark:text-slate-300"
        >
          <MenuIcon class="w-6 h-6" />
        </button>

        <!-- Search bar -->
        <div class="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg flex-1 max-w-md border border-transparent dark:border-slate-700 transition-colors">
          <MagnifyingGlassIcon class="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher patient, demande..."
            class="bg-transparent border-none outline-none text-sm w-full placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-slate-100"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Right: Actions + Profile -->
      <div class="flex items-center gap-4">
        <!-- Theme Toggle -->
        <button 
          @click="$emit('toggle-theme')" 
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
          :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
        >
          <SunIcon v-if="isDark" class="w-6 h-6" />
          <MoonIcon v-else class="w-6 h-6" />
        </button>

        <!-- Notifications -->
        <button class="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
          <BellIcon class="w-6 h-6" />
          <span class="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></span>
        </button>

        <!-- Settings -->
        <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hidden sm:block">
          <CogIcon class="w-6 h-6" />
        </button>

        <!-- Divider -->
        <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

        <!-- Profile -->
        <div v-if="authStore.user" class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ authStore.user.role }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Laboratoire</p>
          </div>
          <img
            :src="`https://ui-avatars.com/api/?name=${authStore.user.role}&background=2563EB&color=fff`"
            alt="Avatar"
            class="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
          />
          <button
            @click="logout"
            class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
            title="Déconnexion"
          >
            <ArrowLeftOnRectangleIcon class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import {
  Bars3Icon as MenuIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon as CogIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()
const router = useRouter()

defineEmits(['toggle-sidebar', 'toggle-theme'])

const handleSearch = (event) => {
  // TODO: Implement search functionality
  console.log('Search:', event.target.value)
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
