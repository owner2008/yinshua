import type { Quote } from './types';

export interface QuoteFeeNote {
  code: string;
  title: string;
  amount: number;
  description: string;
}

const extraFeeDescriptions: Record<string, string> = {
  white_ink: '透明膜、深色底材或需要遮盖底色时，通常要先铺白墨，因此会增加开机、油墨和印刷校准成本。',
  variable_data: '流水号、条码、二维码等可变内容需要逐张生成和校验，会增加数据处理与印刷检测成本。',
  protective_finish: '防水、防刮等表面处理会增加涂层或后道处理成本，适合冷藏、潮湿、摩擦频繁等使用环境。',
  roll_split: '按每卷数量分卷交付时，需要额外复卷、计数和包装，所以会按分卷数量计入整理费用。',
  sheet_cutting: '单张裁切需要额外裁切、点数和整理，适合手工分发或单张贴标场景。',
  fan_fold: '折叠或风琴折交付需要专门整理成连续折叠形态，适合连续打印或批量贴标场景。',
};

export function getExtraFeeNotes(extraFees: Quote['extraFees'] | undefined): QuoteFeeNote[] {
  return (extraFees ?? [])
    .map((fee) => {
      const description = extraFeeDescriptions[fee.code];
      return description
        ? { code: fee.code, title: fee.name, amount: fee.amount, description }
        : null;
    })
    .filter((item): item is QuoteFeeNote => Boolean(item));
}
