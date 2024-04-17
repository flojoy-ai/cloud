export const removePrefix = (value: string, prefix: string) =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;

export const pluralize = (s: string, count: number) =>
  count === 1 ? s : `${s}s`;
