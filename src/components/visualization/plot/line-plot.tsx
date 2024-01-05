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
import { usePlotLayout } from "~/hooks/use-plot-layout";

type Line = {
  x: number[] | string[];
  y: number[];
  name: string;
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
    line: { color: "black", width: 2 },
  };
};

const hline = (y: number): Partial<Shape> => {
  return {
    type: "line",
    xref: "paper",
    x0: 0,
    x1: 1,
    y0: y,
    y1: y,
    line: { color: "black", width: 2 },
  };
};

type Props = {
  title: string;
  lines: Line[];
  config: z.infer<typeof explorerConfig.dataframe>;
  onTraceClick: (event: Readonly<PlotMouseEvent>) => void;
};

const LinePlot = ({ lines, title, config, onTraceClick }: Props) => {
  const [highlightedTraceIndex, setHighlightedTraceIndex] = useState<
    number | null
  >(null);
  const layoutBase = usePlotLayout();

  const computeTraces = useCallback((): ComputedTraces => {
    const yTransform = config.yTransform
      ? math.parse(config.yTransform).compile()
      : undefined;

    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;

    const traces: Partial<PlotData>[] = [];

    lines.forEach((line, i) => {
      const min = line.x[0];
      if (min !== undefined) {
        minX = Math.min(min, minX);
      }
      const max = line.x[line.x.length - 1];
      if (max !== undefined) {
        maxX = Math.max(max, maxX);
      }

      traces.push({
        type: "scatter",
        mode: config.mode,
        x: line.x,
        y: yTransform
          ? line.y.map((y) => yTransform.evaluate({ y }) as number)
          : line.y,
        error_y:
          config.errorBars && config.errorPercentage
            ? { type: "percent", value: config.errorPercentage, thickness: 0.5 }
            : undefined,
        name: line.name,
        line:
          i === highlightedTraceIndex
            ? { color: "#7B61FF", width: 2 }
            : { color: "rgba(160,160,160,0.75)", width: 0.5 },
      });
    });

    return {
      minX,
      maxX,
      traces,
    };
  }, [
    lines,
    highlightedTraceIndex,
    config.errorPercentage,
    config.errorBars,
    config.yTransform,
    config.mode,
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
    () => traceOfX(config.upperControlLimitTransform, minX, maxX, "UCL"),
    [config.upperControlLimitTransform, minX, maxX],
  );

  const lclTrace = useMemo(
    () => traceOfX(config.lowerControlLimitTransform, minX, maxX, "LCL"),
    [config.lowerControlLimitTransform, minX, maxX],
  );

  const extraTraces: Partial<PlotData>[] = [];

  if (uclTrace) {
    extraTraces.push(uclTrace);
  }
  if (lclTrace) {
    extraTraces.push(lclTrace);
  }

  const handleHover = useCallback((event: Readonly<PlotHoverEvent>) => {
    setHighlightedTraceIndex(event.points[0]?.curveNumber ?? null);
  }, []);

  const handleUnhover = useCallback(() => {
    setHighlightedTraceIndex(null);
  }, []);

  const layout: Partial<Layout> = useMemo(() => {
    const shapes: Partial<Shape>[] = [];
    if (config.lowerControlLimit !== undefined) {
      shapes.push(hline(config.lowerControlLimit));
    }
    if (config.upperControlLimit !== undefined) {
      shapes.push(hline(config.upperControlLimit));
    }

    return _.merge(layoutBase, {
      title,
      xaxis: {
        title: config.xColumn,
      },
      yaxis: {
        title: config.yColumn,
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
      className="h-[640px] w-full"
      frames={[]}
      config={{ responsive: true }}
      layout={layout}
      onHover={handleHover}
      onUnhover={handleUnhover}
      onClick={onTraceClick}
    />
  );
};

export default LinePlot;
