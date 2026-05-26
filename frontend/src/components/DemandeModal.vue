<template>
  <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-0">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" @click="close"></div>

    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BeakerIcon class="w-6 h-6 text-blue-600 dark:text-blue-500" />
          Nouvelle Demande
        </h2>
        <button @click="close" class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      
      <form @submit.prevent="saveDemande">
        <div class="p-6 space-y-6">
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Patient <span class="text-red-500">*</span></label>
            <select v-model="form.patient_id" required class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <option value="">Sélectionner un patient...</option>
              <option v-for="p in patientStore.patients" :key="p.id_patient" :value="p.id_patient">
                {{ p.numero_dossier || p.id_patient }} - {{ p.nom }} {{ p.prenom }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Examens prescrits <span class="text-red-500">*</span></label>
            <div class="flex flex-col gap-2 max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-700 p-3 rounded-lg bg-white dark:bg-slate-800">
              <label v-for="exam in examenStore.examens" :key="exam.id_examen" class="flex items-center gap-3 font-normal text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" :value="exam.id_examen" v-model="form.examens_ids" class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700" />
                {{ exam.code }} - {{ exam.libelle }}
              </label>
            </div>
            <p class="text-xs text-red-500 mt-1" v-if="form.examens_ids.length === 0">Veuillez sélectionner au moins un examen.</p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Médecin prescripteur</label>
            <select v-model="form.medecin_id" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <option :value="null">Sans prescripteur</option>
              <option v-for="m in medecinStore.medecins" :key="m.id_medecin" :value="m.id_medecin">
                Dr. {{ m.prenom }} {{ m.nom }} — {{ m.specialite || 'Généraliste' }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">Notes (facultatif)</label>
            <textarea v-model="form.notes" placeholder="Informations complémentaires..." rows="3" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button type="button" class="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-lg transition-colors" @click="close">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/30" :disabled="form.examens_ids.length === 0 || !form.patient_id">
            Enregistrer la demande
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePatientStore } from '../stores/patient'
import { useExamenStore } from '../stores/examen'
import { useMedecinStore } from '../stores/medecin'
import { XMarkIcon, BeakerIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'save'])

const patientStore = usePatientStore()
const examenStore = useExamenStore()
const medecinStore = useMedecinStore()

onMounted(() => {
  patientStore.fetchPatients()
  examenStore.fetchExamens()
  medecinStore.fetchMedecins()
})

const form = ref({
  patient_id: '',
  medecin_id: null,
  examens_ids: [],
  notes: '',
  statut: 'En attente'
})

const close = () => {
  emit('close')
}

const saveDemande = () => {
  emit('save', { ...form.value })
  // Reset form
  form.value = { patient_id: '', medecin_id: null, examens_ids: [], notes: '', statut: 'En attente' }
}
</script>
