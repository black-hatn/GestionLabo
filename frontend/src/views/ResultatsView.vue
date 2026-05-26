<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Résultats</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Saisissez et validez les résultats d'analyses</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex flex-col sm:flex-row gap-4 items-center">
      <div class="flex-1 relative w-full sm:w-auto">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher demande..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>
      <select
        v-model="filterValidation"
        class="px-4 py-2 w-full sm:w-auto border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <option value="all">Tous</option>
        <option value="validated">Validés</option>
        <option value="pending">En attente</option>
      </select>
    </div>

    <!-- Results Table -->
    <div v-if="resultatStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="filteredResultats.length === 0" class="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
      <BeakerIcon class="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
      <p class="text-slate-600 dark:text-slate-400">Aucun résultat trouvé</p>
    </div>

    <div v-else class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Demande</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Examen</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Valeur</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Anormal</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Statut</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr v-for="resultat in filteredResultats" :key="resultat.id_resultat" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{{ resultat.demande_id }}</td>
              <td class="px-6 py-4 text-slate-900 dark:text-slate-200 font-medium">Examen #{{ resultat.examen_id }}</td>
              <td class="px-6 py-4">
                <input
                  type="text"
                  :value="resultat.valeur"
                  @input="(e) => updateResultat(resultat.id_resultat, { valeur: e.target.value })"
                  class="w-24 px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    resultat.est_anormal 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800' 
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800'
                  ]"
                >
                  {{ resultat.est_anormal ? '⚠ Anormal' : '✓ Normal' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    resultat.est_valide 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                  ]"
                >
                  {{ resultat.est_valide ? 'Validé' : 'En attente' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button
                  v-if="!resultat.est_valide"
                  @click="validateResultat(resultat.id_resultat)"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Valider
                </button>
                <span v-else class="text-slate-500 dark:text-slate-500 text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useResultatStore } from '../stores/resultat'
import { MagnifyingGlassIcon, BeakerIcon } from '@heroicons/vue/24/outline'

const resultatStore = useResultatStore()
const searchQuery = ref('')
const filterValidation = ref('all')

onMounted(() => {
  resultatStore.fetchResultats()
})

const updateResultat = async (id, data) => {
  await resultatStore.updateResultat(id, data)
}

const validateResultat = async (id) => {
  await resultatStore.validateResultat(id)
}

const filteredResultats = computed(() => {
  let result = resultatStore.resultats

  if (filterValidation.value === 'validated') {
    result = result.filter((r) => r.est_valide)
  } else if (filterValidation.value === 'pending') {
    result = result.filter((r) => !r.est_valide)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((r) => String(r.demande_id).includes(q))
  }

  return result
})
</script>
