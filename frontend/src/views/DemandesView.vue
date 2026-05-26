<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Demandes d'Analyses</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Gérez les prescriptions et le suivi des prélèvements</p>
      </div>
      <button
        @click="openModal"
        class="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm shadow-blue-500/30"
      >
        <PlusIcon class="w-5 h-5" />
        Nouvelle Demande
      </button>
    </div>

    <!-- Modal -->
    <DemandeModal :is-open="isModalOpen" @close="closeModal" @save="handleSaveDemande" />

    <!-- Tabs + Search -->
    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div class="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto w-full md:w-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === tab.value
              ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="flex-1 relative w-full md:w-auto">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par n° ou patient..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>
    </div>

    <!-- Cards Grid -->
    <div v-if="demandeStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="filteredDemandes.length === 0" class="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
      <DocumentTextIcon class="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
      <p class="text-slate-600 dark:text-slate-400">Aucune demande trouvée</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="demande in filteredDemandes"
        :key="demande.id_demande"
        class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-all hover:-translate-y-1"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-xs font-mono text-slate-500 dark:text-slate-400">{{ demande.numero_demande }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">Patient #{{ demande.patient_id }}</p>
          </div>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
              demande.statut === 'Terminée'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800'
                : demande.statut === 'En cours'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
            ]"
          >
            {{ demande.statut }}
          </span>
        </div>

        <!-- Details -->
        <div class="space-y-2 text-sm mb-4">
          <div class="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Médecin :</span>
            <span class="font-medium text-slate-900 dark:text-slate-200">{{ demande.medecin_id || '—' }}</span>
          </div>
          <div class="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Date :</span>
            <span class="font-medium text-slate-900 dark:text-slate-200">{{ new Date(demande.date_demande).toLocaleDateString('fr-FR') }}</span>
          </div>
          <div v-if="demande.notes" class="text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md mt-2 text-xs border border-slate-100 dark:border-slate-800">{{ demande.notes }}</div>
        </div>

        <!-- Action -->
        <button class="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm py-2 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent dark:border-blue-900/30">
          Détail →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDemandeStore } from '../stores/demande'
import DemandeModal from '../components/DemandeModal.vue'
import { PlusIcon, DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const demandeStore = useDemandeStore()
const isModalOpen = ref(false)
const activeTab = ref('all')
const searchQuery = ref('')

const tabs = [
  { label: `Toutes`, value: 'all' },
  { label: 'En attente', value: 'attente' },
  { label: 'En cours', value: 'cours' },
  { label: 'Terminées', value: 'terminees' },
]

onMounted(() => {
  demandeStore.fetchDemandes()
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSaveDemande = async (demandeData) => {
  await demandeStore.createDemande(demandeData)
  closeModal()
}

const filteredDemandes = computed(() => {
  let result = demandeStore.demandes

  if (activeTab.value !== 'all') {
    const statusMap = { attente: 'En attente', cours: 'En cours', terminees: 'Terminée' }
    result = result.filter((d) => d.statut === statusMap[activeTab.value])
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (d) =>
        d.numero_demande.toLowerCase().includes(q) ||
        String(d.patient_id).includes(q)
    )
  }

  return result
})
</script>
