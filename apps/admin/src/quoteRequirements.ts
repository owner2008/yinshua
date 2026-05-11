export const quoteRequirementLabels: Record<string, string> = {
  widthMm: '宽度（mm）',
  heightMm: '高度（mm）',
  quantity: '数量',
  styleCount: '款数',
  deliveryForm: '交付形式',
  labelingMethod: '贴标方式',
  rollDirection: '出标 / 卷标方向',
  rollCoreMm: '卷芯内径（mm）',
  piecesPerRoll: '每卷数量',
  adhesiveType: '胶型',
  usageEnvironment: '使用环境',
  surfaceFinish: '表面处理',
  colorMode: '印刷颜色',
  hasDesignFile: '已有设计文件',
  designFileUrl: '设计文件地址',
  needDesignService: '需要设计协助',
  needSampleApproval: '需要样稿确认',
  packagingMethod: '包装与发货要求',
  expectedDeliveryDate: '期望交期',
  shippingRegionCode: '收货区域',
  quoteRemark: '补充说明',
};

const requirementKeys = Object.keys(quoteRequirementLabels);

const quoteParameterOptionLabels: Record<string, string> = {
  roll: '卷装',
  sheet: '张装',
  sheet_cut: '单张裁切',
  fan_fold: '折页 / 风琴折',
  manual: '手工贴标',
  automatic: '自动贴标',
  semi_automatic: '半自动贴标',
  top_out: '上出',
  bottom_out: '下出',
  left_out: '左出',
  right_out: '右出',
  inside: '内卷',
  outside: '外卷',
  permanent: '永久胶',
  removable: '可移胶',
  strong: '强粘胶',
  freezer: '冷冻胶',
  heat_resistant: '耐高温胶',
  matte_lamination: '哑膜',
  gloss_lamination: '亮膜',
  matte_varnish: '哑油',
  gloss_varnish: '光油',
  scratch_resistant: '防刮',
  waterproof: '防水',
  white_ink: '白墨打底',
  four_color: '四色印刷',
  black: '单黑',
  spot_color: '专色',
  four_color_white_ink: '四色 + 白墨',
  variable_data: '可变数据 / 条码',
};

export interface QuoteRequirementItem {
  key: string;
  label: string;
  value: string;
}

export function getQuoteRequirementItems(snapshot: Record<string, unknown> | null | undefined): QuoteRequirementItem[] {
  const input = getSnapshotInput(snapshot);
  return requirementKeys
    .map((key) => ({
      key,
      label: quoteRequirementLabels[key],
      value: formatRequirementValue(key, input[key]),
    }))
    .filter((item) => item.value.length > 0);
}

function getSnapshotInput(snapshot: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (isRecord(snapshot?.snapshot) && isRecord(snapshot.snapshot.input)) {
    return snapshot.snapshot.input;
  }
  const fullSnapshot = snapshot?.fullSnapshotJson;
  if (isRecord(fullSnapshot)) {
    const nestedSnapshot = fullSnapshot.snapshot;
    if (isRecord(nestedSnapshot) && isRecord(nestedSnapshot.input)) {
      return nestedSnapshot.input;
    }
  }
  if (isRecord(snapshot?.input)) {
    return snapshot.input;
  }
  return {};
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
  const rawValue = String(value);
  return quoteParameterOptionLabels[rawValue] ?? rawValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
