/**
 * Tax Assumptions & Macroeconomic Parameters (2017-2025)
 * Bank of Canada FX, IRS Treasury Rates, Standard Mileage, Home Office Business %
 */

export const DEFAULT_TAX_ASSUMPTIONS = {
  2025: {
    year: 2025,
    cadToUsd: 0.71571,
    inrToUsd: 0.0114791,
    inrToCad: 0.016038,
    mileageRate: 0.700,
    homeUsePercent: 20.0,
    notes: '2025 projected baseline rates'
  },
  2024: {
    year: 2024,
    cadToUsd: 0.730462,
    inrToUsd: 0.0119534,
    inrToCad: 0.016364,
    mileageRate: 0.670,
    homeUsePercent: 20.0,
    notes: '2024 IRS standard mileage & Bank of Canada average'
  },
  2023: {
    year: 2023,
    cadToUsd: 0.741166,
    inrToUsd: 0.0121105,
    inrToCad: 0.016339,
    mileageRate: 0.655,
    homeUsePercent: 20.0,
    notes: '2023 Bank of Canada rate'
  },
  2022: {
    year: 2022,
    cadToUsd: 0.769107,
    inrToUsd: 0.0127415,
    inrToCad: 0.016566,
    mileageRate: 0.625,
    homeUsePercent: 20.0,
    notes: '2022 Bank of Canada annual average & mid-year adjusted mileage'
  },
  2021: {
    year: 2021,
    cadToUsd: 0.798008,
    inrToUsd: 0.0135273,
    inrToCad: 0.016951,
    mileageRate: 0.560,
    homeUsePercent: 15.0,
    notes: '2021 filed baseline'
  },
  2020: {
    year: 2020,
    cadToUsd: 0.746406,
    inrToUsd: 0.0134794,
    inrToCad: 0.018059,
    mileageRate: 0.575,
    homeUsePercent: 15.0,
    notes: '2020 COVID relief & filed return rates'
  },
  2019: {
    year: 2019,
    cadToUsd: 0.753754,
    inrToUsd: 0.0141854,
    inrToCad: 0.018819,
    mileageRate: 0.580,
    homeUsePercent: 15.0,
    notes: '2019 filed return rates'
  },
  2018: {
    year: 2018,
    cadToUsd: 0.772179,
    inrToUsd: 0.0146419,
    inrToCad: 0.018961,
    mileageRate: 0.545,
    homeUsePercent: 15.0,
    notes: '2018 filed return rates'
  },
  2017: {
    year: 2017,
    cadToUsd: 0.770802,
    inrToUsd: 0.0153642,
    inrToCad: 0.019932,
    mileageRate: 0.535,
    homeUsePercent: 15.0,
    notes: '2017 filed return rates'
  }
};

const STORAGE_KEY = 'cloudbaud_tax_assumptions_matrix_v1';

export function loadTaxAssumptions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_TAX_ASSUMPTIONS, ...parsed };
    }
  } catch (err) {
    console.debug('Failed to load tax assumptions from localStorage:', err);
  }
  return { ...DEFAULT_TAX_ASSUMPTIONS };
}

export function saveTaxAssumptions(matrix) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
    // Broadcast cross-tab
    window.dispatchEvent(new CustomEvent('tax-assumptions-updated', { detail: matrix }));
  } catch (err) {
    console.error('Failed to save tax assumptions:', err);
  }
}

export function getAssumptionsForYear(year, matrix = null) {
  const data = matrix || loadTaxAssumptions();
  return data[year] || DEFAULT_TAX_ASSUMPTIONS[year] || DEFAULT_TAX_ASSUMPTIONS[2022];
}
