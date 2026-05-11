import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { calculateQuote, saveQuote } from '../api';
import { useCatalog } from '../catalogContext';
import { SectionHeading } from '../components/cards';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { PageHero } from '../components/PageHero';
import { ProductVisual } from '../components/PrintingVisuals';
import { QuoteParameterSections } from '../components/quote/QuoteParameterSections';
import { QuoteProductSelector } from '../components/quote/QuoteProductSelector';
import { QuoteResultPanel } from '../components/quote/QuoteResultPanel';
import { useI18n } from '../i18n';
import { getDefaultRequirementValues } from '../quoteParameterConfig';
import type { Product, ProductTemplate, QuoteInput, QuoteResult, TemplateOption } from '../types';

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
        <QuoteProductSelector
          products={products}
          selectedProductId={selectedProductId}
          listRef={productListRef}
          onSelect={selectProduct}
        />

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

            <QuoteParameterSections input={quoteInput} onChange={updateInput} />

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
    ...getDefaultRequirementValues(),
    usageEnvironment: '',
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
