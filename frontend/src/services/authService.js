import api from './api'

export const authService = {
  login(identifiant, motDePasse) {
    return api.post('/auth/login', {
      identifiant,
      mot_de_passe: motDePasse
    })
  },

  logout() {
    return api.post('/auth/logout')
  }
}
