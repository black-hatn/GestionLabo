import { Activity, ShieldCheck, Cpu, Globe2, Users, Microchip } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden selection:bg-primary-500/30">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20 relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Notre Mission : <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">Redéfinir l&apos;analyse médicale.</span>
        </h1>
        
        <p className="text-xl text-slate-400 leading-relaxed mb-16">
          Chez NovaBio Lab, nous croyons que la technologie doit s&apos;effacer derrière le soin. Notre plateforme a été conçue par des médecins, pour des médecins, avec l&apos;appui des dernières avancées en Intelligence Artificielle.
        </p>

        <div className="space-y-24">
          {/* Section 1 */}
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-6">
                <Cpu size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">L&apos;IA au service du diagnostic</h2>
              <p className="text-slate-400 leading-relaxed">
                Notre algorithme propriétaire analyse des millions de points de données issus de la recherche médicale mondiale pour mettre en évidence les corrélations invisibles à l&apos;œil nu. Il n&apos;est pas là pour remplacer le praticien, mais pour être son assistant le plus brillant.
              </p>
            </div>
            <div className="flex-1 w-full h-64 bg-slate-900 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Microchip className="w-24 h-24 text-primary-500/30 animate-pulse" />
                </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <Globe2 size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Une vision globale</h2>
              <p className="text-slate-400 leading-relaxed">
                Nous sommes déployés dans plus de 50 établissements à travers le monde, interconnectant de manière sécurisée les laboratoires, les hôpitaux et les cabinets libéraux pour un parcours patient sans couture.
              </p>
            </div>
            <div className="flex-1 w-full h-64 bg-slate-900 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Globe2 className="w-24 h-24 text-cyan-500/30" />
                </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
