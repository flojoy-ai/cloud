import _ from "lodash";
import { Data, Layout, type PlotMouseEvent } from "plotly.js";
import Plot from "react-plotly.js";
import { usePlotLayout } from "~/hooks/use-plot-layout";

type Props = {
  title: string;
  x: string[] | number[];
  y: string[] | number[];
  onTraceClick: (event: Readonly<PlotMouseEvent>) => void;
};

const ScatterPlot = ({ x, y, title, onTraceClick }: Props) => {
  const layoutBase = usePlotLayout();
  const data: Data[] = [
    {
      x,
      y,
      type: "bar",
      marker: { color: "#7B61FF" },
    },
  ];

  const layout: Partial<Layout> = _.merge(layoutBase, {
    title,
    showlegend: false,
  });

  return (
    <Plot
      data={data}
      layout={layout}
      className="h-[512px] w-full"
      config={{ responsive: true }}
      onClick={onTraceClick}
    />
  );
};

export default ScatterPlot;
