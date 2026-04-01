import type { CityData } from '../types';

// Sourced from NBP BaRN Q3 2025 report and GUS BDL subject K11 (housing market data).
// Prices are approximate medians for the primary/secondary combined market.
// pricePerSqm: PLN per square metre (purchase)
// rentPerSqm:  PLN per square metre per month (rental market)
export const cityPrices: Record<string, CityData> = {
  warszawa: {
    city: 'Warszawa',
    voivodeship: 'mazowieckie',
    pricePerSqm: 16000,
    rentPerSqm: 70,
  },
  krakow: {
    city: 'Kraków',
    voivodeship: 'małopolskie',
    pricePerSqm: 14000,
    rentPerSqm: 62,
  },
  wroclaw: {
    city: 'Wrocław',
    voivodeship: 'dolnośląskie',
    pricePerSqm: 13500,
    rentPerSqm: 60,
  },
  gdansk: {
    city: 'Gdańsk',
    voivodeship: 'pomorskie',
    pricePerSqm: 13000,
    rentPerSqm: 58,
  },
  poznan: {
    city: 'Poznań',
    voivodeship: 'wielkopolskie',
    pricePerSqm: 12000,
    rentPerSqm: 55,
  },
  lodz: {
    city: 'Łódź',
    voivodeship: 'łódzkie',
    pricePerSqm: 9000,
    rentPerSqm: 45,
  },
  katowice: {
    city: 'Katowice',
    voivodeship: 'śląskie',
    pricePerSqm: 10500,
    rentPerSqm: 48,
  },
  szczecin: {
    city: 'Szczecin',
    voivodeship: 'zachodniopomorskie',
    pricePerSqm: 10000,
    rentPerSqm: 47,
  },
  lublin: {
    city: 'Lublin',
    voivodeship: 'lubelskie',
    pricePerSqm: 10000,
    rentPerSqm: 46,
  },
  bialystok: {
    city: 'Białystok',
    voivodeship: 'podlaskie',
    pricePerSqm: 9500,
    rentPerSqm: 44,
  },
  rzeszow: {
    city: 'Rzeszów',
    voivodeship: 'podkarpackie',
    pricePerSqm: 10500,
    rentPerSqm: 48,
  },
  bydgoszcz: {
    city: 'Bydgoszcz',
    voivodeship: 'kujawsko-pomorskie',
    pricePerSqm: 9500,
    rentPerSqm: 43,
  },
  torun: {
    city: 'Toruń',
    voivodeship: 'kujawsko-pomorskie',
    pricePerSqm: 9000,
    rentPerSqm: 42,
  },
  kielce: {
    city: 'Kielce',
    voivodeship: 'świętokrzyskie',
    pricePerSqm: 8500,
    rentPerSqm: 40,
  },
  olsztyn: {
    city: 'Olsztyn',
    voivodeship: 'warmińsko-mazurskie',
    pricePerSqm: 9500,
    rentPerSqm: 43,
  },
  opole: {
    city: 'Opole',
    voivodeship: 'opolskie',
    pricePerSqm: 9000,
    rentPerSqm: 41,
  },
  zielona_gora: {
    city: 'Zielona Góra',
    voivodeship: 'lubuskie',
    pricePerSqm: 8500,
    rentPerSqm: 40,
  },
  gorzow: {
    city: 'Gorzów Wlkp.',
    voivodeship: 'lubuskie',
    pricePerSqm: 8000,
    rentPerSqm: 38,
  },
  gdynia: {
    city: 'Gdynia',
    voivodeship: 'pomorskie',
    pricePerSqm: 13500,
    rentPerSqm: 59,
  },
  czestochowa: {
    city: 'Częstochowa',
    voivodeship: 'śląskie',
    pricePerSqm: 7500,
    rentPerSqm: 37,
  },
  radom: {
    city: 'Radom',
    voivodeship: 'mazowieckie',
    pricePerSqm: 7000,
    rentPerSqm: 35,
  },
  sosnowiec: {
    city: 'Sosnowiec',
    voivodeship: 'śląskie',
    pricePerSqm: 8000,
    rentPerSqm: 38,
  },
  default: {
    city: 'Polska (średnia)',
    voivodeship: '',
    pricePerSqm: 10000,
    rentPerSqm: 47,
  },
};
