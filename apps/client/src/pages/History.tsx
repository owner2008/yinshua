import { useEffect, useState } from 'react';
import { fetchMyQuotes } from '../api';
import { useCatalog } from '../catalogContext';
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
      setError(e instanceof Error ? e.message : '加载失败');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="history-view panel">
      <div className="section-title">
        <h2>报价历史</h2>
        <button onClick={load}>{loading ? '刷新中…' : '刷新'}</button>
      </div>
      {error && <p className="error-copy">{error}</p>}
      {history.length === 0 ? (
        <p className="empty-copy">暂时没有已保存的报价</p>
      ) : (
        <div className="history-list">
          {history.map((quote) => (
            <article key={quote.quoteNo} className="history-item">
              <div>
                <strong>{quote.quoteNo}</strong>
                <span>
                  产品编号 {quote.productId} / 模板编号 {quote.productTemplateId}
                </span>
                <RequirementPreview quote={quote} />
                <FeeNotePreview notes={getHistoryFeeNotes(quote)} />
              </div>
              <div>
                <strong>
                  {getQuoteSummary(quote) ? money.format(getQuoteSummary(quote)!.finalPrice) : '-'}
                </strong>
                <span>{quote.quantity} 件</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function FeeNotePreview({ notes }: { notes: QuoteFeeNote[] }) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="quote-fee-note history-fee-note">
      <strong>费用说明</strong>
      <ul>
        {notes.map((note) => (
          <li key={note.code}>
            <span>{note.title}</span>
            <small>{note.description}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RequirementPreview({ quote }: { quote: MemberQuote }) {
  const items = getQuoteRequirementItems(quote).slice(0, 6);
  if (items.length === 0) {
    return null;
  }

  return (
    <dl className="requirement-list compact-requirements">
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
