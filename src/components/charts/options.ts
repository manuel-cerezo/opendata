import type { EChartsCoreOption } from "echarts/core";
import type { Count } from "@/lib/api/aggregations";

export interface ChartTheme {
  text: string;
  axis: string;
  split: string;
  tooltipBg: string;
  tooltipBorder: string;
  accent: string;
  accentSoft: string;
}

export function chartTheme(dark: boolean): ChartTheme {
  return dark
    ? {
        text: "#d7dae0",
        axis: "#3a3a3a",
        split: "#262626",
        tooltipBg: "#1e1e1e",
        tooltipBorder: "#2c2c2c",
        accent: "#6bbf8e",
        accentSoft: "#e3b04b",
      }
    : {
        text: "#4a5565",
        axis: "#d7d7d7",
        split: "#eeeeee",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e4e4e4",
        accent: "#264d37",
        accentSoft: "#e3b04b",
      };
}

const FONT = '"Instrument Sans", system-ui, sans-serif';

function baseTooltip(t: ChartTheme) {
  return {
    backgroundColor: t.tooltipBg,
    borderColor: t.tooltipBorder,
    borderWidth: 1,
    textStyle: { color: t.text, fontFamily: FONT },
    extraCssText: "box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-radius: 8px;",
  };
}

/** Horizontal bar chart (categories sorted descending, highest on top). */
export function horizontalBarOption(
  data: Count[],
  t: ChartTheme,
  color = t.accent,
  unit = "conjuntos",
): EChartsCoreOption {
  const ordered = [...data].reverse();
  return {
    grid: { left: 8, right: 24, top: 12, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...baseTooltip(t),
      // Show the full (untruncated) category name plus a formatted count.
      formatter: (params: unknown) => {
        const item = Array.isArray(params) ? params[0] : params;
        const p = item as { name?: string; value?: number; color?: string };
        const swatch = `<span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${p.color};margin-right:6px"></span>`;
        const value = new Intl.NumberFormat("es-ES").format(p.value ?? 0);
        return `<strong>${p.name ?? ""}</strong><br/>${swatch}${value} ${unit}`;
      },
    },
    xAxis: {
      type: "value",
      axisLabel: { color: t.text, fontFamily: FONT },
      splitLine: { lineStyle: { color: t.split } },
    },
    yAxis: {
      type: "category",
      data: ordered.map((d) => d.label),
      axisLabel: { color: t.text, fontFamily: FONT, width: 150, overflow: "truncate" },
      axisLine: { lineStyle: { color: t.axis } },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        data: ordered.map((d) => d.value),
        itemStyle: { color, borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 22,
      },
    ],
  };
}

/** Vertical bar chart (e.g. formats). */
export function verticalBarOption(
  data: Count[],
  t: ChartTheme,
  color = t.accentSoft,
): EChartsCoreOption {
  return {
    grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...baseTooltip(t) },
    xAxis: {
      type: "category",
      data: data.map((d) => d.label),
      axisLabel: { color: t.text, fontFamily: FONT, rotate: data.length > 6 ? 35 : 0 },
      axisLine: { lineStyle: { color: t.axis } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: t.text, fontFamily: FONT },
      splitLine: { lineStyle: { color: t.split } },
    },
    series: [
      {
        type: "bar",
        data: data.map((d) => d.value),
        itemStyle: { color, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 36,
      },
    ],
  };
}

/**
 * Donut chart with a per-slice colour list. Slices below `minPercent` of the
 * total are merged into a single "Otros" slice, and the legend shows each
 * slice's percentage. Clicking a legend entry toggles its slice.
 */
export function donutOption(
  data: Count[],
  colors: string[],
  t: ChartTheme,
  minPercent = 1,
): EChartsCoreOption {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  const major: { name: string; value: number; color: string }[] = [];
  let otrosValue = 0;
  data.forEach((d, i) => {
    if ((d.value / total) * 100 < minPercent) {
      otrosValue += d.value;
    } else {
      major.push({ name: d.label, value: d.value, color: colors[i % colors.length] });
    }
  });
  if (otrosValue > 0) {
    major.push({ name: "Otros", value: otrosValue, color: t.text === "#d7dae0" ? "#5b6470" : "#b8bcc4" });
  }

  const pct = (value: number) => ((value / total) * 100).toFixed(value / total < 0.01 ? 2 : 1);
  const pctByName = new Map(major.map((m) => [m.name, pct(m.value)]));

  return {
    tooltip: { trigger: "item", ...baseTooltip(t), formatter: "{b}: {c} ({d}%)" },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 0,
      top: "center",
      textStyle: { color: t.text, fontFamily: FONT },
      pageTextStyle: { color: t.text },
      formatter: (name: string) => `${name}  ·  ${pctByName.get(name) ?? "0"}%`,
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        center: ["32%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: t.tooltipBg, borderWidth: 2 },
        label: { show: false },
        data: major.map((m) => ({
          name: m.name,
          value: m.value,
          itemStyle: { color: m.color },
        })),
      },
    ],
  };
}

export interface TimeSeries {
  name: string;
  color: string;
  /** Values aligned to the shared `categories` (null = gap). */
  values: (number | null)[];
}

/**
 * Multi-series time-series chart (line, or filled area when there is a single
 * series). Includes a slider zoom when there are many points.
 */
export function timeSeriesOption(
  categories: string[],
  series: TimeSeries[],
  t: ChartTheme,
  opts: { unit?: string; decimals?: number; area?: boolean } = {},
): EChartsCoreOption {
  const { unit = "", decimals = 1, area = false } = opts;
  const nf = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const showZoom = categories.length > 16;

  return {
    grid: { left: 8, right: 16, top: series.length > 1 ? 40 : 16, bottom: showZoom ? 48 : 8, containLabel: true },
    legend:
      series.length > 1
        ? { top: 0, textStyle: { color: t.text, fontFamily: FONT }, data: series.map((s) => s.name) }
        : undefined,
    tooltip: {
      trigger: "axis",
      ...baseTooltip(t),
      valueFormatter: (value: unknown) =>
        typeof value === "number" ? `${nf.format(value)}${unit ? ` ${unit}` : ""}` : "—",
    },
    dataZoom: showZoom
      ? [
          { type: "inside", start: 60, end: 100 },
          {
            type: "slider",
            start: 60,
            end: 100,
            height: 18,
            bottom: 8,
            borderColor: t.split,
            fillerColor: "rgba(38,77,55,0.10)",
            handleStyle: { color: t.accent },
            textStyle: { color: t.text, fontFamily: FONT },
          },
        ]
      : undefined,
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: categories,
      axisLabel: { color: t.text, fontFamily: FONT },
      axisLine: { lineStyle: { color: t.axis } },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLabel: {
        color: t.text,
        fontFamily: FONT,
        formatter: (v: number) => nf.format(v),
      },
      splitLine: { lineStyle: { color: t.split } },
    },
    series: series.map((s) => ({
      name: s.name,
      type: "line",
      smooth: true,
      showSymbol: false,
      connectNulls: true,
      data: s.values,
      lineStyle: { color: s.color, width: 2.5 },
      itemStyle: { color: s.color },
      ...(area && series.length === 1
        ? { areaStyle: { color: s.color, opacity: 0.12 } }
        : {}),
    })),
  };
}

/** Area line chart for time series (e.g. datasets per year). */
export function areaLineOption(
  data: Count[],
  t: ChartTheme,
  color = t.accent,
): EChartsCoreOption {
  return {
    grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis", ...baseTooltip(t) },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map((d) => d.label),
      axisLabel: { color: t.text, fontFamily: FONT },
      axisLine: { lineStyle: { color: t.axis } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: t.text, fontFamily: FONT },
      splitLine: { lineStyle: { color: t.split } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbolSize: 6,
        data: data.map((d) => d.value),
        lineStyle: { color, width: 2.5 },
        itemStyle: { color },
        areaStyle: { color, opacity: 0.12 },
      },
    ],
  };
}
