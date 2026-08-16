// @ts-nocheck
// src/lib/countries.ts

// Mapeo de nombres de países/equipos a códigos ISO 3166-1 alpha-2
const countryMap: Record<string, string> = {
  Argentina: 'ar',
  Brazil: 'br',
  France: 'fr',
  England: 'gb',
  Spain: 'es',
  Germany: 'de',
  Portugal: 'pt',
  Netherlands: 'nl',
  Italy: 'it',
  Uruguay: 'uy',
  Croatia: 'hr',
  Morocco: 'ma',
  Japan: 'jp',
  USA: 'us',
  Mexico: 'mx',
  Colombia: 'co',
  Belgium: 'be',
  Senegal: 'sn',
  Switzerland: 'ch',
  Denmark: 'dk',
  'South Korea': 'kr',
  Chile: 'cl',
  Ecuador: 'ec',
  Nigeria: 'ng',
  Cameroon: 'cm',
  Ghana: 'gh',
  Canada: 'ca',
  Australia: 'au',
  Serbia: 'rs',
  Poland: 'pl',
  Peru: 'pe',
  Egypt: 'eg',
  // Puedes añadir más según tus equipos de selecciones
};

// Para equipos de clubes, se puede devolver el código de su liga (por ejemplo, 'es' para España)
// o dejarlo vacío para que no muestre bandera.
export const getCountryCode = (teamName: string): string | undefined => {
  // Primero busca en el mapa por nombre exacto
  if (countryMap[teamName]) return countryMap[teamName];
  // Si no, intenta buscar por coincidencia parcial (opcional)
  // Puedes agregar lógica adicional si lo deseas
  return undefined;
};