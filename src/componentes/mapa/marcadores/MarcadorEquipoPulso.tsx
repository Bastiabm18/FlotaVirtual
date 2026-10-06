// Elemento HTML con animación de pulso CSS puro
export function crearElementoPulso(patente: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'relative flex items-center justify-center w-8 h-8 cursor-pointer';
  el.innerHTML = `
    <!-- Anillo animado expandiéndose (Pulso rojo) -->
    <span class="absolute inline-flex w-full h-full rounded-full bg-yellow-500 opacity-75 animate-ping"></span>
    
    <!-- Centro del marcador -->
    <div class="relative flex items-center justify-center w-6 h-6 bg-yellow-600 rounded-full border-2 border-white shadow-lg text-white">
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    </div>
  `;
  return el;
}