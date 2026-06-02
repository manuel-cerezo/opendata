import { useMemo } from "react";
import EChart from "./EChart";
import { chartTheme, timeSeriesOption, type TimeSeries } from "./options";
import { useTheme } from "@/lib/useTheme";
import { formatEuroPeriod, type EuroSeries } from "@/lib/api/eurostat";
import { EURO_GEOS, type EuroIndicator } from "@/constants/euroIndicators";

/** Renders an España-vs-UE indicator as two aligned time series. */
export default function EuroChart({
  indicator,
  data,
}: {
  indicator: EuroIndicator;
  data: EuroSeries[];
}) {
  const { theme } = useTheme();

  const option = useMemo(() => {
    const t = chartTheme(theme === "dark");
    const longest = data.reduce(
      (best, s) => (s.labels.length > best.labels.length ? s : best),
      data[0] ?? { labels: [], values: [] },
    );
    const categories = longest.labels.map(formatEuroPeriod);

    const series: TimeSeries[] = data.map((serie, i) => {
      const byLabel = new Map(
        serie.labels.map((code, idx) => [formatEuroPeriod(code), serie.values[idx]]),
      );
      return {
        name: EURO_GEOS[i]?.label ?? `Serie ${i + 1}`,
        color: EURO_GEOS[i]?.color ?? t.accent,
        values: categories.map((c) => byLabel.get(c) ?? null),
      };
    });

    return timeSeriesOption(categories, series, t, {
      unit: indicator.unit,
      decimals: indicator.decimals,
      area: false,
    });
  }, [data, indicator, theme]);

  return <EChart option={option} height={320} ariaLabel={indicator.title} />;
}
