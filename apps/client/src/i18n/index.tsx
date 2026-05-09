import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { defaultLocale, dictionaries, Locale, TranslationKey } from './dictionaries';
import { englishTextMap } from './textMap';

const storageKey = 'qddflc_locale';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
  text: (value?: string | null) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === 'en-US' || stored === 'zh-CN' ? stored : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(storageKey, nextLocale);
    } catch {
      // Language switching should still work even if storage is unavailable.
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => dictionaries[locale][key] ?? dictionaries[defaultLocale][key] ?? key,
    [locale],
  );

  const text = useCallback(
    (value?: string | null) => {
      if (!value) return '';
      if (locale === 'zh-CN') return value;
      return englishTextMap[value] ?? value;
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN'),
      t,
      text,
    }),
    [locale, setLocale, t, text],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}

export type { Locale, TranslationKey };
