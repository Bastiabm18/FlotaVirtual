// supabase/functions/edge-types.d.ts
// ESTO ES PARA ELIMINAR LOS ERRORES DE TIPO EN LOS ARCHIVOS DE FUNCIONES DE SUPABASE, 
// YA QUE DENO NO RECONOCE LOS TIPOS DE SUPABASE NI LOS MÓDULOS ESM COMO DENO


// Declarar Deno
declare namespace Deno {
  function serve(handler: (req: Request) => Promise<Response>): void;
  
  namespace env {
    function get(key: string): string | undefined;
  }
}

// Declarar módulos ESM de Supabase
declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

declare module 'https://esm.sh/@supabase/supabase-js@2/*' {
  export * from '@supabase/supabase-js/*';
}