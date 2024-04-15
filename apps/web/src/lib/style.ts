export const getCssVariable = (name: string) => {
  const style = getComputedStyle(document.body);
  return style.getPropertyValue(name);
};

export const getChartColors = () => {
  const accent = getCssVariable("--chart-accent");
  const accentLight = getCssVariable("--chart-accent-light");

  const accent2 = getCssVariable("--chart-accent2");
  return { accent, accentLight, accent2 };
};
