import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { calculateQuote, saveQuote } from '../api';
import { useCatalog } from '../catalogContext';
import { InfoChip, SectionHeading } from '../components/cards';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { PageHero } from '../components/PageHero';
import { ProductVisual } from '../components/PrintingVisuals';
import { useI18n } from '../i18n';
import { getExtraFeeNotes } from '../quoteFeeNotes';
import type { Product, ProductTemplate, QuoteInput, QuoteResult, TemplateOption } from '../types';

const deliveryForms = ['卷装', '张装', '单张裁切', '折叠 / 风琴折'];
const labelingMethods = ['手工贴标', '自动贴标', '半自动贴标'];
const rollDirections = ['上出', '下出', '左出', '右出', '内卷', '外卷'];
const adhesiveTypes = ['永久胶', '可移胶', '强粘胶', '冷冻胶', '耐高温胶'];
const surfaceFinishes = ['哑膜', '亮膜', '哑油', '光油', '防刮', '防水', '白墨打底'];
const colorModes = ['四色印刷', '单黑', '专色', '四色 + 白墨', '可变数据 / 条码'];

function templatesForProduct(templates: ProductTemplate[], productId: number) {
  return templates.filter((item) => Number(item.productId) === productId);
}

export function QuotePage() {
  const { products, templates, setNotice, ensureSession } = useCatalog();
  const { t, text } = useI18n();
  const [params] = useSearchParams();
  const productListRef = useRef<HTMLElement | null>(null);
  const initialProductId = Number(params.get('productId')) || Number(products[0]?.id ?? 1);
  const [selectedProductId, setSelectedProductId] = useState<number>(initialProductId);
  const [quoteInput, setQuoteInput] = useState<QuoteInput | null>(() => {
    const product = products.find((item) => Number(item.id) === initialProductId) ?? products[0];
    const template = templatesForProduct(templates, Number(product?.id ?? 0))[0];
    return template ? createDefaultQuote(product, template) : null;
  });
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [localNotice, setLocalNotice] = useState('');

  useEffect(() => {
    const product = products.find((item) => Number(item.id) === initialProductId) ?? products[0];
    if (!product) {
      return;
    }
    const productId = Number(product.id);
    const template = templatesForProduct(templates, productId)[0];
    setSelectedProductId(productId);
    setQuoteResult(null);
    setQuoteInput(template ? createDefaultQuote(product, template) : null);
  }, [initialProductId, products, templates]);

  const selectedProduct = products.find((item) => Number(item.id) === selectedProductId) ?? products[0];
  const productTemplates = templatesForProduct(templates, selectedProductId);
  const selectedTemplate =
    productTemplates.find((item) => Number(item.id) === quoteInput?.productTemplateId) ?? productTemplates[0] ?? null;
  const options = useMemo(() => getTemplateOptions(selectedTemplate), [selectedTemplate]);

  useLayoutEffect(() => {
    const frames = [requestAnimationFrame(() => centerSelectedProduct(productListRef.current))];
    const timer = window.setTimeout(() => centerSelectedProduct(productListRef.current), 120);

    return () => {
      frames.forEach((frame) => cancelAnimationFrame(frame));
      window.clearTimeout(timer);
    };
  }, [selectedProductId, products.length]);

  function selectProduct(product: Product) {
    const productId = Number(product.id);
    const template = templatesForProduct(templates, productId)[0];
    setSelectedProductId(productId);
    setQuoteResult(null);
    setQuoteInput(template ? createDefaultQuote(product, template) : null);
  }

  function updateInput<K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) {
    setQuoteInput((current) => (current ? { ...current, [key]: value } : current));
  }

  function toggleProcess(code: string) {
    setQuoteInput((current) => {
      if (!current) {
        return current;
      }
      const exists = current.processCodes.includes(code);
      return {
        ...current,
        processCodes: exists ? current.processCodes.filter((item) => item !== code) : [...current.processCodes, code],
      };
    });
  }

  async function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quoteInput) {
      return;
    }
    setBusy(true);
    setLocalNotice(t('quote.notice.calculating'));
    try {
      const result = await calculateQuote(normalizeQuoteInput(quoteInput));
      setQuoteResult(result);
      setLocalNotice(t('quote.notice.generated'));
      setNotice(t('quote.notice.generated'));
    } catch (error) {
      setLocalNotice(error instanceof Error ? error.message : t('quote.notice.failed'));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!quoteInput) {
      return;
    }
    setBusy(true);
    setLocalNotice(t('quote.notice.saving'));
    try {
      await ensureSession();
      const result = await saveQuote(normalizeQuoteInput(quoteInput));
      setQuoteResult(result);
      const message = `${t('quote.result.quoteNo')} ${result.quoteNo} ${t('quote.notice.saved')}`;
      setLocalNotice(message);
      setNotice(message);
    } catch (error) {
      setLocalNotice(error instanceof Error ? error.message : t('quote.notice.saveFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lc-subpage">
      <H5PageChrome title={t('quote.hero.title')} subtitle={t('quote.hero.subtitle')} />
      <PageHero kicker={t('quote.hero.eyebrow')} title={t('quote.hero.title')} desc={t('quote.hero.desc')}>
        <div className="lc-page-stat">
          <strong>3</strong>
          <span>{t('quote.hero.steps')}</span>
        </div>
      </PageHero>

      <section className="lc-container lc-quote-page">
        <aside className="lc-product-selector" ref={productListRef}>
          {products.map((product, index) => (
            <button
              key={product.id}
              data-product-id={String(product.id)}
              className={Number(product.id) === selectedProductId ? 'active' : ''}
              onClick={() => selectProduct(product)}
              type="button"
            >
              <ProductVisual product={product} tone={index % 4} />
              <strong>{text(product.name)}</strong>
              <small>{text(product.applicationScenario) || text(product.description) || t('products.card.descFallback')}</small>
            </button>
          ))}
        </aside>

        {quoteInput && selectedTemplate ? (
          <form className="lc-quote-main" onSubmit={calculate}>
            <section className="lc-card lc-selected-product">
              <ProductVisual product={selectedProduct} tone={1} />
              <div>
                <p className="lc-kicker">{t('quote.currentProduct')}</p>
                <h2>{text(selectedProduct?.name)}</h2>
                <p>{text(selectedProduct?.description ?? selectedProduct?.applicationScenario)}</p>
                {selectedProduct ? <Link to={`/products/${selectedProduct.id}`}>{t('quote.viewProduct')}</Link> : null}
              </div>
            </section>

            <FormPanel title={t('quote.basic.title')} desc={t('quote.basic.subtitle')}>
              <Field label={t('quote.field.template')}>
                <select
                  value={quoteInput.productTemplateId}
                  onChange={(event) => {
                    const templateId = Number(event.target.value);
                    const template = productTemplates.find((item) => Number(item.id) === templateId) ?? selectedTemplate;
                    setQuoteInput(createDefaultQuote(selectedProduct, template));
                  }}
                >
                  {productTemplates.map((template) => (
                    <option key={template.id} value={Number(template.id)}>
                      {text(template.templateName)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('quote.field.width')}>
                <input type="number" min={1} value={quoteInput.widthMm} onChange={(event) => updateInput('widthMm', Number(event.target.value))} />
              </Field>
              <Field label={t('quote.field.height')}>
                <input type="number" min={1} value={quoteInput.heightMm} onChange={(event) => updateInput('heightMm', Number(event.target.value))} />
              </Field>
              <Field label={t('quote.field.quantity')}>
                <input type="number" min={1} value={quoteInput.quantity} onChange={(event) => updateInput('quantity', Number(event.target.value))} />
              </Field>
              <Field label={t('quote.field.material')}>
                <select value={quoteInput.materialId} onChange={(event) => updateInput('materialId', Number(event.target.value))}>
                  {options.materials.map((option) => (
                    <option key={option.optionValue} value={Number(option.optionValue)}>
                      {text(option.optionLabel)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('quote.field.print')}>
                <select value={quoteInput.printMode} onChange={(event) => updateInput('printMode', event.target.value)}>
                  {options.printModes.map((option) => (
                    <option key={option.optionValue} value={option.optionValue}>
                      {text(option.optionLabel)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('quote.field.shape')}>
                <select value={quoteInput.shapeType} onChange={(event) => updateInput('shapeType', event.target.value)}>
                  {options.shapes.map((option) => (
                    <option key={option.optionValue} value={option.optionValue}>
                      {text(option.optionLabel)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('quote.field.customerType')}>
                <select value={quoteInput.customerType} onChange={(event) => updateInput('customerType', event.target.value as QuoteInput['customerType'])}>
                  <option value="personal">{t('quote.customer.personal')}</option>
                  <option value="company">{t('quote.customer.company')}</option>
                </select>
              </Field>
            </FormPanel>

            <section className="lc-card lc-form-panel">
              <SectionHeading kicker={t('quote.craft.kicker')} title={t('quote.craft.title')} desc={text(selectedTemplate.templateName)} />
              {options.processes.length === 0 ? (
                <p className="lc-empty-copy">{t('quote.craft.empty')}</p>
              ) : (
                <div className="lc-chip-filter">
                  {options.processes.map((option) => (
                    <button
                      key={option.optionValue}
                      type="button"
                      className={quoteInput.processCodes.includes(option.optionValue) ? 'active' : ''}
                      onClick={() => toggleProcess(option.optionValue)}
                    >
                      {text(option.optionLabel)}
                    </button>
                  ))}
                </div>
              )}
              <div className="lc-toggle-row">
                <label>
                  <input type="checkbox" checked={quoteInput.isProofing} onChange={(event) => updateInput('isProofing', event.target.checked)} />
                  {t('quote.craft.proofing')}
                </label>
                <label>
                  <input type="checkbox" checked={quoteInput.isUrgent} onChange={(event) => updateInput('isUrgent', event.target.checked)} />
                  {t('quote.craft.urgent')}
                </label>
              </div>
            </section>

            <FormPanel title={t('quote.delivery.title')} desc={t('quote.delivery.desc')}>
              <SelectField label={t('quote.field.deliveryForm')} value={quoteInput.deliveryForm} options={deliveryForms} onChange={(value) => updateInput('deliveryForm', value)} />
              <SelectField label={t('quote.field.labelingMethod')} value={quoteInput.labelingMethod} options={labelingMethods} onChange={(value) => updateInput('labelingMethod', value)} />
              <SelectField label={t('quote.field.rollDirection')} value={quoteInput.rollDirection} options={rollDirections} onChange={(value) => updateInput('rollDirection', value)} />
              <Field label={t('quote.field.rollCore')}>
                <input type="number" min={0} value={quoteInput.rollCoreMm ?? 76} onChange={(event) => updateInput('rollCoreMm', Number(event.target.value))} />
              </Field>
              <Field label={t('quote.field.piecesPerRoll')}>
                <input type="number" min={0} value={quoteInput.piecesPerRoll ?? 1000} onChange={(event) => updateInput('piecesPerRoll', Number(event.target.value))} />
              </Field>
            </FormPanel>

            <FormPanel title={t('quote.file.title')} desc={t('quote.file.desc')}>
              <SelectField label={t('quote.field.adhesive')} value={quoteInput.adhesiveType} options={adhesiveTypes} onChange={(value) => updateInput('adhesiveType', value)} />
              <SelectField label={t('quote.field.surface')} value={quoteInput.surfaceFinish} options={surfaceFinishes} onChange={(value) => updateInput('surfaceFinish', value)} />
              <SelectField label={t('quote.field.color')} value={quoteInput.colorMode} options={colorModes} onChange={(value) => updateInput('colorMode', value)} />
              <Field label={t('quote.field.environment')}>
                <input value={quoteInput.usageEnvironment ?? ''} placeholder={t('quote.placeholder.environment')} onChange={(event) => updateInput('usageEnvironment', event.target.value)} />
              </Field>
              <Field label={t('quote.field.designFile')}>
                <input value={quoteInput.designFileUrl ?? ''} placeholder={t('quote.placeholder.designFile')} onChange={(event) => updateInput('designFileUrl', event.target.value)} />
              </Field>
              <Field label={t('quote.field.packaging')}>
                <input value={quoteInput.packagingMethod ?? ''} placeholder={t('quote.placeholder.packaging')} onChange={(event) => updateInput('packagingMethod', event.target.value)} />
              </Field>
              <Field label={t('quote.field.deliveryDate')}>
                <input value={quoteInput.expectedDeliveryDate ?? ''} placeholder={t('quote.placeholder.deliveryDate')} onChange={(event) => updateInput('expectedDeliveryDate', event.target.value)} />
              </Field>
              <label className="field lc-field-wide">
                <span>{t('quote.field.remark')}</span>
                <textarea value={quoteInput.quoteRemark ?? ''} placeholder={t('quote.placeholder.remark')} onChange={(event) => updateInput('quoteRemark', event.target.value)} />
              </label>
              <div className="lc-toggle-row lc-field-wide">
                <CheckboxField checked={Boolean(quoteInput.hasDesignFile)} label={t('quote.flag.hasDesignFile')} onChange={(value) => updateInput('hasDesignFile', value)} />
                <CheckboxField checked={Boolean(quoteInput.needDesignService)} label={t('quote.flag.needDesignService')} onChange={(value) => updateInput('needDesignService', value)} />
                <CheckboxField checked={Boolean(quoteInput.needSampleApproval)} label={t('quote.flag.needSampleApproval')} onChange={(value) => updateInput('needSampleApproval', value)} />
              </div>
            </FormPanel>

            <div className="lc-action-row">
              <button className="lc-button primary" disabled={busy} type="submit">
                {busy ? t('quote.action.calculating') : t('quote.action.calculate')}
              </button>
              <button className="lc-button ghost" type="button" disabled={busy || !quoteResult} onClick={save}>
                {t('quote.action.save')}
              </button>
              {localNotice ? <p>{localNotice}</p> : null}
            </div>
          </form>
        ) : (
          <section className="lc-card lc-selected-product">
            <ProductVisual product={selectedProduct} tone={1} />
            <div>
              <p className="lc-kicker">{t('quote.currentProduct')}</p>
              <h2>{text(selectedProduct?.name) || t('quote.noTemplate.title')}</h2>
              <p className="lc-empty-copy">{t('quote.noTemplate.desc')}</p>
              {selectedProduct ? <Link to={`/products/${selectedProduct.id}`}>{t('quote.viewProduct')}</Link> : null}
            </div>
          </section>
        )}

        <QuoteResultPanel result={quoteResult} />
      </section>
      <H5TabBar />
    </div>
  );
}

function QuoteResultPanel({ result }: { result: QuoteResult | null }) {
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

function FormPanel({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="lc-card lc-form-panel">
      <SectionHeading title={title} desc={desc} />
      <div className="lc-form-grid">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const { text } = useI18n();

  return (
    <Field label={label}>
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        {options.map((item) => (
          <option key={item} value={item}>
            {text(item)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function CheckboxField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function createDefaultQuote(product: Product | undefined, template: ProductTemplate): QuoteInput {
  const options = getTemplateOptions(template);
  const defaultWidth = clamp(
    Math.round((Number(template.widthMin) + Number(template.widthMax)) / 2),
    Number(template.widthMin),
    Number(template.widthMax),
  );
  const defaultHeight = clamp(
    Math.round((Number(template.heightMin) + Number(template.heightMax)) / 2),
    Number(template.heightMin),
    Number(template.heightMax),
  );
  const defaultQuantity = clamp(Math.max(1000, template.quantityMin), template.quantityMin, template.quantityMax);
  return {
    productId: Number(product?.id ?? template.productId),
    productTemplateId: Number(template.id),
    widthMm: defaultWidth,
    heightMm: defaultHeight,
    quantity: defaultQuantity,
    styleCount: 1,
    materialId: Number(options.materials[0]?.optionValue ?? 0),
    printMode: options.printModes[0]?.optionValue ?? '',
    shapeType: options.shapes[0]?.optionValue ?? '',
    processCodes: options.processes.slice(0, 2).map((item) => item.optionValue),
    isProofing: false,
    isUrgent: false,
    customerType: 'company',
    deliveryForm: '卷装',
    labelingMethod: '手工贴标',
    rollDirection: '上出',
    rollCoreMm: 76,
    piecesPerRoll: 1000,
    adhesiveType: '永久胶',
    surfaceFinish: '哑膜',
    colorMode: '四色印刷',
    usageEnvironment: '',
    hasDesignFile: false,
    needDesignService: false,
    needSampleApproval: true,
    packagingMethod: '',
    expectedDeliveryDate: '',
    quoteRemark: '',
  };
}

function normalizeQuoteInput(input: QuoteInput): QuoteInput {
  return {
    ...input,
    productId: Number(input.productId),
    productTemplateId: Number(input.productTemplateId),
    widthMm: Number(input.widthMm),
    heightMm: Number(input.heightMm),
    quantity: Number(input.quantity),
    styleCount: Number(input.styleCount || 1),
    materialId: Number(input.materialId),
    processCodes: input.isProofing && !input.processCodes.includes('proofing') ? [...input.processCodes, 'proofing'] : input.processCodes,
  };
}

function getTemplateOptions(template: ProductTemplate | null | undefined) {
  const options = template?.options ?? [];
  return {
    materials: filterOptions(options, 'material'),
    processes: filterOptions(options, 'process'),
    printModes: filterOptions(options, 'print_mode'),
    shapes: filterOptions(options, 'shape'),
  };
}

function filterOptions(options: TemplateOption[], type: string): TemplateOption[] {
  return options.filter((option) => option.optionType === type);
}

function centerSelectedProduct(container: HTMLElement | null) {
  const activeProduct = container?.querySelector<HTMLElement>('.active');
  if (!container || !activeProduct) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const activeRect = activeProduct.getBoundingClientRect();
  const left = container.scrollLeft + activeRect.left - containerRect.left - (container.clientWidth - activeRect.width) / 2;
  const top = container.scrollTop + activeRect.top - containerRect.top - (container.clientHeight - activeRect.height) / 2;

  container.scrollTo({
    left: Math.max(0, left),
    top: Math.max(0, top),
    behavior: 'smooth',
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
