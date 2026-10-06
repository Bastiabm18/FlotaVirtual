
import Link from 'next/link';
import { FiArrowLeft, FiCompass } from 'react-icons/fi';
import HeroPage from './components/HeroPage';
import SeccionSeguimiento from './components/SeccionSeguimiento';
import SeccionMantenciones from './components/SeccionMantenciones';
import SeccionGestion from './components/seccionGestion';
import SeccionRutasYViajes from './components/SeccionRutasYViajes';
import SeccionIntegracionServicios from './components/SeccionIntegracionServicios';

export default function PaginaQuienesSomos() {
  return (
    <main className="min-h-screen font-['Special_Elite'] bg-zinc-900 text-white selection:bg-orange-500 selection:text-white overflow-y-scroll">
      {/* Barra superior de navegación / retorno */}
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b border-zinc-800">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <FiArrowLeft /> Volver
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 tracking-wider uppercase">
          <FiCompass size={15} /> Plataforma 
        </div>
      </nav>

      {/* Secciones modularizadas */}
      <div className="space-y-16 pb-20">
        <HeroPage />
        <SeccionSeguimiento />
        <SeccionRutasYViajes/>
        <SeccionIntegracionServicios/>
        <SeccionMantenciones />
        <SeccionGestion />
      </div>

      {/* Footer minimalista */}
      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} BarriosWeb.cl — Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}