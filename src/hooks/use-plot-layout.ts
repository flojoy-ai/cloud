import { useTheme } from "next-themes";
import { type Layout } from "plotly.js";

const darkModeLayout: Partial<Layout> = {
  xaxis: {
    gridcolor: "rgba(200,200,200,0.1)",
  },
  yaxis: {
    gridcolor: "rgba(200,200,200,0.1)",
  },
  paper_bgcolor: "#09090b",
  plot_bgcolor: "#09090b",
  font: {
    color: "#f1f1f1",
  },
};

export const usePlotLayout = (): Partial<Layout> => {
  const { resolvedTheme } = useTheme();

  return {
    showlegend: false,
    hoverlabel: {
      namelength: -1,
    },
    ...(resolvedTheme === "dark" ? darkModeLayout : {}),
  };
};
