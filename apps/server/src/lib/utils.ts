import { Result, err, ok } from "neverthrow";

export function countWhere<T>(arr: T[], predicate: (t: T) => boolean): number {
  return arr.reduce((acc, t) => (predicate(t) ? acc + 1 : acc), 0);
}

export function errIfUndefined<T, E>(
  e: E,
): (val: T | undefined) => Result<T, E> {
  return (val: T | undefined) => (val === undefined ? err(e) : ok(val));
}
