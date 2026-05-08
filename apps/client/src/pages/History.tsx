import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyQuotes } from '../api';
import { useCatalog } from '../catalogContext';
import { PageHero } from '../components/PageHero';
import { getExtraFeeNotes, type QuoteFeeNote } from '../quoteFeeNotes';
import { getQuoteRequirementItems } from '../quoteRequirements';
import type { MemberQuote, QuoteResult } from '../types';

const money = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });

export function HistoryPage() {
  const { ensureSession } = useCatalog();
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
      setError(toFriendlyHistoryError(e));
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
      <PageHero kicker="Quote History" title="报价历史" desc="查看已保存的报价单、需求参数和费用说明，方便企业采购复盘与再次下单。">
        <button className="lc-button ghost" onClick={load} type="button">
          {loading ? '刷新中...' : '刷新'}
        </button>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container">
          {error ? <p className="lc-error-copy">{error}</p> : null}
          {history.length === 0 ? (
            <div className="lc-empty-state lc-card">
              <h3>暂无报价历史</h3>
              <p>您可以先提交一次报价需求，系统会在保存后记录报价单和关键参数。</p>
              <Link className="lc-button primary" to="/quote">
                立即获取报价
              </Link>
            </div>
          ) : (
            <div className="lc-history-list">
              {history.map((quote) => (
                <article key={quote.quoteNo} className="lc-card lc-history-card">
                  <div>
                    <span className="lc-card-kicker">报价单</span>
                    <h3>{quote.quoteNo}</h3>
                    <p>
                      产品编号 {quote.productId} / 模板编号 {quote.productTemplateId}
                    </p>
                    <RequirementPreview quote={quote} />
                    <FeeNotePreview notes={getHistoryFeeNotes(quote)} />
                  </div>
                  <div className="lc-history-price">
                    <strong>{getQuoteSummary(quote) ? money.format(getQuoteSummary(quote)!.finalPrice) : '-'}</strong>
                    <span>{quote.quantity} 枚</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FeeNotePreview({ notes }: { notes: QuoteFeeNote[] }) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="lc-fee-notes">
      <strong>费用说明</strong>
      {notes.map((note) => (
        <span key={note.code}>{note.title}</span>
      ))}
    </div>
  );
}

function RequirementPreview({ quote }: { quote: MemberQuote }) {
  const items = getQuoteRequirementItems(quote).slice(0, 6);
  if (items.length === 0) {
    return null;
  }

  return (
    <dl className="lc-requirement-list">
      {items.map((item) => (
        <div key={item.key}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
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

function toFriendlyHistoryError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/HTTP\s*5\d\d|Failed to fetch|NetworkError/i.test(message)) {
    return '报价历史暂时无法连接服务器，您仍可以先提交新的报价需求，稍后再回来查看历史记录。';
  }

  return message || '报价历史加载失败，请稍后重试。';
}
