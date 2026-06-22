// See DESIGN_RULES.md before editing this file.
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
      <div className={depth > 0 ? 'pl-3 border-l border-border-light' : ''}>
        <span className="block text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">
          {humanLabel}
        </span>
        <div className="space-y-2">
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
      <div>
        <span className="block text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">
          {humanLabel}
        </span>
        <div className="space-y-2 pl-3 border-l border-border-light">
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
      <div className="flex items-center justify-between py-1">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
          {humanLabel}
        </span>
        <span className="text-sm font-semibold text-accent tabular-nums">
          {formatMoney(value, currency)}
        </span>
      </div>
    );
  }

  // ── Long text (clauses, conditions) ──
  if (isLongText(value)) {
    return (
      <div>
        <span className="block text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">
          {humanLabel}
        </span>
        <p className="text-sm font-normal text-ink leading-relaxed">
          {value}
        </p>
      </div>
    );
  }

  // ── Default: string or short value ──
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
        {humanLabel}
      </span>
      <span className="text-sm font-normal text-ink">{String(value)}</span>
    </div>
  );
};
