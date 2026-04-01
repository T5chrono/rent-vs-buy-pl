// Maps the first two digits of a Polish postal code to a city key in cityPrices.ts
// Polish zip codes follow XX-YYY format; the two-digit prefix loosely maps to a postal district.
const zipPrefixToCity: Record<string, string> = {
  // Warszawa and surroundings (00–09)
  '00': 'warszawa',
  '01': 'warszawa',
  '02': 'warszawa',
  '03': 'warszawa',
  '04': 'warszawa',
  '05': 'warszawa',
  '06': 'warszawa',
  '07': 'warszawa',
  '08': 'warszawa',
  '09': 'warszawa',
  // Warmia-Mazury — Olsztyn
  '10': 'olsztyn',
  '11': 'olsztyn',
  '12': 'olsztyn',
  '13': 'olsztyn',
  '14': 'olsztyn',
  // Podlaskie — Białystok
  '15': 'bialystok',
  '16': 'bialystok',
  '17': 'bialystok',
  '18': 'bialystok',
  '19': 'bialystok',
  // Lubelskie — Lublin
  '20': 'lublin',
  '21': 'lublin',
  '22': 'lublin',
  '23': 'lublin',
  '24': 'lublin',
  // Świętokrzyskie — Kielce
  '25': 'kielce',
  '26': 'kielce',
  '27': 'kielce',
  '28': 'kielce',
  '29': 'kielce',
  // Małopolskie — Kraków
  '30': 'krakow',
  '31': 'krakow',
  '32': 'krakow',
  '33': 'krakow',
  '34': 'krakow',
  // Podkarpackie — Rzeszów
  '35': 'rzeszow',
  '36': 'rzeszow',
  '37': 'rzeszow',
  '38': 'rzeszow',
  '39': 'rzeszow',
  // Śląskie — Katowice
  '40': 'katowice',
  '41': 'katowice',
  '42': 'katowice',
  '43': 'katowice',
  '44': 'katowice',
  // Opolskie — Opole
  '45': 'opole',
  '46': 'opole',
  '47': 'opole',
  '48': 'opole',
  '49': 'opole',
  // Dolnośląskie — Wrocław
  '50': 'wroclaw',
  '51': 'wroclaw',
  '52': 'wroclaw',
  '53': 'wroclaw',
  '54': 'wroclaw',
  '55': 'wroclaw',
  '56': 'wroclaw',
  // Dolnośląskie mountains — Jelenia Góra → Wrocław as closest
  '57': 'wroclaw',
  '58': 'wroclaw',
  '59': 'wroclaw',
  // Wielkopolskie — Poznań
  '60': 'poznan',
  '61': 'poznan',
  '62': 'poznan',
  '63': 'poznan',
  '64': 'poznan',
  // Lubuskie — Zielona Góra / Gorzów Wlkp
  '65': 'zielona_gora',
  '66': 'zielona_gora',
  '67': 'zielona_gora',
  '68': 'zielona_gora',
  '69': 'gorzow',
  // Zachodniopomorskie — Szczecin
  '70': 'szczecin',
  '71': 'szczecin',
  '72': 'szczecin',
  '73': 'szczecin',
  '74': 'szczecin',
  '75': 'szczecin',
  '76': 'szczecin',
  '77': 'szczecin',
  '78': 'szczecin',
  // Pomorskie — Gdańsk / Gdynia / Sopot
  '80': 'gdansk',
  '81': 'gdynia',
  '82': 'gdansk',
  '83': 'gdansk',
  '84': 'gdansk',
  // Kujawsko-Pomorskie — Bydgoszcz / Toruń
  '85': 'bydgoszcz',
  '86': 'bydgoszcz',
  '87': 'torun',
  '88': 'bydgoszcz',
  '89': 'bydgoszcz',
  // Łódź
  '90': 'lodz',
  '91': 'lodz',
  '92': 'lodz',
  '93': 'lodz',
  '94': 'lodz',
  '95': 'lodz',
  '96': 'lodz',
  '97': 'lodz',
  '98': 'lodz',
  // Central Mazovia — treat as Radom / Warsaw
  '99': 'radom',
};

export function cityKeyFromZip(zip: string): string {
  // Accept "XX-YYY" or "XXYYYY" formats
  const cleaned = zip.replace(/\D/g, '');
  const prefix = cleaned.slice(0, 2);
  return zipPrefixToCity[prefix] ?? 'default';
}
