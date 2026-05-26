<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
    <!-- Navbar simple pour l'espace patient -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2">
          <BeakerIcon class="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <span class="text-xl font-bold font-display text-slate-900 dark:text-white">L'Horizon</span>
        </RouterLink>
        <div class="flex items-center gap-4">
          <button @click="toggleTheme" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
            <SunIcon v-if="isDark" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>
          <button v-if="isAuthenticated" @click="logout" class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            <ArrowRightOnRectangleIcon class="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 md:py-12">
      <!-- État : Non connecté (Formulaire de connexion patient) -->
      <div v-if="!isAuthenticated" class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Espace Patient</h1>
          <p class="text-slate-600 dark:text-slate-400">Consultez vos résultats d'analyses en toute sécurité.</p>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">Numéro de dossier</label>
              <div class="relative">
                <DocumentTextIcon class="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  v-model="dossierNumber"
                  type="text"
                  required
                  placeholder="Ex: DOS-2026-1042"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">Code confidentiel</label>
              <div class="relative">
                <KeyIcon class="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  v-model="secretCode"
                  type="password"
                  required
                  placeholder="Reçu par SMS ou email"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <ExclamationCircleIcon class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Accéder à mes résultats
            </button>
            
            <p class="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
              Pour la démo, utilisez <strong>DOS-123</strong> et <strong>1234</strong>
            </p>
          </form>
        </div>
        
        <div class="mt-8 flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
          <ShieldCheckIcon class="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white text-sm">Données sécurisées</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Vos données de santé sont cryptées et stockées conformément à la réglementation HDS. Aucun accès n'est possible sans votre code confidentiel.</p>
          </div>
        </div>
      </div>

      <!-- État : Connecté (Tableau de bord patient) -->
      <div v-else class="max-w-4xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Bonjour, Jean Dupont</h1>
            <p class="text-slate-600 dark:text-slate-400 mt-1">Dossier N° {{ dossierNumber }} • Date de naissance : 14/05/1985</p>
          </div>
          <button class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <QuestionMarkCircleIcon class="w-5 h-5" />
            Besoin d'aide ?
          </button>
        </div>

        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <DocumentCheckIcon class="w-6 h-6" />
            </div>
            <h3 class="text-slate-500 dark:text-slate-400 text-sm font-medium">Dernier examen</h3>
            <p class="text-xl font-bold text-slate-900 dark:text-white mt-1">24 Mai 2026</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div class="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
              <CheckBadgeIcon class="w-6 h-6" />
            </div>
            <h3 class="text-slate-500 dark:text-slate-400 text-sm font-medium">Statut du dossier</h3>
            <p class="text-xl font-bold text-green-600 dark:text-green-400 mt-1">Complet & Validé</p>
          </div>
          <div class="bg-gradient-to-br from-blue-600 to-cyan-500 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white flex flex-col justify-center relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 opacity-20">
              <DocumentArrowDownIcon class="w-32 h-32" />
            </div>
            <h3 class="font-medium text-blue-100 mb-2 relative z-10">Résultats disponibles</h3>
            <button class="bg-white text-blue-600 font-bold py-2.5 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 relative z-10 w-fit">
              <DocumentArrowDownIcon class="w-5 h-5" />
              Télécharger le PDF complet
            </button>
          </div>
        </div>

        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Détail des analyses</h2>
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <ul class="divide-y divide-slate-200 dark:divide-slate-800">
            <li v-for="examen in examens" :key="examen.id" class="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                  <div :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                    examen.status === 'Terminé' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  ]">
                    <CheckIcon v-if="examen.status === 'Terminé'" class="w-5 h-5" />
                    <ClockIcon v-else class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">{{ examen.name }}</h4>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Prescrit par Dr. {{ examen.medecin }} le {{ examen.date }}</p>
                    <div class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" :class="examen.status === 'Terminé' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800'">
                      <span class="w-1.5 h-1.5 rounded-full" :class="examen.status === 'Terminé' ? 'bg-green-500' : 'bg-amber-500'"></span>
                      {{ examen.status }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button v-if="examen.status === 'Terminé'" class="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-700" title="Voir les détails en ligne">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button v-if="examen.status === 'Terminé'" class="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-700" title="Télécharger l'extrait PDF">
                    <DocumentArrowDownIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  BeakerIcon, 
  SunIcon, 
  MoonIcon, 
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  KeyIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  DocumentCheckIcon,
  CheckBadgeIcon,
  DocumentArrowDownIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

const isDark = ref(false)
const isAuthenticated = ref(false)
const loading = ref(false)
const error = ref('')
const dossierNumber = ref('')
const secretCode = ref('')

// Mock data for the patient dashboard
const examens = ref([
  { id: 1, name: 'Bilan Hématologique Complet', medecin: 'Rousseau', date: '24/05/2026', status: 'Terminé' },
  { id: 2, name: 'Bilan Lipidique', medecin: 'Rousseau', date: '24/05/2026', status: 'Terminé' },
  { id: 3, name: 'Sérologie', medecin: 'Rousseau', date: '24/05/2026', status: 'En cours d\'analyse' },
])

onMounted(() => {
  if (document.documentElement.classList.contains('dark')) {
    isDark.value = true
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.theme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.theme = 'light'
  }
}

const handleLogin = () => {
  loading.value = true
  error.value = ''
  
  // Simulation d'une vérification d'API
  setTimeout(() => {
    if (dossierNumber.value === 'DOS-123' && secretCode.value === '1234') {
      isAuthenticated.value = true
    } else {
      error.value = 'Numéro de dossier ou code confidentiel incorrect.'
    }
    loading.value = false
  }, 1000)
}

const logout = () => {
  isAuthenticated.value = false
  dossierNumber.value = ''
  secretCode.value = ''
}
</script>
