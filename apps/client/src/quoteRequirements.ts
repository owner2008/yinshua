import { quoteRequirementLabels } from './quoteParameterConfig';
import type { MemberQuote, QuoteResult } from './types';

const requirementKeys = Object.keys(quoteRequirementLabels);

export interface QuoteRequirementItem {
  key: string;
  label: string;
  value: string;
}

export function getQuoteInput(source: MemberQuote | QuoteResult | Record<string, unknown> | null | undefined) {
  if (!source) {
    return {};
  }
  const record = source as Record<string, unknown>;
  const snapshot = record.snapshot;
  if (isRecord(snapshot)) {
    const fullSnapshotJson = snapshot.fullSnapshotJson;
    if (isRecord(fullSnapshotJson)) {
      const nestedSnapshot = fullSnapshotJson.snapshot;
      if (isRecord(nestedSnapshot) && isRecord(nestedSnapshot.input)) {
        return nestedSnapshot.input;
      }
      return fullSnapshotJson;
    }
    if (isRecord(snapshot.input)) {
      return snapshot.input;
    }
  }
  return record;
}

export function getQuoteRequirementItems(
  source: MemberQuote | QuoteResult | Record<string, unknown> | null | undefined,
): QuoteRequirementItem[] {
  const input = getQuoteInput(source);
  return requirementKeys
    .map((key) => ({
      key,
      label: quoteRequirementLabels[key],
      value: formatRequirementValue(key, input[key]),
    }))
    .filter((item) => item.value.length > 0);
}

function formatRequirementValue(key: string, value: unknown) {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  if (key === 'rollCoreMm') {
    return `${value} mm`;
  }
  if (key === 'piecesPerRoll') {
    return `${value} 个/卷`;
  }
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
