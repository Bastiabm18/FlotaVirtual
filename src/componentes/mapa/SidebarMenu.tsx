'use client';

import { useState, useEffect } from 'react';
import { obtenerPerfilUsuario } from '@/actions/usuario/actions';
import { createClient } from '@/lib/supabase/client';
import { useUI } from '@/contexto/ContextoUI';
import { 
  FiUser, 
  FiLogOut, 
  FiChevronLeft, 
  FiChevronRight,
  FiTruck,
  FiMapPin,
  FiSliders,
  FiTool,
} from 'react-icons/fi';
import { PiSteeringWheelBold } from 'react-icons/pi';
import { LuFactory } from "react-icons/lu";
import { PiPolygonBold } from 'react-icons/pi';
import { TbRouteSquare } from 'react-icons/tb';
import { DatosUsuarioCompleto } from '@/types/usuario';
import { LiaTachometerAltSolid } from "react-icons/lia";
import { MdProductionQuantityLimits } from "react-icons/md";
// Importación de submódulos independientes
import ModuloPoligonos from '../sidebarModulos/ModuloPoligonos';
import ModuloRutas from '../sidebarModulos/ModuloRutas';
import { ModuloActivo } from '@/types/sistema';
import ModuloFlotas from '../sidebarModulos/ModuloFlotas';
import ModuloMiCuenta from '../sidebarModulos/ModuloMiCuenta';
import ModuloConductores from '../sidebarModulos/ModuloConductores';
import ModuloAsignacionEquipo from '../sidebarModulos/ModuloAsignacionEquipo';
import ModuloViajes from '../sidebarModulos/ModuloViajes';
import ModuloClientes from '../sidebarModulos/ModuloClientes';
import ModuloProducto from '../sidebarModulos/ModuloProducto';
import ModuloMantencionEquipo from '../sidebarModulos/ModuloMantencionEquipo';
import ModuloExcesosVel from '../sidebarModulos/ModuloExcesosVel';
import ModuloViajesFinalizados from '../sidebarModulos/ModuloViajesFinalizados';


// Configuración de los botones del menú principal
const OPCIONES_MENU = [
  { id: 'viajes_finalizados' as ModuloActivo, etiqueta: 'Viajes', icono: TbRouteSquare, color: 'text-emerald-400' },
  { id: 'flotas' as ModuloActivo, etiqueta: 'Gestión de Flota', icono: FiTruck, color: 'text-blue-400' },
  { id: 'rutas' as ModuloActivo, etiqueta: 'Gestión de Rutas', icono: TbRouteSquare, color: 'text-purple-400' },
  { id: 'poligonos' as ModuloActivo, etiqueta: 'Gestión de Polígonos', icono: PiPolygonBold, color: 'text-orange-400' },
  { id: 'conductores' as ModuloActivo, etiqueta: 'Gestión de Conductores', icono: PiSteeringWheelBold , color: 'text-sky-400' },
  { id: 'asignacion' as ModuloActivo, etiqueta: 'Asignación de Equipos', icono: FiTruck, color: 'text-amber-400' },
  { id: 'programacion' as ModuloActivo, etiqueta: 'Programación de Viajes', icono: FiMapPin, color: 'text-emerald-400' },
  { id: 'clientes' as ModuloActivo, etiqueta: 'Gestión de clientes', icono: LuFactory , color: 'text-red-400' },
  { id: 'productos' as ModuloActivo, etiqueta: 'Gestión de productos', icono: MdProductionQuantityLimits  , color: 'text-purple-400' },
  { id: 'parametros' as ModuloActivo, etiqueta: 'Parámetros de Sistema', icono: FiSliders, color: 'text-amber-400' },
  { id: 'mantencion' as ModuloActivo, etiqueta: 'Mantención Flota', icono: FiTool, color: 'text-gray-400' },
  { id: 'excesos_vel' as ModuloActivo, etiqueta: 'Excesos de Velocidad', icono: LiaTachometerAltSolid , color: 'text-red-400' },
  { id: 'cuenta' as ModuloActivo, etiqueta: 'Cuenta', icono: FiUser, color: 'text-cyan-400' },
];



export default function SidebarMenu() {
  const { moduloActivo, setModuloActivo } = useUI();
  const [colapsado, setColapsado] = useState(false);
  const [usuario, setUsuario] = useState<DatosUsuarioCompleto | null>(null);
 // console.log(usuario);

  useEffect(() => {
    obtenerPerfilUsuario().then((res) => {
      if (res.exito && res.usuario) setUsuario(res.usuario);
    });
  }, []);


  const cerrarSesion = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Mapeo dinámico de componentes por Módulo
  const renderizarModuloActivo = () => {
    switch (moduloActivo) {
      case 'poligonos':
        return <ModuloPoligonos />;
    case 'flotas':
        return <ModuloFlotas />;
      case 'rutas':
        return <ModuloRutas />;
      case 'conductores':
        return <ModuloConductores />;
      case 'asignacion':
        return <ModuloAsignacionEquipo />;
      case 'cuenta':
        return <ModuloMiCuenta />;
      case 'programacion':
       return <ModuloViajes/>;
      case 'clientes':
        return <ModuloClientes />;
      case 'viajes_finalizados':
          return <ModuloViajesFinalizados />;
       case'productos':
       
       return <ModuloProducto/>;

       case'mantencion':
        return <ModuloMantencionEquipo/>;

        case'excesos_vel':
          return <ModuloExcesosVel/>

      default:
        // Renderiza el Menú Principal con los botones
        return (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Gestión Operativa
            </div>
            <div className="space-y-1.5">
              {OPCIONES_MENU.map(({ id, etiqueta, icono: Icono, color }) => (
                <button
                  key={id}
                  onClick={() => setModuloActivo(id)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 text-sm text-zinc-300 hover:bg-zinc-800/80 transition-all cursor-pointer hover:border-zinc-700"
                >
                  <Icono className={color} size={18} />
                  <span>{etiqueta}</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <aside
      className={`absolute top-4 left-4 z-20 h-[calc(100vh-2rem)] transition-all duration-300 ${
        colapsado ? 'w-16' : 'w-80'
      } bg-zinc-900/85 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col justify-between`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Cabecera */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          {!colapsado && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-sm tracking-wide truncate">
                {usuario?.empresa || 'MapaLogística'}
              </span>
            </div>
          )}

          <button
            onClick={() => setColapsado(!colapsado)}
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            {colapsado ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>

        {/* Zona Dinámica */}
        {!colapsado ? (
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            {renderizarModuloActivo()}
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-4 mt-4 text-zinc-400">
            {OPCIONES_MENU.map(({ id, icono: Icono }) => (
              <button key={id} onClick={() => { setColapsado(false); setModuloActivo(id); }}>
                <Icono size={18} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Usuario */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/40 shrink-0">
        {!colapsado ? (
          <div className="p-2.5 bg-zinc-800/60 rounded-xl border border-zinc-700/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <FiUser className="text-blue-400 text-base" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{usuario?.nombre}</span>
                <span className="text-[11px] text-zinc-400 truncate">{usuario?.email}</span>
              </div>
            </div>
            <button onClick={cerrarSesion} className="p-1.5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors">
              <FiLogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={cerrarSesion} className="w-full p-3 flex justify-center text-zinc-400 hover:text-red-400">
            <FiLogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}