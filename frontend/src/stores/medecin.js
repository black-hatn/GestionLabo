import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useMedecinStore = defineStore('medecin', () => {
  const medecins = ref([])
  const loading = ref(false)

  const fetchMedecins = async () => {
    loading.value = true
    try {
      const response = await api.get('/medecins/')
      medecins.value = response.data
    } catch (err) {
      console.error('Erreur chargement médecins:', err)
    } finally {
      loading.value = false
    }
  }

  return { medecins, loading, fetchMedecins }
})
