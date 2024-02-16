export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function Ok<T, E>(value: T): Result<T, E> {
  return { ok: true, value };
}
export function Err<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}

export function tryCatch<T, E>(
  f: () => T,
  onThrow: (e: unknown) => E,
): Result<T, E> {
  try {
    return Ok(f());
  } catch (e) {
    return Err(onThrow(e));
  }
}
