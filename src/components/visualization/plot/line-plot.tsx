import Plot from "react-plotly.js";
import {
  type PlotMouseEvent,
  type Layout,
  type PlotData,
  type PlotHoverEvent,
  type Shape,
} from "plotly.js";
import { type z } from "zod";
import { type explorerConfig } from "~/types/data";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as math from "mathjs";
import _ from "lodash";
import { plasmaColorscale, usePlotLayout } from "~/hooks/use-plot-layout";
import { useTheme } from "next-themes";

type Line = {
  x: number[] | string[];
  y: number[];
  name: string;
  group: string;
  mode: "lines" | "markers";
};

type ComputedTraces = {
  minX: number;
  maxX: number;
  traces: Partial<PlotData>[];
};

const CONTROL_LIMIT_RESOLUTION = 1000;

const traceOfX = (
  expr: string | undefined,
  minX: number,
  maxX: number,
  name: string,
  theme: string | undefined,
): Partial<PlotData> | undefined => {
  if (!expr) {
    return undefined;
  }
  const transform = math.parse(expr).compile();
  const x = Array.from(
    { length: CONTROL_LIMIT_RESOLUTION },
    (_, i) => minX + ((maxX - minX) * i) / (CONTROL_LIMIT_RESOLUTION - 1),
  );
  const y = x.map((x) => transform.evaluate({ x }) as number);

  return {
    type: "scatter",
    mode: "lines",
    x,
    y,
    name,
    line: { color: theme === "light" ? "black" : "white", width: 2 },
  };
};

const hline = (y: number, theme: string | undefined): Partial<Shape> => {
  return {
    type: "line",
    xref: "paper",
    x0: 0,
    x1: 1,
    y0: y,
    y1: y,
    line: { color: theme === "light" ? "black" : "white", width: 2 },
  };
};

type Props = {
  title: string;
  lineGroups: Line[][];
  config: z.infer<typeof explorerConfig.dataframe>;
  onTraceClick: (event: Readonly<PlotMouseEvent>) => void;
};

const LinePlot = ({ lineGroups, title, config, onTraceClick }: Props) => {
  const [highlightedTraceName, setHighlightedTraceName] = useState<
    string | null
  >(null);
  const layoutBase = usePlotLayout();
  const { resolvedTheme } = useTheme();

  const computeTraces = useCallback((): ComputedTraces => {
    const yTransform = config.yTransform
      ? math.parse(config.yTransform).compile()
      : undefined;

    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;

    const traces: Partial<PlotData>[] = [];

    for (const lines of lineGroups) {
      lines.forEach((line, index) => {
        const isNumeric = typeof line.x[0] === "number";
        if (isNumeric) {
          const min = Math.min(...(line.x as number[]));
          minX = Math.min(min, minX);
          const max = Math.max(...(line.x as number[]));
          maxX = Math.max(max, maxX);
        }

        traces.push({
          type: "scatter",
          mode: line.mode,
          x: line.x,
          y: yTransform
            ? line.y.map((y) => yTransform.evaluate({ y }) as number)
            : line.y,
          error_y:
            config.errorBars && config.errorPercentage
              ? {
                  type: "percent",
                  value: config.errorPercentage,
                  thickness: 0.5,
                }
              : undefined,
          name: line.group,
          hovertext: line.name,
          line:
            line.name === highlightedTraceName
              ? {
                  color: plasmaColorscale[index % plasmaColorscale.length],
                  width: 2,
                }
              : { color: "rgba(160,160,160,0.75)", width: 1 },
          legendgroup: line.group,
        });
      });
    }

    return {
      minX,
      maxX,
      traces,
    };
  }, [
    lineGroups,
    highlightedTraceName,
    config.errorPercentage,
    config.errorBars,
    config.yTransform,
  ]);

  const [minX, setMinX] = useState<number>(0);
  const [maxX, setMaxX] = useState<number>(10);
  const [traces, setTraces] = useState<Partial<PlotData>[]>([]);

  useEffect(() => {
    const computed = computeTraces();
    setMinX(computed.minX);
    setMaxX(computed.maxX);
    setTraces(computed.traces);
  }, [computeTraces]);

  const uclTrace = useMemo(
    () =>
      traceOfX(
        config.upperControlLimitTransform,
        minX,
        maxX,
        "UCL",
        resolvedTheme,
      ),
    [config.upperControlLimitTransform, minX, maxX, resolvedTheme],
  );

  const lclTrace = useMemo(
    () =>
      traceOfX(
        config.lowerControlLimitTransform,
        minX,
        maxX,
        "LCL",
        resolvedTheme,
      ),
    [config.lowerControlLimitTransform, minX, maxX, resolvedTheme],
  );

  const extraTraces: Partial<PlotData>[] = [];

  if (uclTrace) {
    extraTraces.push(uclTrace);
  }
  if (lclTrace) {
    extraTraces.push(lclTrace);
  }

  const handleHover = useCallback((event: Readonly<PlotHoverEvent>) => {
    setHighlightedTraceName(
      (event.points[0]?.data.hovertext as string) ?? null,
    );
  }, []);

  const handleUnhover = useCallback(() => {
    setHighlightedTraceName(null);
  }, []);

  const layout: Partial<Layout> = useMemo(() => {
    const shapes: Partial<Shape>[] = [];
    if (config.lowerControlLimit !== undefined) {
      shapes.push(hline(config.lowerControlLimit, resolvedTheme));
    }
    if (config.upperControlLimit !== undefined) {
      shapes.push(hline(config.upperControlLimit, resolvedTheme));
    }

    return _.merge(layoutBase, {
      title,
      xaxis: {
        title: config.xAxisColumn,
      },
      yaxis: {
        title:
          config.traces.length === 1
            ? config.traces[0]?.yAxisColumn
            : undefined,
        type: config.logScaleYAxis ? "log" : "linear",
      },
      shapes,
    });
  }, [
    config.logScaleYAxis,
    config.lowerControlLimit,
    config.upperControlLimit,
    title,
    layoutBase,
  ]);

  return (
    <Plot
      data={[...traces, ...extraTraces]}
      className="h-[512px] w-full"
      config={{ responsive: true }}
      layout={layout}
      onHover={handleHover}
      onUnhover={handleUnhover}
      onClick={onTraceClick}
    />
  );
};

export default LinePlot;
