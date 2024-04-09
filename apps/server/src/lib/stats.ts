export const median = (arr: number[]) => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

export const mode = (arr: number[]) => {
  const freq = arr.reduce(
    (acc, val) => acc.set(val, 1 + (acc.get(val) ?? 0)),
    new Map<number, number>(),
  );
  const max = Math.max(...freq.values());
  return [...freq.keys()].filter((key) => freq.get(key) === max);
};
