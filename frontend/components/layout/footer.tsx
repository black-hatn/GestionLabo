export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <p>© {new Date().getFullYear()} Laboratoire NovaBio. Tous droits réservés.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary-600 transition-colors">Politique de Confidentialité</a>
          <a href="#" className="hover:text-primary-600 transition-colors">Conditions d&apos;Utilisation</a>
          <a href="#" className="hover:text-primary-600 transition-colors">Support Technique</a>
        </div>
      </div>
    </footer>
  );
}
