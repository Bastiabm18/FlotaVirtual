'use server';

import https from 'https';

/**Al usar https.get nativo de Node.js en lugar del fetch global de Next.js, 
 * evitamos las restricciones internas de caché
 *  y los bloqueos de handshake TLS que a veces sufren las conexiones 
 * TODO ESTO ES POR QUE CON CIERTAS FIBRA OPTICA NO PUEDES CONECTARTE A LA API DE CLIMAS (NI IDEA POR QUE )*/

export async function getClimaPorCoordenadas(lat: number, lon: number) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return { exito: false, data: null };
  }

  const apiKey =process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=es&units=metric`;

  return new Promise((resolve) => {
    // Configuramos la petición HTTPS con opciones similares a cURL
    const req = https.get(url, { timeout: 8000 }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const decoded = JSON.parse(data);

            if (!decoded.weather || !decoded.main) {
              resolve({ exito: false, data: null });
              return;
            }

            let ciudad = decoded.name || 'Sin nombre';
            if (decoded.sys?.country) {
              ciudad = `${ciudad}, ${decoded.sys.country}`;
            }

            const resultadoClima = {
              ciudad,
              temperatura: Math.round(decoded.main.temp * 10) / 10,
              minima: Math.round(decoded.main.temp_min * 10) / 10,
              maxima: Math.round(decoded.main.temp_max * 10) / 10,
              humedad: decoded.main.humidity,
              viento: Math.round((decoded.wind?.speed || 0) * 3.6 * 10) / 10,
              descripcion: decoded.weather[0].description.charAt(0).toUpperCase() + decoded.weather[0].description.slice(1),
              icono: decoded.weather[0].icon,
            };

            resolve({ exito: true, data: resultadoClima });
          } catch (e) {
            resolve({ exito: false, data: null });
          }
        } else {
          resolve({ exito: false, data: null });
        }
      });
    });

    req.on('error', (error) => {
      console.warn('Error de red al consultar OpenWeather (evitado):', error.message);
      resolve({ exito: false, data: null });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ exito: false, data: null });
    });
  });
}