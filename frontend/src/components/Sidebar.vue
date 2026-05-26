<template>
  <aside
    :class="[
      'fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 z-40',
      !open && '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Header -->
    <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
          <BeakerIcon class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-sm font-bold text-slate-900 dark:text-white">L'Horizon</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Laboratoire</p>
        </div>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 overflow-y-auto px-3 py-6 space-y-1">
      <!-- Main Section -->
      <div>
        <p class="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Principal</p>
        <RouterLink
          to="/dashboard"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold': isActive('/dashboard') }"
        >
          <HomeIcon class="w-5 h-5" />
          <span class="text-sm">Tableau de bord</span>
        </RouterLink>
      </div>

      <!-- Management Section -->
      <div class="pt-4">
        <p class="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gestion</p>
        <RouterLink
          to="/patients"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold': isActive('/patients') }"
        >
          <UserGroupIcon class="w-5 h-5" />
          <span class="text-sm">Patients</span>
        </RouterLink>

        <RouterLink
          to="/demandes"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold': isActive('/demandes') }"
        >
          <DocumentTextIcon class="w-5 h-5" />
          <span class="text-sm">Demandes</span>
        </RouterLink>

        <RouterLink
          to="/resultats"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold': isActive('/resultats') }"
        >
          <BeakerIcon class="w-5 h-5" />
          <span class="text-sm">Résultats</span>
        </RouterLink>
      </div>

      <!-- Admin Section -->
      <div class="pt-4">
        <p class="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Administration</p>
        <RouterLink
          to="/utilisateurs"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold': isActive('/utilisateurs') }"
        >
          <UsersIcon class="w-5 h-5" />
          <span class="text-sm">Utilisateurs</span>
        </RouterLink>

        <RouterLink
          to="/catalogue"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold': isActive('/catalogue') }"
        >
          <ClipboardListIcon class="w-5 h-5" />
          <span class="text-sm">Catalogue</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Footer Help Box -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-800">
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-transparent dark:border-blue-900/50">
        <QuestionMarkCircleIcon class="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
        <p class="text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1">Besoin d'aide ?</p>
        <p class="text-xs text-slate-600 dark:text-slate-400">Consultez la documentation</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BeakerIcon,
  UsersIcon,
  ClipboardIcon as ClipboardListIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  open: {
    type: Boolean,
    default: true,
  },
})

const route = useRoute()

const isActive = (path) => {
  return route.path.startsWith(path)
}
</script>
