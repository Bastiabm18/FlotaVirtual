import { Polygon } from 'geojson';

export interface GeoJSONLineString {
  type: 'LineString'
  coordinates: [number, number][]
}

export interface RutaData {
  id: string
  id_ruta: string
  nombre: string
  descripcion: string
  estado: boolean
  geojson: GeoJSONLineString
  creado_en: string
  largo_km: number
}

export interface PoligonoData {
  idx: number
  id: string
  id_poligono: string
  nombre: string
  descripcion: string
  estado: boolean
  geojson: Polygon
  creado_en: string
  tipo_poligono: string
  color: string
  color_borde: string
}

export interface TipoPoligonoOption {
  id: number;
  tipo_poligono: string;
  color: string;
  color_borde: string;
}


export interface Coordenada {
  lng: number;
  lat: number;
}

export interface PoligonoRutaOption {
  id: string | number;
  id_poligono?: string | number;
  nombre: string;
  geojson: any;
}

export type ModoCreacionRuta = 'AUTOMATICO' | 'MANUAL' | null;

export interface EquipoData {
  id_equipo: number;
  patente_equipo: string;
  marca_equipo: string;
  anio_equipo: number;
  latitud_equipo: number;
  longitud_equipo: number;
  heading_equipo: number;
  num_chasis_equipo: string;
}

export interface PopUpEquipoProps {
  patente: string;
  marca: string;
  anio: number;
  chasis: string;
  heading: number;
}

export interface ConductorData {
  id: string;
  nombre: string;
  apellidopat: string;
  apellidomat: string;
  rut: string;
  edad: number;
  fecha_nacimiento: string; // formato 'YYYY-MM-DD'
  tipo_licencia: string;
  fecha_ingreso: string;
  estado_conductor: boolean;
}



export interface EstadoEquipo {
  id: number;
  nombre_estado: string;
}

export interface EstadoConductor {
  id: number;
  nombre_estado: string;
}

export interface AsignacionEquipoDetalle {
  id_asignacion: number;
  id_equipo: number;
  patente_equipo: string;
  marca_equipo: string;
  id_conductor: string | null;
  nombre_conductor: string | null;
  rut_conductor: string | null;
  fecha_ini: string | null;
  estado_asignacion: boolean;
  id_estado_equipo: number;
  nombre_estado_equipo: string;
}

export interface ProductoData {
  id: number;
  nombre_producto: string;
  id_estado_producto: number;
  nombre_estado_producto: string;
  estado: boolean;
}

export interface EstadoProductoOption {
  id: number;
  nombre_estado: string;
}

export interface EquipoRealtimePayload {
  id_equipo: number;
  patente_equipo: string;
  marca_equipo: string;
  anio_equipo: number;
  latitud_equipo: number;
  longitud_equipo: number;
  heading_equipo: number;
  num_chasis_equipo: string;
}


export interface DesvioToastItem {
  id_equipo: string;
  cantidad: number;
  ultimaDistancia: number;
  fechaUltimo: string;
}


export interface DesvioRealtimePayload {
  id: number;
  id_viaje: number;
  id_equipo: string;
  distancia: number;
  fecha_creacion: string;
}