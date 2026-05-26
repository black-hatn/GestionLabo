import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import HomeView from '../views/HomeView.vue'
import PatientsView from '../views/PatientsView.vue'
import DemandesView from '../views/DemandesView.vue'
import ResultatsView from '../views/ResultatsView.vue'
import ProfilView from '../views/ProfilView.vue'
import EspacePatientView from '../views/EspacePatientView.vue'

const routes = [
  {
    path: '/espace-patient',
    name: 'EspacePatient',
    component: EspacePatientView,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/patients',
    name: 'Patients',
    component: PatientsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/demandes',
    name: 'Demandes',
    component: DemandesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/resultats',
    name: 'Resultats',
    component: ResultatsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profil',
    name: 'Profil',
    component: ProfilView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
