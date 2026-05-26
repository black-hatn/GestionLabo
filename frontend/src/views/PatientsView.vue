<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Patients</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Consultez et gérez les dossiers médicaux</p>
      </div>
      <button
        @click="openModal"
        class="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm shadow-blue-500/30"
      >
        <UserPlusIcon class="w-5 h-5" />
        Nouveau Patient
      </button>
    </div>

    <!-- Modal -->
    <PatientModal :is-open="isModalOpen" @close="closeModal" @save="handleSavePatient" />

    <!-- Search & Filters -->
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1 relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>
      <select class="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
        <option>Tous les statuts</option>
        <option>Actif</option>
        <option>Archivé</option>
      </select>
    </div>

    <!-- Patients Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Patient</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Contact</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Âge / Sexe</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Dossier</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Statut</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr v-if="patientStore.loading" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td colspan="6" class="px-6 py-8 text-center">
                <div class="inline-block">
                  <div class="w-6 h-6 border-3 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="patientStore.patients.length === 0" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td colspan="6" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                Aucun patient trouvé
              </td>
            </tr>
            <tr v-for="patient in patientStore.patients" :key="patient.id_patient" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20 flex items-center justify-center text-white font-semibold text-sm">
                    {{ initials(patient.nom, patient.prenom) }}
                  </div>
                  <div>
                    <p class="font-semibold text-slate-900 dark:text-white">{{ patient.prenom }} {{ patient.nom }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ patient.numero_dossier }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <p class="text-slate-900 dark:text-slate-300 flex items-center gap-2">
                    <PhoneIcon class="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    {{ patient.telephone || '—' }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Né(e) : {{ new Date(patient.date_naissance).toLocaleDateString('fr-FR') }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-semibold text-slate-900 dark:text-slate-300">{{ computeAge(patient.date_naissance) }} ans</span>
                <span class="ml-2 text-slate-600 dark:text-slate-400">{{ patient.sexe === 'F' ? '♀' : '♂' }}</span>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ patient.profession || '—' }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Actif
                </span>
              </td>
              <td class="px-6 py-4">
                <button class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                  Détail →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePatientStore } from '../stores/patient'
import PatientModal from '../components/PatientModal.vue'
import { UserPlusIcon, MagnifyingGlassIcon, PhoneIcon } from '@heroicons/vue/24/outline'

const patientStore = usePatientStore()
const isModalOpen = ref(false)

onMounted(() => {
  patientStore.fetchPatients()
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSavePatient = async (patientData) => {
  await patientStore.createPatient(patientData)
  closeModal()
}

const initials = (nom, prenom) => {
  return ((prenom && prenom[0]) || '') + ((nom && nom[0]) || '')
}

const computeAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
</script>
