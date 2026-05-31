import { TestTube2, FileSignature, ShieldAlert, LineChart, Pill, Fingerprint } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function ServicesPage() {
  const services = [
    {
      icon: <TestTube2 className="w-6 h-6" />,
      title: "Analyses Hématologiques",
      description: "Hémogramme complet, bilans de coagulation et marqueurs sanguins avec interprétation IA.",
      color: "text-red-400",
      bg: "bg-red-400/10"
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "Dépistage Immunologique",
      description: "Tests sérologiques, marqueurs tumoraux et bilans d'allergologie ultra-précis.",
      color: "text-primary-400",
      bg: "bg-primary-400/10"
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "Génétique Moléculaire",
      description: "Séquençage ADN, détection de mutations et profils génétiques prédictifs.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10"
    },
    {
      icon: <FileSignature className="w-6 h-6" />,
      title: "Certification de Rapports",
      description: "Génération de bilans signés numériquement, conformes aux standards légaux.",
      color: "text-secondary-400",
      bg: "bg-secondary-400/10"
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: "Toxicologie",
      description: "Recherche de stupéfiants, dosages médicamenteux et bilans métaboliques.",
      color: "text-warning-400",
      bg: "bg-warning-400/10"
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Suivi Chronique",
      description: "Tableaux de bord dynamiques pour l'évolution des patients atteints de maladies chroniques.",
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 relative z-10">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Nos Services <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Laboratoires</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Une gamme complète d&apos;outils d&apos;analyse couplée à une interface logicielle révolutionnaire pour vous offrir le meilleur diagnostic possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
              <div className={`w-14 h-14 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center mb-6`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-slate-400 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
