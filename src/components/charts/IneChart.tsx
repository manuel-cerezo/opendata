import { useMemo } from "react";
import EChart from "./EChart";
import { chartTheme, timeSeriesOption, type TimeSeries } from "./options";
import { useTheme } from "@/lib/useTheme";
import { formatPeriod, type IneSerie } from "@/lib/api/ine";
import type { IneIndicator } from "@/constants/ineIndicators";

/**
 * Aligns the indicator's series onto a shared time axis (using the longest
 * series for the category labels) and renders them as a time-series chart.
 */
export default function IneChart({
  indicator,
  data,
}: {
  indicator: IneIndicator;
  data: IneSerie[];
}) {
  const { theme } = useTheme();

  const option = useMemo(() => {
    const t = chartTheme(theme === "dark");
    const longest = data.reduce(
      (best, s) => (s.points.length > best.points.length ? s : best),
      data[0] ?? { points: [] as IneSerie["points"] },
    );
    const categories = longest.points.map((p) => formatPeriod(p.date, indicator.period));

    const series: TimeSeries[] = data.map((serie, i) => {
      const byLabel = new Map(
        serie.points.map((p) => [formatPeriod(p.date, indicator.period), p.value]),
      );
      return {
        name: indicator.series[i]?.label ?? serie.name,
        color: indicator.series[i]?.color ?? t.accent,
        values: categories.map((c) => byLabel.get(c) ?? null),
      };
    });

    return timeSeriesOption(categories, series, t, {
      unit: indicator.unit === "personas" ? "" : indicator.unit,
      decimals: indicator.decimals,
      area: indicator.kind === "area",
    });
  }, [data, indicator, theme]);

  return <EChart option={option} height={320} ariaLabel={indicator.title} />;
}
