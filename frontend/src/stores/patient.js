import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const usePatientStore = defineStore('patient', () => {
  const patients = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchPatients = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/patients/')
      patients.value = response.data
    } catch (err) {
      error.value = "Impossible de charger les patients. Vérifiez que le serveur est démarré."
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const createPatient = async (patientData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/patients/', patientData)
      patients.value.unshift(response.data)
      return { success: true, patient: response.data }
    } catch (err) {
      error.value = err.response?.data?.detail || err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return { patients, loading, error, fetchPatients, createPatient }
})
