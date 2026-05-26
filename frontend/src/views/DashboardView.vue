<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Tableau de bord</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">
          Bienvenue,
          <span class="font-semibold text-blue-600 dark:text-blue-400">{{ authStore.user?.role || 'Laboratoire' }}</span>
        </p>
      </div>
      <button
        @click="router.push('/demandes')"
        class="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm shadow-blue-500/30"
      >
        <PlusIcon class="w-5 h-5" />
        Nouvelle Demande
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        label="Patients"
        :value="patientStore.patients.length || 0"
        trend="+12% ce mois"
        type="primary"
        :icon="UserGroupIcon"
      />
      <StatsCard
        label="Demandes en attente"
        :value="pendingDemandesCount"
        trend="+5 nouvelles"
        type="warning"
        :icon="DocumentTextIcon"
      />
      <StatsCard
        label="Demandes terminées"
        :value="completedDemandesCount"
        trend="+8 ce mois"
        type="success"
        :icon="CheckCircleIcon"
      />
      <StatsCard
        label="Chiffre d'affaires"
        :value="`${(completedDemandesCount * 45).toLocaleString()} €`"
        trend="+15% YoY"
        type="success"
        :icon="CurrencyEuroIcon"
      />
    </div>

    <!-- Charts & Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Activity Chart -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-800 transition-colors">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Évolution activité</h2>
          <select class="px-3 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            <option>Cette semaine</option>
            <option>Ce mois</option>
            <option>Cette année</option>
          </select>
        </div>
        <div class="h-64 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 border border-transparent dark:border-slate-800">
          <p>📊 Graphique d'activité (intégration Chart.js nécessaire)</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-800 transition-colors">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Actions rapides</h2>
        <div class="space-y-3">
          <RouterLink
            to="/patients"
            class="block p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium transition-colors text-sm border border-transparent dark:border-blue-900/30"
          >
            + Ajouter un patient
          </RouterLink>
          <RouterLink
            to="/demandes"
            class="block p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 font-medium transition-colors text-sm border border-transparent dark:border-orange-900/30"
          >
            + Nouvelle demande
          </RouterLink>
          <RouterLink
            to="/resultats"
            class="block p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 font-medium transition-colors text-sm border border-transparent dark:border-green-900/30"
          >
            📝 Saisir résultats
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Recent Requests Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Dernières demandes</h2>
        <RouterLink to="/demandes" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
          Voir tout →
        </RouterLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">N° Demande</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Patient</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Statut</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr v-if="recentDemandes.length === 0" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td colspan="5" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                Aucune demande pour le moment
              </td>
            </tr>
            <tr v-for="demande in recentDemandes" :key="demande.id_demande" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4 font-mono text-slate-900 dark:text-slate-200">{{ demande.numero_demande }}</td>
              <td class="px-6 py-4 text-slate-700 dark:text-slate-300">Patient #{{ demande.patient_id }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ new Date(demande.date_demande).toLocaleDateString('fr-FR') }}</td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    demande.statut === 'Terminée'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800'
                      : demande.statut === 'En cours'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
                  ]"
                >
                  {{ demande.statut }}
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
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePatientStore } from '../stores/patient'
import { useDemandeStore } from '../stores/demande'
import { useRouter, RouterLink } from 'vue-router'
import StatsCard from '../components/StatsCard.vue'
import {
  PlusIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const patientStore = usePatientStore()
const demandeStore = useDemandeStore()
const router = useRouter()

onMounted(() => {
  patientStore.fetchPatients()
  demandeStore.fetchDemandes()
})

const pendingDemandesCount = computed(() => {
  return demandeStore.demandes.filter((d) => d.statut === 'En attente').length
})

const completedDemandesCount = computed(() => {
  return demandeStore.demandes.filter((d) => d.statut === 'Terminée').length
})

const recentDemandes = computed(() => {
  return demandeStore.demandes.slice(0, 5)
})

const chartData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      label: 'Demandes',
      data: [12, 19, 3, 5, 2, 3, 8],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        drawBorder: false,
      },
    },
  },
}
</script>
