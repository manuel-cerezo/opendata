import { useMemo } from "react";
import EChart from "./EChart";
import {
  chartTheme,
  donutOption,
  horizontalBarOption,
  verticalBarOption,
  areaLineOption,
} from "./options";
import { useTheme } from "@/lib/useTheme";
import { sectorColor } from "@/constants/sectors";
import type { Count } from "@/lib/api/aggregations";

export function SectorDonut({ data }: { data: Count[] }) {
  const { theme } = useTheme();
  const option = useMemo(() => {
    const t = chartTheme(theme === "dark");
    const colors = data.map((d) => sectorColor(d.key));
    return donutOption(data, colors, t);
  }, [data, theme]);
  return <EChart option={option} ariaLabel="Distribución de conjuntos de datos por sector" />;
}

export function FormatBars({ data }: { data: Count[] }) {
  const { theme } = useTheme();
  const option = useMemo(
    () => verticalBarOption(data, chartTheme(theme === "dark")),
    [data, theme],
  );
  return <EChart option={option} ariaLabel="Conjuntos de datos por formato de distribución" />;
}

export function PublisherBars({ data }: { data: Count[] }) {
  const { theme } = useTheme();
  const option = useMemo(() => {
    const t = chartTheme(theme === "dark");
    return horizontalBarOption(data, t, t.accent);
  }, [data, theme]);
  return (
    <EChart
      option={option}
      height={420}
      ariaLabel="Organismos publicadores con más conjuntos de datos"
    />
  );
}

export function YearLine({ data }: { data: Count[] }) {
  const { theme } = useTheme();
  const option = useMemo(
    () => areaLineOption(data, chartTheme(theme === "dark")),
    [data, theme],
  );
  return <EChart option={option} ariaLabel="Conjuntos de datos publicados por año" />;
}
