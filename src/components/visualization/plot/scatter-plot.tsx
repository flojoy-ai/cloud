import _ from "lodash";
import Plot from "react-plotly.js";
import { usePlotLayout } from "~/hooks/use-plot-layout";

type Props = {
  title: string;
  x: string[] | number[];
  y: string[] | number[];
};

const ScatterPlot = ({ x, y, title }: Props) => {
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

  return <Plot data={data} layout={layout} />;
};

export default ScatterPlot;
