export interface MantencionData {
  id: number;
  id_equipo: number;
  patente_equipo: string;
  marca_equipo: string;
  nombre_tipo: string;
  fecha_ini: string;
  fecha_fin: string | null;
  estado: boolean;
  nombre_mecanico: string | null;
  observaciones: string | null;
}