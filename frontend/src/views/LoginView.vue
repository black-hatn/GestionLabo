<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center p-4">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
    </div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-center text-white">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
            <BeakerIcon class="w-8 h-8" />
          </div>
          <h1 class="text-3xl font-bold mb-2">L'Horizon</h1>
          <p class="text-blue-100">Gestion des examens médicaux</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="px-8 py-8 space-y-6">
          <!-- Identifiant -->
          <div>
            <label class="block text-sm font-semibold text-slate-900 mb-2">Identifiant</label>
            <div class="relative">
              <UserIcon class="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                v-model="identifiant"
                type="text"
                required
                placeholder="admin"
                class="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-slate-900 mb-2">Mot de passe</label>
            <div class="relative">
              <LockClosedIcon class="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                v-model="motDePasse"
                type="password"
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <ExclamationCircleIcon class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </Transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2.5 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>

          <!-- Demo Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p class="text-sm text-slate-700">
              <span class="font-semibold text-blue-600">Mode démo :</span> admin / password
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { BeakerIcon, UserIcon, LockClosedIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const router = useRouter()

const identifiant = ref('admin')
const motDePasse = ref('password')
const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null

  const success = await authStore.login(identifiant.value, motDePasse.value)

  if (success) {
    router.push('/dashboard')
  } else {
    error.value = authStore.error || 'Erreur de connexion'
  }

  loading.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
