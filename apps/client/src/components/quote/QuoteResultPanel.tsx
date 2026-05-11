import { useMemo } from 'react';
import { InfoChip } from '../cards';
import { useI18n } from '../../i18n';
import { getExtraFeeNotes } from '../../quoteFeeNotes';
import { getQuoteRequirementItems } from '../../quoteRequirements';
import type { QuoteResult } from '../../types';

export function QuoteResultPanel({ result }: { result: QuoteResult | null }) {
  const { locale, t, text } = useI18n();
  const money = useMemo(
    () => new Intl.NumberFormat(locale === 'en-US' ? 'en-US' : 'zh-CN', { style: 'currency', currency: 'CNY' }),
    [locale],
  );

  if (!result) {
    return (
      <aside className="lc-card lc-quote-result empty">
        <p className="lc-kicker">{t('quote.result.kicker')}</p>
        <h2>{t('quote.result.waiting')}</h2>
        <p>{t('quote.result.waitingDesc')}</p>
      </aside>
    );
  }

  const feeNotes = getExtraFeeNotes(result.extraFees);
  const requirementItems = getQuoteRequirementItems(result).slice(0, 12);

  return (
    <aside className="lc-card lc-quote-result">
      <p className="lc-kicker">
        {t('quote.result.quoteNo')} {result.quoteNo}
      </p>
      <h2>{money.format(result.summary.finalPrice)}</h2>
      <div className="lc-unit-price">
        {t('quote.result.unitPrice')} {money.format(result.summary.unitPrice)} / {t('quote.result.perPiece')}
      </div>
      <dl>
        <ResultLine label={t('quote.result.baseCost')} value={money.format(result.summary.baseCost)} />
        <ResultLine label={t('quote.result.materialCost')} value={money.format(result.material.cost)} />
        <ResultLine label={t('quote.result.printCost')} value={money.format(result.print.cost)} />
        {result.processes.map((process) => (
          <ResultLine key={process.code} label={text(process.name)} value={money.format(process.cost)} />
        ))}
        {result.extraFees.map((fee) => (
          <ResultLine key={fee.code} label={text(fee.name)} value={money.format(fee.amount)} />
        ))}
      </dl>
      {requirementItems.length ? (
        <div className="lc-requirement-summary">
          <strong>标签参数</strong>
          {requirementItems.map((item) => (
            <span key={item.key}>
              {item.label}：{item.value}
            </span>
          ))}
        </div>
      ) : null}
      {feeNotes.length ? (
        <div className="lc-fee-notes">
          <strong>{t('quote.result.feeNotes')}</strong>
          {feeNotes.map((note) => (
            <InfoChip key={note.code}>{text(note.title)}</InfoChip>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
