import type { MemberQuote, QuoteResult } from './types';

export const quoteRequirementLabels: Record<string, string> = {
  deliveryForm: '交付形式',
  labelingMethod: '贴标方式',
  rollDirection: '出标 / 卷标方向',
  rollCoreMm: '卷芯内径',
  piecesPerRoll: '每卷数量',
  adhesiveType: '胶性',
  usageEnvironment: '使用环境',
  surfaceFinish: '表面处理',
  colorMode: '印刷颜色',
  hasDesignFile: '已有设计文件',
  designFileUrl: '设计文件地址',
  needDesignService: '需要设计协助',
  needSampleApproval: '需要样稿确认',
  packagingMethod: '包装与发货',
  expectedDeliveryDate: '期望交期',
  quoteRemark: '补充说明',
};

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
