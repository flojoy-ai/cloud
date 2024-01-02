import Plot from "react-plotly.js";

type Line = {
  x: string[] | number[];
  y: string[] | number[];
  name: string;
};

type Props = {
  title: string;
  lines: Line[];
};

const LinePlot = ({ lines, title }: Props) => {
  const data = lines.map((line) => ({
    x: line.x,
    y: line.y,
    name: line.name,
  }));

  const layout = {
    width: 600,
    height: 400,
    title,
  };

  return <Plot data={data} layout={layout} />;
};

export default LinePlot;
