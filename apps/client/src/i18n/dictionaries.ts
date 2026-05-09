export type Locale = 'zh-CN' | 'en-US';

export const defaultLocale: Locale = 'zh-CN';

export const localeLabels: Record<Locale, string> = {
  'zh-CN': '中文',
  'en-US': 'EN',
};

export const dictionaries = {
  'zh-CN': {
    'language.zh': '中文',
    'language.en': 'EN',
    'common.loading': '加载中...',
    'common.retry': '重试',
    'common.viewDetails': '查看详情',
    'common.getQuote': '立即获取报价',
    'common.contact': '联系客服咨询',
  },
  'en-US': {
    'language.zh': '中文',
    'language.en': 'EN',
    'common.loading': 'Loading...',
    'common.retry': 'Retry',
    'common.viewDetails': 'View details',
    'common.getQuote': 'Get a quote',
    'common.contact': 'Contact us',
  },
} as const;

export type TranslationKey = keyof typeof dictionaries['zh-CN'];
