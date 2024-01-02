import Plot from "react-plotly.js";

type Props = {
  title: string;
  x: string[] | number[];
  y: string[] | number[];
};

const ScatterPlot = ({ x, y, title }: Props) => {
  const data = [
    {
      x,
      y,
      mode: "markers",
    },
  ];

  const layout = {
    width: 600,
    height: 400,
    title,
  };

  return <Plot data={data} layout={layout} />;
};

export default ScatterPlot;
