import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (identifiant, motDePasse) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.login(identifiant, motDePasse)
      token.value = response.data.access_token
      user.value = {
        id: response.data.user_id,
        role: response.data.role
      }
      localStorage.setItem('token', token.value)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Erreur de connexion avec le serveur API'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout
  }
})
