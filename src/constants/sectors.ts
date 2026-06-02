/**
 * NTI primary sectors (taxonomía de sectores) used by datos.gob.es to
 * classify datasets. The key matches the final segment of the theme URI
 * `http://datos.gob.es/kos/sector-publico/sector/{key}`.
 */
export interface Sector {
  key: string;
  label: string;
  /** Stable accent colour used across charts for this sector. */
  color: string;
}

export const SECTORS: Sector[] = [
  { key: "ciencia-tecnologia", label: "Ciencia y tecnología", color: "#264d37" },
  { key: "comercio", label: "Comercio", color: "#3a6b4f" },
  { key: "cultura-ocio", label: "Cultura y ocio", color: "#e3b04b" },
  { key: "demografia", label: "Demografía", color: "#c98a2b" },
  { key: "deporte", label: "Deporte", color: "#4a8c68" },
  { key: "economia", label: "Economía", color: "#1f6f54" },
  { key: "educacion", label: "Educación", color: "#7a9e3b" },
  { key: "empleo", label: "Empleo", color: "#b5852f" },
  { key: "energia", label: "Energía", color: "#d99b3a" },
  { key: "hacienda", label: "Hacienda", color: "#2d5a44" },
  { key: "industria", label: "Industria", color: "#5e7d8a" },
  { key: "legislacion-justicia", label: "Legislación y justicia", color: "#6b5b95" },
  { key: "medio-ambiente", label: "Medio ambiente", color: "#3f8f5e" },
  { key: "medio-rural-pesca", label: "Medio rural y pesca", color: "#88a04b" },
  { key: "salud", label: "Salud", color: "#c0524b" },
  { key: "sector-publico", label: "Sector público", color: "#4a5565" },
  { key: "seguridad", label: "Seguridad", color: "#8a6d3b" },
  { key: "sociedad-bienestar", label: "Sociedad y bienestar", color: "#d98c5f" },
  { key: "transporte", label: "Transporte", color: "#2f7d8f" },
  { key: "turismo", label: "Turismo", color: "#e0a13c" },
  { key: "urbanismo-infraestructuras", label: "Urbanismo e infraestructuras", color: "#7d6b54" },
  { key: "vivienda", label: "Vivienda", color: "#9c6b4a" },
];

const SECTOR_MAP = new Map(SECTORS.map((s) => [s.key, s]));

export function sectorLabel(key: string): string {
  return SECTOR_MAP.get(key)?.label ?? key;
}

export function sectorColor(key: string): string {
  return SECTOR_MAP.get(key)?.color ?? "#4a5565";
}
