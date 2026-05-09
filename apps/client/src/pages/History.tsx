import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyQuotes } from '../api';
import { useCatalog } from '../catalogContext';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { PageHero } from '../components/PageHero';
import { useI18n } from '../i18n';
import { getExtraFeeNotes, type QuoteFeeNote } from '../quoteFeeNotes';
import { getQuoteRequirementItems } from '../quoteRequirements';
import type { MemberQuote, QuoteResult } from '../types';

export function HistoryPage() {
  const { ensureSession } = useCatalog();
  const { locale, t } = useI18n();
  const money = useMemo(
    () => new Intl.NumberFormat(locale === 'en-US' ? 'en-US' : 'zh-CN', { style: 'currency', currency: 'CNY' }),
    [locale],
  );
  const [history, setHistory] = useState<MemberQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      await ensureSession();
      setHistory(await fetchMyQuotes());
    } catch (e) {
      setError(toFriendlyHistoryError(e, t));
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="lc-subpage">
      <H5PageChrome title={t('history.hero.title')} subtitle={t('history.hero.subtitle')} />
      <PageHero kicker={t('history.hero.eyebrow')} title={t('history.hero.title')} desc={t('history.hero.desc')}>
        <button className="lc-button ghost" onClick={load} type="button">
          {loading ? t('member.refreshing') : t('member.refresh')}
        </button>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container">
          {error ? <p className="lc-error-copy">{error}</p> : null}
          {history.length === 0 ? (
            <div className="lc-empty-state lc-card">
              <h3>{t('history.empty.title')}</h3>
              <p>{t('history.empty.desc')}</p>
              <Link className="lc-button primary" to="/quote">
                {t('common.getQuote')}
              </Link>
            </div>
          ) : (
            <div className="lc-history-list">
              {history.map((quote) => (
                <article key={quote.quoteNo} className="lc-card lc-history-card">
                  <div>
                    <span className="lc-card-kicker">{t('history.card.quoteNo')}</span>
                    <h3>{quote.quoteNo}</h3>
                    <p>
                      {t('history.card.productId')} {quote.productId} / {t('history.card.templateId')}{' '}
                      {quote.productTemplateId}
                    </p>
                    <RequirementPreview quote={quote} />
                    <FeeNotePreview notes={getHistoryFeeNotes(quote)} />
                  </div>
                  <div className="lc-history-price">
                    <strong>{getQuoteSummary(quote) ? money.format(getQuoteSummary(quote)!.finalPrice) : '-'}</strong>
                    <span>
                      {quote.quantity} {t('history.quantityUnit')}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <H5TabBar />
    </div>
  );
}

function FeeNotePreview({ notes }: { notes: QuoteFeeNote[] }) {
  const { t, text } = useI18n();
  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="lc-fee-notes">
      <strong>{t('quote.result.feeNotes')}</strong>
      {notes.map((note) => (
        <span key={note.code}>{text(note.title)}</span>
      ))}
    </div>
  );
}

function RequirementPreview({ quote }: { quote: MemberQuote }) {
  const { text } = useI18n();
  const items = getQuoteRequirementItems(quote).slice(0, 6);
  if (items.length === 0) {
    return null;
  }

  return (
    <dl className="lc-requirement-list">
      {items.map((item) => (
        <div key={item.key}>
          <dt>{text(item.label)}</dt>
          <dd>{text(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function getQuoteSummary(quote: MemberQuote): QuoteResult['summary'] | undefined {
  return quote.summary ?? quote.snapshot?.fullSnapshotJson?.summary;
}

function getHistoryFeeNotes(quote: MemberQuote): QuoteFeeNote[] {
  return getExtraFeeNotes(quote.snapshot?.fullSnapshotJson?.extraFees);
}

function toFriendlyHistoryError(error: unknown, t: ReturnType<typeof useI18n>['t']): string {
  const message = error instanceof Error ? error.message : '';
  if (/HTTP\s*5\d\d|Failed to fetch|NetworkError/i.test(message)) {
    return t('history.error.network');
  }

  return message || t('history.error.default');
}
