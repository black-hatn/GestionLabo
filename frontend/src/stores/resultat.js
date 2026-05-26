import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useResultatStore = defineStore('resultat', () => {
  const resultats = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchResultats = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/resultats/')
      resultats.value = response.data
    } catch (err) {
      error.value = "Impossible de charger les résultats."
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const updateResultat = async (id, data) => {
    try {
      const response = await api.put(`/resultats/${id}`, data)
      const index = resultats.value.findIndex(r => r.id_resultat === id)
      if (index !== -1) {
        resultats.value[index] = response.data
      }
      return { success: true, resultat: response.data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const validateResultat = async (id) => {
    try {
      const response = await api.put(`/resultats/${id}/validate`)
      const index = resultats.value.findIndex(r => r.id_resultat === id)
      if (index !== -1) {
        resultats.value[index] = response.data
      }
      return { success: true, resultat: response.data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { resultats, loading, error, fetchResultats, updateResultat, validateResultat }
})
