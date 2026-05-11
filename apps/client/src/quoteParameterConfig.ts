import type { QuoteInput } from './types';

export type QuoteParameterFieldType = 'select' | 'number' | 'text' | 'textarea' | 'checkbox';
export type QuoteParameterFieldName = keyof QuoteInput;

export interface QuoteParameterOption {
  label: string;
  value: string;
}

export interface QuoteParameterField {
  name: QuoteParameterFieldName;
  label: string;
  type: QuoteParameterFieldType;
  placeholder?: string;
  min?: number;
  defaultValue?: string | number | boolean;
  options?: QuoteParameterOption[];
  visibleWhen?: Partial<Record<QuoteParameterFieldName, string | number | boolean>>;
}

export interface QuoteParameterSection {
  key: string;
  title: string;
  description: string;
  fields: QuoteParameterField[];
}

export const deliveryFormOptions = [
  { label: '卷装', value: 'roll' },
  { label: '张装', value: 'sheet' },
  { label: '单张裁切', value: 'sheet_cut' },
  { label: '折页 / 风琴折', value: 'fan_fold' },
];

export const labelingMethodOptions = [
  { label: '手工贴标', value: 'manual' },
  { label: '自动贴标', value: 'automatic' },
  { label: '半自动贴标', value: 'semi_automatic' },
];

export const rollDirectionOptions = [
  { label: '上出', value: 'top_out' },
  { label: '下出', value: 'bottom_out' },
  { label: '左出', value: 'left_out' },
  { label: '右出', value: 'right_out' },
  { label: '内卷', value: 'inside' },
  { label: '外卷', value: 'outside' },
];

export const adhesiveTypeOptions = [
  { label: '永久胶', value: 'permanent' },
  { label: '可移胶', value: 'removable' },
  { label: '强粘胶', value: 'strong' },
  { label: '冷冻胶', value: 'freezer' },
  { label: '耐高温胶', value: 'heat_resistant' },
];

export const surfaceFinishOptions = [
  { label: '哑膜', value: 'matte_lamination' },
  { label: '亮膜', value: 'gloss_lamination' },
  { label: '哑油', value: 'matte_varnish' },
  { label: '光油', value: 'gloss_varnish' },
  { label: '防刮', value: 'scratch_resistant' },
  { label: '防水', value: 'waterproof' },
  { label: '白墨打底', value: 'white_ink' },
];

export const colorModeOptions = [
  { label: '四色印刷', value: 'four_color' },
  { label: '单黑', value: 'black' },
  { label: '专色', value: 'spot_color' },
  { label: '四色 + 白墨', value: 'four_color_white_ink' },
  { label: '可变数据 / 条码', value: 'variable_data' },
];

export const quoteParameterSections: QuoteParameterSection[] = [
  {
    key: 'base',
    title: '基础规格',
    description: '填写标签尺寸、数量和款数。',
    fields: [
      { name: 'widthMm', label: '宽度（mm）', type: 'number', min: 1 },
      { name: 'heightMm', label: '高度（mm）', type: 'number', min: 1 },
      { name: 'quantity', label: '数量', type: 'number', min: 1 },
      { name: 'styleCount', label: '款数', type: 'number', min: 1, defaultValue: 1 },
    ],
  },
  {
    key: 'material',
    title: '材料与工艺',
    description: '选择胶型、印刷颜色和表面处理。',
    fields: [
      { name: 'adhesiveType', label: '胶型', type: 'select', options: adhesiveTypeOptions },
      { name: 'usageEnvironment', label: '使用环境', type: 'text', placeholder: '如冷冻、户外、防水、耐油' },
      { name: 'surfaceFinish', label: '表面处理', type: 'select', options: surfaceFinishOptions },
      { name: 'colorMode', label: '印刷颜色', type: 'select', options: colorModeOptions },
    ],
  },
  {
    key: 'delivery',
    title: '卷装与交付',
    description: '补充贴标、卷芯、包装和交期要求。',
    fields: [
      { name: 'deliveryForm', label: '交付形式', type: 'select', options: deliveryFormOptions },
      { name: 'labelingMethod', label: '贴标方式', type: 'select', options: labelingMethodOptions },
      {
        name: 'rollDirection',
        label: '出标 / 卷标方向',
        type: 'select',
        options: rollDirectionOptions,
        visibleWhen: { deliveryForm: 'roll' },
      },
      {
        name: 'rollCoreMm',
        label: '卷芯内径（mm）',
        type: 'number',
        min: 0,
        defaultValue: 76,
        visibleWhen: { deliveryForm: 'roll' },
      },
      {
        name: 'piecesPerRoll',
        label: '每卷数量',
        type: 'number',
        min: 0,
        defaultValue: 1000,
        visibleWhen: { deliveryForm: 'roll' },
      },
      { name: 'packagingMethod', label: '包装与发货要求', type: 'text', placeholder: '如按卷分装、纸箱、发货地区' },
      { name: 'expectedDeliveryDate', label: '期望交期', type: 'text', placeholder: '如 3 天内、下周五前' },
      { name: 'shippingRegionCode', label: '收货区域', type: 'text', placeholder: '省市区或区域编码' },
    ],
  },
  {
    key: 'file',
    title: '文件与复核',
    description: '记录设计文件、样稿确认和补充说明。',
    fields: [
      { name: 'hasDesignFile', label: '已有设计文件', type: 'checkbox', defaultValue: false },
      { name: 'designFileUrl', label: '设计文件地址', type: 'text', placeholder: '网盘、图片或文件链接' },
      { name: 'needDesignService', label: '需要设计协助', type: 'checkbox', defaultValue: false },
      { name: 'needSampleApproval', label: '需要样稿确认', type: 'checkbox', defaultValue: false },
      { name: 'quoteRemark', label: '补充说明', type: 'textarea', placeholder: '可补充贴标设备、卷外径、特殊工艺、文件状态等' },
    ],
  },
];

export const quoteRequirementLabels = Object.fromEntries(
  quoteParameterSections.flatMap((section) => section.fields.map((field) => [field.name, field.label])),
) as Record<string, string>;

export function getDefaultRequirementValues(): Partial<QuoteInput> {
  return Object.fromEntries(
    quoteParameterSections
      .flatMap((section) => section.fields)
      .filter((field) => field.defaultValue !== undefined)
      .map((field) => [field.name, field.defaultValue]),
  ) as Partial<QuoteInput>;
}
