<template>
  <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-0">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" @click="close"></div>

    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserPlusIcon class="w-6 h-6 text-blue-600 dark:text-blue-500" />
          Nouveau Patient
        </h2>
        <button @click="close" class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      
      <form @submit.prevent="savePatient">
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Nom <span class="text-red-500">*</span></label>
              <input type="text" v-model="form.nom" required placeholder="Ex: Dupont" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Prénom <span class="text-red-500">*</span></label>
              <input type="text" v-model="form.prenom" required placeholder="Ex: Jean" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Date de naissance <span class="text-red-500">*</span></label>
              <input type="date" v-model="form.date_naissance" required class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Sexe <span class="text-red-500">*</span></label>
              <select v-model="form.sexe" required class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                <option value="">Sélectionner...</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Téléphone</label>
              <div class="relative">
                <PhoneIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input type="tel" v-model="form.telephone" placeholder="Ex: 06 12 34 56 78" class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
              <div class="relative">
                <EnvelopeIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input type="email" v-model="form.email" placeholder="Ex: jean@email.com" class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500" />
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse complète</label>
            <div class="relative">
              <MapPinIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input type="text" v-model="form.adresse" placeholder="Ex: 123 rue de la Paix, 75000 Paris" class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500" />
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button type="button" class="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-lg transition-colors" @click="close">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/30">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { XMarkIcon, UserPlusIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  nom: '',
  prenom: '',
  date_naissance: '',
  sexe: '',
  telephone: '',
  email: '',
  adresse: ''
})

const close = () => {
  emit('close')
}

const savePatient = () => {
  // Ici on appellerait le backend (API)
  console.log("Sauvegarde du patient...", form.value)
  
  // Simuler la réussite
  emit('save', { ...form.value, id: '#PAT-NEW' })
  close()
  
  // Reset form
  form.value = { nom: '', prenom: '', date_naissance: '', sexe: '', telephone: '', email: '', adresse: '' }
}
</script>
