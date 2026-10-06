import FormularioAuth from '../componentes/autenticacion/FormularioAuth';
import PresentacionAuth from '@/componentes/autenticacion/PresentacionAuth';

export default function PaginaInicio() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-white">
      {/* 1/3 Ancho - Panel Formulario */}
      <section className="w-full md:w-1/3 h-full flex items-center justify-center px-8 lg:px-12 border-r border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md z-10">
        <FormularioAuth />
      </section>

      {/* 2/3 Ancho - Panel Presentación Visual */}
      <section className="hidden md:flex md:w-2/3 h-full">
        <PresentacionAuth />
      </section>
    </main>
  );
}