<template>
  <div class="profile-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Mon Profil</h1>
        <p class="page-subtitle">Gérez vos informations personnelles et votre sécurité</p>
      </div>
    </div>

    <div class="profile-grid">
      <!-- Profile Card -->
      <div class="panel profile-card">
        <div class="avatar-section">
          <div class="avatar-xl">
            {{ userInitials }}
          </div>
          <h2>{{ authStore.user?.nom || 'Utilisateur' }}</h2>
          <span class="role-badge">{{ authStore.user?.role || 'Utilisateur' }}</span>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ demandeStore.demandes.length }}</span>
            <span class="stat-label">Demandes créées</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ completedCount }}</span>
            <span class="stat-label">Dossiers terminés</span>
          </div>
        </div>
      </div>

      <!-- Info Form -->
      <div class="panel form-panel">
        <div class="panel-header">
          <h3>Informations du compte</h3>
        </div>
        <div class="form-body">
          <div class="form-row">
            <div class="form-group">
              <label>Identifiant</label>
              <input type="text" :value="authStore.user?.identifiant || 'admin'" disabled class="input-field disabled" />
            </div>
            <div class="form-group">
              <label>Rôle</label>
              <input type="text" :value="authStore.user?.role || '-'" disabled class="input-field disabled" />
            </div>
          </div>

          <hr class="divider" />

          <h4 class="section-subtitle"><i class='bx bx-lock-alt'></i> Changer le mot de passe</h4>
          <div class="form-group">
            <label>Mot de passe actuel</label>
            <input type="password" v-model="passwordForm.current" class="input-field" placeholder="••••••••" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" v-model="passwordForm.new" class="input-field" placeholder="••••••••" />
            </div>
            <div class="form-group">
              <label>Confirmer</label>
              <input type="password" v-model="passwordForm.confirm" class="input-field" placeholder="••••••••" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" @click="changePassword" :disabled="!canSubmit">
              <i class='bx bx-check'></i> Enregistrer
            </button>
            <button class="btn btn-outline" @click="logout">
              <i class='bx bx-log-out'></i> Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDemandeStore } from '../stores/demande'
import { useToastStore } from '../stores/toast'

const authStore = useAuthStore()
const demandeStore = useDemandeStore()
const toastStore = useToastStore()
const router = useRouter()

onMounted(() => demandeStore.fetchDemandes())

const completedCount = computed(() =>
  demandeStore.demandes.filter(d => d.statut === 'Terminée').length
)

const userInitials = computed(() => {
  const name = authStore.user?.nom || authStore.user?.role || 'A'
  return name.substring(0, 2).toUpperCase()
})

const passwordForm = ref({ current: '', new: '', confirm: '' })

const canSubmit = computed(() =>
  passwordForm.value.current && passwordForm.value.new && passwordForm.value.new === passwordForm.value.confirm
)

const changePassword = () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    toastStore.error('Les mots de passe ne correspondent pas.')
    return
  }
  // In a real app, call API here
  toastStore.success('Mot de passe mis à jour avec succès !')
  passwordForm.value = { current: '', new: '', confirm: '' }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-container {
  font-family: var(--font-sans);
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--secondary);
  font-weight: 700;
  margin-bottom: 5px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: start;
}

.panel {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* Profile Card */
.profile-card {
  padding: 32px 24px;
  text-align: center;
}

.avatar-section {
  margin-bottom: 24px;
}

.avatar-xl {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, var(--primary), #6366f1);
  color: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(79, 172, 254, 0.4);
}

.avatar-section h2 {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--secondary);
  margin-bottom: 8px;
}

.role-badge {
  background: var(--primary-light);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: capitalize;
}

.profile-stats {
  display: flex;
  border-top: 1px solid var(--border-light);
  padding-top: 24px;
  gap: 8px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: var(--bg-main);
  border-radius: 12px;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
  font-family: var(--font-display);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Form Panel */
.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
}

.panel-header h3 {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--secondary);
  font-weight: 600;
}

.form-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--secondary);
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-main);
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--secondary);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.input-field.disabled {
  background: var(--bg-main);
  color: var(--text-muted);
  cursor: not-allowed;
}

.divider {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 24px 0;
}

.section-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary);
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 6px -1px var(--primary-light);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border-main);
}

.btn-outline:hover {
  background: var(--bg-main);
  color: #ef4444;
  border-color: #ef4444;
}

@media (max-width: 900px) {
  .profile-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
