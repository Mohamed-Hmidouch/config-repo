import React from 'react';
import { humanizeKey, formatMoney } from '../../utils/formatters';
import { isMonetary, isLongText, isNestedObject, isArray } from '../../utils/typeGuards';

interface DynamicFieldProps {
  label: string;
  value: unknown;
  currency?: string | null;
  depth?: number;
}

/**
 * Atomic rendering unit: detects the type of value and chooses
 * the appropriate visual renderer.
 */
export const DynamicField: React.FC<DynamicFieldProps> = ({
  label,
  value,
  currency,
  depth = 0,
}) => {
  const humanLabel = humanizeKey(label);

  // ── Null / undefined ──
  if (value === null || value === undefined) return null;

  // ── Nested object → recursive rendering ──
  if (isNestedObject(value)) {
    return (
      <div className="dynamic-field dynamic-field--nested" style={{ '--depth': depth } as React.CSSProperties}>
        <span className="dynamic-field__label dynamic-field__label--group">
          {humanLabel}
        </span>
        <div className="dynamic-field__nested">
          {Object.entries(value).map(([k, v]) => (
            <DynamicField
              key={k}
              label={k}
              value={v}
              currency={currency}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Array → list of items ──
  if (isArray(value)) {
    return (
      <div className="dynamic-field dynamic-field--array">
        <span className="dynamic-field__label">{humanLabel}</span>
        <div className="dynamic-field__array">
          {value.map((item, i) => (
            <DynamicField
              key={i}
              label={`${label}[${i}]`}
              value={item}
              currency={currency}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Monetary number ──
  if (isMonetary(value)) {
    return (
      <div className="dynamic-field dynamic-field--monetary">
        <span className="dynamic-field__label">{humanLabel}</span>
        <span className="dynamic-field__value dynamic-field__value--money">
          {formatMoney(value, currency)}
        </span>
      </div>
    );
  }

  // ── Long text (clauses, conditions) ──
  if (isLongText(value)) {
    return (
      <div className="dynamic-field dynamic-field--paragraph">
        <span className="dynamic-field__label">{humanLabel}</span>
        <p className="dynamic-field__text">{value}</p>
      </div>
    );
  }

  // ── Default: string or short value ──
  return (
    <div className="dynamic-field">
      <span className="dynamic-field__label">{humanLabel}</span>
      <span className="dynamic-field__value">{String(value)}</span>
    </div>
  );
};
