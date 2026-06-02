import type { PeriodKind } from "@/lib/api/ine";

export type IneTheme = "economia" | "empleo" | "demografia" | "vivienda";

export interface IneThemeMeta {
  key: IneTheme;
  label: string;
}

export const INE_THEMES: IneThemeMeta[] = [
  { key: "economia", label: "Economía" },
  { key: "empleo", label: "Empleo" },
  { key: "demografia", label: "Demografía" },
  { key: "vivienda", label: "Vivienda" },
];

export interface IneSeriesRef {
  cod: string;
  label: string;
  color: string;
}

export interface IneIndicator {
  id: string;
  theme: IneTheme;
  title: string;
  description: string;
  /** Suffix shown after the value (e.g. `%`). Empty for plain counts. */
  unit: string;
  decimals: number;
  period: PeriodKind;
  /** Number of most recent observations to request. */
  nult: number;
  kind: "area" | "line";
  series: IneSeriesRef[];
  /** Short note about the source table/operation. */
  source: string;
}

const GREEN = "#264d37";
const MUSTARD = "#e3b04b";
const TEAL = "#2f7d8f";
const RUST = "#c0524b";

/**
 * Curated headline indicators. All series codes were validated against the
 * INE Tempus3 API (DATOS_SERIE).
 */
export const INE_INDICATORS: IneIndicator[] = [
  {
    id: "ipc",
    theme: "economia",
    title: "Inflación (IPC)",
    description: "Variación anual del Índice de Precios de Consumo, índice general nacional.",
    unit: "%",
    decimals: 1,
    period: "month",
    nult: 72,
    kind: "area",
    series: [{ cod: "IPC290750", label: "Variación anual", color: GREEN }],
    source: "INE · IPC (índice general nacional)",
  },
  {
    id: "pib",
    theme: "economia",
    title: "PIB (variación anual)",
    description:
      "Producto interior bruto a precios de mercado, índice de volumen encadenado, variación interanual.",
    unit: "%",
    decimals: 1,
    period: "quarter",
    nult: 48,
    kind: "area",
    series: [{ cod: "CNTR6723", label: "PIB", color: GREEN }],
    source: "INE · Contabilidad Nacional Trimestral",
  },
  {
    id: "paro",
    theme: "empleo",
    title: "Tasa de paro",
    description: "Porcentaje de población activa en situación de paro (EPA), por grupo de edad.",
    unit: "%",
    decimals: 2,
    period: "quarter",
    nult: 48,
    kind: "line",
    series: [
      { cod: "EPA452434", label: "Total", color: GREEN },
      { cod: "EPA452436", label: "Menores de 25", color: RUST },
      { cod: "EPA452438", label: "De 25 a 54", color: TEAL },
      { cod: "EPA452439", label: "55 y más", color: MUSTARD },
    ],
    source: "INE · Encuesta de Población Activa (EPA)",
  },
  {
    id: "poblacion",
    theme: "demografia",
    title: "Población residente",
    description: "Población residente en España (Estadística Continua de Población).",
    unit: "personas",
    decimals: 0,
    period: "quarter",
    nult: 28,
    kind: "area",
    series: [{ cod: "ECP320", label: "Total", color: GREEN }],
    source: "INE · Estadística Continua de Población",
  },
  {
    id: "poblacion-sexo",
    theme: "demografia",
    title: "Población por sexo",
    description: "Evolución de la población residente desagregada por sexo.",
    unit: "personas",
    decimals: 0,
    period: "quarter",
    nult: 28,
    kind: "line",
    series: [
      { cod: "ECP319", label: "Hombres", color: TEAL },
      { cod: "ECP318", label: "Mujeres", color: MUSTARD },
    ],
    source: "INE · Estadística Continua de Población",
  },
  {
    id: "ipv",
    theme: "vivienda",
    title: "Precio de la vivienda (IPV)",
    description: "Índice de Precios de Vivienda, índice general nacional, variación anual.",
    unit: "%",
    decimals: 1,
    period: "quarter",
    nult: 48,
    kind: "area",
    series: [{ cod: "IPV948", label: "Variación anual", color: GREEN }],
    source: "INE · Índice de Precios de Vivienda",
  },
];

export const indicatorsByTheme = (theme: IneTheme) =>
  INE_INDICATORS.filter((i) => i.theme === theme);
