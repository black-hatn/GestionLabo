import { useState, useCallback } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import axios from 'axios'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const accessToken = useAuthStore(state => state.accessToken)

  const request = useCallback(
    async (method: string, url: string, data?: any) => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios({
          method,
          url: `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`,
          data,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        return response.data
      } catch (err: any) {
        const message = err.response?.data?.detail || err.message || 'Une erreur est survenue'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [accessToken]
  )

  return { request, loading, error }
}
