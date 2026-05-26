import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useDemandeStore = defineStore('demande', () => {
  const demandes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchDemandes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/demandes/')
      demandes.value = response.data
    } catch (err) {
      error.value = "Impossible de charger les demandes."
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const createDemande = async (demandeData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/demandes/', demandeData)
      demandes.value.unshift(response.data)
      return { success: true, demande: response.data }
    } catch (err) {
      error.value = err.response?.data?.detail || err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return { demandes, loading, error, fetchDemandes, createDemande }
})
