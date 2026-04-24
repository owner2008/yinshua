import { useEffect, useState } from 'react';
import { fetchMyQuotes } from '../api';
import { useCatalog } from '../catalogContext';
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
        <h2>历史报价</h2>
        <button onClick={load}>{loading ? '刷新中' : '刷新'}</button>
      </div>
      {error && <p className="error-copy">{error}</p>}
      {history.length === 0 ? (
        <p className="empty-copy">暂无已保存报价</p>
      ) : (
        <div className="history-list">
          {history.map((quote) => (
            <article key={quote.quoteNo} className="history-item">
              <div>
                <strong>{quote.quoteNo}</strong>
                <span>
                  产品编号 {quote.productId} / 模板编号 {quote.productTemplateId}
                </span>
              </div>
              <div>
                <strong>
                  {getQuoteSummary(quote) ? money.format(getQuoteSummary(quote)!.finalPrice) : '-'}
                </strong>
                <span>{quote.quantity} 个</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function getQuoteSummary(quote: MemberQuote): QuoteResult['summary'] | undefined {
  return quote.summary ?? quote.snapshot?.fullSnapshotJson?.summary;
}
