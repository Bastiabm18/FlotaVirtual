'use client';

import { ProveedorMapa } from '@/contexto/ContextoMapa';
import MapaLienzo from '@/componentes/mapa/MapaLienzo';
import SidebarMenu from '@/componentes/mapa/SidebarMenu';
import Overlays from '@/componentes/mapa/Overlays';
import { ProveedorUI } from '@/contexto/ContextoUI';
import ToastDesvios from '@/componentes/toast/ToastDesvios';
import {useDesviosRealtime} from '@/hooks/useDesviosrealtime'

export default function PaginaMiSeguimiento() {
  const { desviosActivos, cerrarToast } = useDesviosRealtime();
  return (
    <ProveedorMapa>
        <ProveedorUI>
             <main className="relative w-screen h-screen overflow-hidden bg-zinc-950">
              {/* Componente Toast Global de Desvíos */}
      <ToastDesvios desviosActivos={desviosActivos} onCerrarToast={cerrarToast} />
               {/* Sidebar flotante con controles de estado */}
          
               <SidebarMenu />
          
               {/* Lienzo Canvas con Mapbox GL */}
               <MapaLienzo />
               <Overlays />
             </main>
      </ProveedorUI>
  </ProveedorMapa>
  );
}