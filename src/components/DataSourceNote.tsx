export function DataSourceNote() {
  return (
    <footer className="border-t border-gray-100 pt-4 text-xs text-gray-400 space-y-1">
      <p>
        <strong>Źródła danych:</strong> NBP BaRN (Bank and Real Estate Market) Q3 2025 ·
        GUS BDL — kategoria K11 (Mieszkalnictwo) · Średnie ceny transakcyjne dla rynku
        pierwotnego i wtórnego.
      </p>
      <p>
        <strong>Zastrzeżenie:</strong> Kalkulator służy wyłącznie celom informacyjnym i nie
        stanowi porady finansowej. Wyniki symulacji Monte Carlo są probabilistyczne i nie
        gwarantują przyszłych rezultatów. Przed podjęciem decyzji skonsultuj się z doradcą
        finansowym.
      </p>
      <p className="text-gray-300">
        Kod źródłowy: React + Vite + Recharts · Symulacja: 1 000 iteracji Monte Carlo
      </p>
    </footer>
  );
}
