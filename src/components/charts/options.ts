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

/** Donut chart with an explicit per-slice colour list. */
export function donutOption(
  data: Count[],
  colors: string[],
  t: ChartTheme,
): EChartsCoreOption {
  return {
    tooltip: { trigger: "item", ...baseTooltip(t), formatter: "{b}: {c} ({d}%)" },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 0,
      top: "center",
      textStyle: { color: t.text, fontFamily: FONT },
      pageTextStyle: { color: t.text },
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        center: ["32%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: t.tooltipBg, borderWidth: 2 },
        label: { show: false },
        data: data.map((d, i) => ({
          name: d.label,
          value: d.value,
          itemStyle: { color: colors[i % colors.length] },
        })),
      },
    ],
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
