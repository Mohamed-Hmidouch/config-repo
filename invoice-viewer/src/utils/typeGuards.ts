/** Detects if a value is a monetary amount */
export const isMonetary = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

/** Detects if a value is long text (clauses, conditions) */
export const isLongText = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 120;

/** Detects if a value is a nested object */
export const isNestedObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Detects if a value is an array */
export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);
