export interface ViajeDetalle {
  id_viaje: number;
  id_equipo: number;
  patente_equipo: string;
  marca_equipo: string;
  id_conductor: string;
  nombre_conductor: string;
  rut_conductor: string;
  id_origen: string;
  nombre_origen: string;
  id_destino: string;
  nombre_destino: string;
  fecha_viaje: string;
  fecha_hora_inicio: string;
  fecha_hora_lle_origen: string | null;
  fecha_hora_sal_origen: string | null;
  fecha_hora_lle_des: string | null;
  fecha_hora_sal_des: string | null;
  id_guia: number;
  guia_numero: string;
  cantidad_carga: number;
  peso_carga: number;
  estado_viaje: number;
  nombre_estado_viaje: string;
  id_cliente: number;
  nombre_cliente: string;
  id_producto: number;
  nombre_producto: string;
}

export interface EquipoAsignadoDisponible {
  id_equipo: number;
  patente_equipo: string;
  marca_equipo: string;
  id_conductor: string;
  nombre_conductor: string;
  rut_conductor: string;
}

export interface PoligonoOption {
  id: string;
  nombre: string;
}

export interface ClienteOption {
  id: number;
  nombre_cliente: string;
}

export interface ProductoOption {
  id: number;
  nombre_producto: string;
}

