<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 overflow-x-hidden">
    <!-- Navbar -->
    <header class="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-500 shadow-sm dark:shadow-none">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <BeakerIcon class="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <span class="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">L'Horizon</span>
        </div>
        <nav class="hidden md:flex gap-8 font-medium text-slate-600 dark:text-slate-300">
          <a href="#services" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Services</a>
          <a href="#about" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">À propos</a>
          <a href="#contact" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
        </nav>
        <div class="flex items-center gap-4">
          <button @click="toggleTheme" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SunIcon v-if="isDark" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <RouterLink to="/espace-patient" class="hidden sm:inline-flex px-5 py-2 rounded-full font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 transition-all">Espace Patient</RouterLink>
          <RouterLink to="/login" class="px-5 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5">Connexion Pro</RouterLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <!-- Decorator Blobs -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      
      <div class="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <!-- Text content -->
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium text-sm mb-8 animate-fade-in-up">
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            Nouveau système de gestion 3.0
          </div>
          <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight font-display animate-fade-in-up" style="animation-delay: 0.1s;">
            Laboratoire de pointe pour des résultats
            <span class="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">précis & rapides</span>
          </h1>
          <p class="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s;">
            L'Horizon offre une plateforme intégrée pour les professionnels de santé et les patients. Accédez à vos bulletins, validez des résultats et suivez l'avancement en temps réel avec une sécurité absolue.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style="animation-delay: 0.3s;">
            <RouterLink to="/login" class="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              Accéder au portail
              <ArrowRightIcon class="w-5 h-5" />
            </RouterLink>
            <a href="#services" class="px-8 py-4 rounded-full font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-1 flex items-center justify-center">
              Découvrir nos services
            </a>
          </div>
          
          <div class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 animate-fade-in-up" style="animation-delay: 0.4s;">
            <div>
              <div class="text-3xl font-bold text-slate-900 dark:text-white">+50k</div>
              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Patients</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-slate-900 dark:text-white">99.9%</div>
              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Précision</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-slate-900 dark:text-white">24/7</div>
              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Support</div>
            </div>
          </div>
        </div>

        <!-- Glassmorphism Visual -->
        <div class="relative lg:h-[600px] flex items-center justify-center animate-fade-in-up" style="animation-delay: 0.3s;">
          <div class="absolute inset-0 bg-gradient-to-tr from-blue-100 to-cyan-50 dark:from-slate-800 dark:to-slate-900 rounded-[3rem] transform rotate-3 scale-105 border border-white/50 dark:border-slate-700/50 shadow-2xl"></div>
          
          <div class="relative z-10 w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <div class="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div class="flex gap-1.5">
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                <div class="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2">Analyse en cours...</div>
            </div>
            
            <div class="space-y-6">
              <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-2/3 rounded-full animate-progress"></div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <BeakerIcon class="w-8 h-8 text-blue-500 mb-3" />
                  <div class="font-semibold text-slate-900 dark:text-white">Hématologie</div>
                  <div class="text-sm text-green-500 font-medium mt-1">Terminé</div>
                </div>
                <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                  <div class="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                  <BugAntIcon class="w-8 h-8 text-cyan-500 mb-3 relative z-10" />
                  <div class="font-semibold text-slate-900 dark:text-white relative z-10">Biochimie</div>
                  <div class="text-sm text-cyan-500 font-medium mt-1 relative z-10">En analyse</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-24 bg-slate-100/50 dark:bg-slate-900/50">
      <div class="container mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl md:text-5xl font-bold font-display mb-6">Une expertise <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">complète</span></h2>
          <p class="text-lg text-slate-600 dark:text-slate-400">Notre laboratoire dispose d'équipements de dernière génération pour garantir la fiabilité de chaque diagnostic avec des rendus dans les meilleurs délais.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Card 1 -->
          <div class="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div class="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <ClipboardDocumentCheckIcon class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Analyses médicales</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">Hématologie, biochimie, immunologie et sérologie traitées par nos automates haute précision.</p>
          </div>
          <!-- Card 2 -->
          <div class="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div class="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <BoltIcon class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Urgence 24/7</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">Un plateau technique disponible jour et nuit pour les urgences vitales avec rendu immédiat des résultats critiques.</p>
          </div>
          <!-- Card 3 -->
          <div class="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <ShieldCheckIcon class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Portail Sécurisé</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">Consultez, téléchargez et archivez vos bulletins de résultats dans un espace 100% crypté et conforme HDS.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-20 pb-10">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-12 mb-16">
          <div class="md:col-span-2">
            <div class="flex items-center gap-2 mb-6">
              <BeakerIcon class="w-8 h-8 text-blue-600 dark:text-blue-500" />
              <span class="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">L'Horizon</span>
            </div>
            <p class="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Votre partenaire santé de confiance pour des diagnostics rapides, précis et sécurisés. Au service des patients et des professionnels depuis 2010.
            </p>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white mb-6">Plateforme</h4>
            <ul class="space-y-4">
              <li><RouterLink to="/espace-patient" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Espace Patient</RouterLink></li>
              <li><RouterLink to="/login" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Espace Professionnel</RouterLink></li>
              <li><a href="#" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Catalogue des examens</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white mb-6">Légal</h4>
            <ul class="space-y-4">
              <li><a href="#" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Confidentialité</a></li>
              <li><a href="#" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Conditions générales</a></li>
              <li><a href="#" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        <div class="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-500">
          <p>&copy; 2026 Laboratoire L'Horizon. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { BeakerIcon, ArrowRightIcon, ClipboardDocumentCheckIcon, BoltIcon, ShieldCheckIcon, BugAntIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const isDark = ref(false)

onMounted(() => {
  // Check if dark mode is enabled on mount
  if (document.documentElement.classList.contains('dark') || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.theme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.theme = 'light'
  }
}
</script>

<style scoped>
/* Keyframes for simple animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes progressLoad {
  from { width: 0%; }
  to { width: 66%; }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-progress {
  animation: progressLoad 2s ease-out forwards;
}

/* Ensure smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>
