import _ from "lodash";
import { type PlotMouseEvent } from "plotly.js";
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
  const data = [
    {
      x,
      y,
      mode: "markers",
      marker: { color: "#7B61FF", width: 10 },
    },
  ];

  const layout = _.merge(layoutBase, {
    title,
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
