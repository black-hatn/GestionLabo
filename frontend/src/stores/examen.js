import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useExamenStore = defineStore('examen', () => {
  const examens = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchExamens = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/examens/')
      examens.value = response.data
    } catch (err) {
      error.value = "Impossible de charger le catalogue d'examens."
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { examens, loading, error, fetchExamens }
})
