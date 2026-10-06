export interface DatosUsuarioCompleto {
  id: string;
  email: string;
  nombre: string;
  empresa: string;
  avatarUrl?: string;
  proveedor: string;
}

export interface ClienteData {
  id: number;
  nombre_cliente: string;
  es_empresa: boolean;
  estado_cliente: boolean;
}