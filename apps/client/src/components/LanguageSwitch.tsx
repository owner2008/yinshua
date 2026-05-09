import { useI18n } from '../i18n';

type LanguageSwitchProps = {
  compact?: boolean;
};

export function LanguageSwitch({ compact = false }: LanguageSwitchProps) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={compact ? 'lc-lang-switch lc-lang-switch--compact' : 'lc-lang-switch'}>
      <button
        type="button"
        className={locale === 'zh-CN' ? 'active' : ''}
        onClick={() => setLocale('zh-CN')}
      >
        中文
      </button>
      <button
        type="button"
        className={locale === 'en-US' ? 'active' : ''}
        onClick={() => setLocale('en-US')}
      >
        EN
      </button>
    </div>
  );
}
