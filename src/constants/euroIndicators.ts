export interface EuroGeo {
  code: string;
  label: string;
  color: string;
}

/** España vs. UE-27 across every Eurostat indicator. */
export const EURO_GEOS: EuroGeo[] = [
  { code: "ES", label: "España", color: "#264d37" },
  { code: "EU27_2020", label: "UE-27", color: "#e3b04b" },
];

export interface EuroIndicator {
  id: string;
  title: string;
  description: string;
  unit: string;
  decimals: number;
  dataset: string;
  /** Eurostat query params fixing every dimension except geo and time. */
  params: Record<string, string>;
  lastN: number;
  source: string;
}

/** Headline España-vs-UE indicators, all validated against the Eurostat API. */
export const EURO_INDICATORS: EuroIndicator[] = [
  {
    id: "paro",
    title: "Tasa de paro",
    description: "Tasa de desempleo mensual, ajustada estacionalmente, sobre población activa.",
    unit: "%",
    decimals: 1,
    dataset: "une_rt_m",
    params: { sex: "T", age: "TOTAL", unit: "PC_ACT", s_adj: "SA" },
    lastN: 60,
    source: "Eurostat · une_rt_m",
  },
  {
    id: "paro-juvenil",
    title: "Paro juvenil (<25)",
    description: "Tasa de desempleo de menores de 25 años, ajustada estacionalmente.",
    unit: "%",
    decimals: 1,
    dataset: "une_rt_m",
    params: { sex: "T", age: "Y_LT25", unit: "PC_ACT", s_adj: "SA" },
    lastN: 60,
    source: "Eurostat · une_rt_m",
  },
  {
    id: "inflacion",
    title: "Inflación (IPCA)",
    description: "Variación anual del Índice de Precios de Consumo Armonizado (IPCA / HICP).",
    unit: "%",
    decimals: 1,
    dataset: "prc_hicp_manr",
    params: { coicop: "CP00", unit: "RCH_A" },
    lastN: 60,
    source: "Eurostat · prc_hicp_manr",
  },
  {
    id: "pib",
    title: "PIB (variación anual)",
    description: "Crecimiento interanual del PIB en volumen, datos trimestrales ajustados.",
    unit: "%",
    decimals: 1,
    dataset: "namq_10_gdp",
    params: { na_item: "B1GQ", unit: "CLV_PCH_SM", s_adj: "SCA" },
    lastN: 40,
    source: "Eurostat · namq_10_gdp",
  },
];
