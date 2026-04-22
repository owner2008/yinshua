import { FormEvent, useEffect, useMemo, useState } from 'react';
import { post, request } from './api';
import { sampleProducts, sampleTemplates } from './sampleData';
import { MemberQuote, Product, ProductTemplate, QuoteInput, QuoteResult, TemplateOption } from './types';

const DEFAULT_USER_ID = 1;
const money = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });

export function App() {
  const [activeTab, setActiveTab] = useState<'quote' | 'history'>('quote');
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [templates, setTemplates] = useState<ProductTemplate[]>(sampleTemplates);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [quoteInput, setQuoteInput] = useState<QuoteInput>(initialQuoteInput);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [history, setHistory] = useState<MemberQuote[]>([]);
  const [notice, setNotice] = useState('正在读取产品配置');
  const [busy, setBusy] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);

  useEffect(() => {
    void loadCatalog();
  }, []);

  async function loadCatalog() {
    try {
      const [remoteProducts, remoteTemplates] = await Promise.all([
        request<Product[]>('/admin/products'),
        request<ProductTemplate[]>('/admin/product-templates'),
      ]);
      const nextProducts = remoteProducts.length > 0 ? remoteProducts : sampleProducts;
      const nextTemplates = remoteTemplates.length > 0 ? remoteTemplates : sampleTemplates;
      setProducts(nextProducts);
      setTemplates(nextTemplates);
      const firstProduct = nextProducts[0];
      const firstTemplate = nextTemplates.find((item) => Number(item.productId) === Number(firstProduct?.id)) ?? nextTemplates[0];
      if (firstProduct && firstTemplate) {
        setSelectedProductId(Number(firstProduct.id));
        setQuoteInput(createDefaultQuote(firstProduct, firstTemplate));
      }
      setNotice('产品配置已同步');
    } catch {
      setProducts(sampleProducts);
      setTemplates(sampleTemplates);
      setQuoteInput(createDefaultQuote(sampleProducts[0], sampleTemplates[0]));
      setNotice('使用内置样例配置');
    }
  }

  const selectedProduct = products.find((item) => Number(item.id) === selectedProductId) ?? products[0];
  const productTemplates = templates.filter((item) => Number(item.productId) === selectedProductId);
  const selectedTemplate = productTemplates.find((item) => Number(item.id) === quoteInput.productTemplateId) ?? productTemplates[0] ?? templates[0];
  const options = useMemo(() => getTemplateOptions(selectedTemplate), [selectedTemplate]);

  function selectProduct(product: Product) {
    const productId = Number(product.id);
    const template = templates.find((item) => Number(item.productId) === productId) ?? sampleTemplates[0];
    setSelectedProductId(productId);
    setQuoteInput(createDefaultQuote(product, template));
    setQuoteResult(null);
  }

  function updateInput<K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) {
    setQuoteInput((current) => ({ ...current, [key]: value }));
  }

  function toggleProcess(code: string) {
    setQuoteInput((current) => {
      const exists = current.processCodes.includes(code);
      return {
        ...current,
        processCodes: exists ? current.processCodes.filter((item) => item !== code) : [...current.processCodes, code],
      };
    });
  }

  async function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('正在计算报价');
    try {
      const result = await post<QuoteResult>('/quotes/calculate', normalizeQuoteInput(quoteInput));
      setQuoteResult(result);
      setNotice('报价已生成');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '报价失败');
    } finally {
      setBusy(false);
    }
  }

  async function saveQuote() {
    setBusy(true);
    setNotice('正在保存报价');
    try {
      const result = await post<QuoteResult>('/quotes', normalizeQuoteInput({ ...quoteInput, memberId: DEFAULT_USER_ID }));
      setQuoteResult(result);
      setNotice(`报价单 ${result.quoteNo} 已保存`);
      await loadHistory();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '保存失败');
    } finally {
      setBusy(false);
    }
  }

  async function loadHistory() {
    setHistoryBusy(true);
    try {
      setHistory(await request<MemberQuote[]>(`/member/quotes?userId=${DEFAULT_USER_ID}`));
    } catch {
      setHistory([]);
    } finally {
      setHistoryBusy(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      void loadHistory();
    }
  }, [activeTab]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">不干胶印刷</p>
          <h1>在线报价</h1>
        </div>
        <span className="status-dot">{notice}</span>
      </header>

      <nav className="tabs" aria-label="主导航">
        <button className={activeTab === 'quote' ? 'active' : ''} onClick={() => setActiveTab('quote')}>
          产品报价
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          历史报价
        </button>
      </nav>

      {activeTab === 'quote' ? (
        <section className="quote-layout">
          <ProductList products={products} selectedProductId={selectedProductId} onSelect={selectProduct} />
          <form className="quote-form" onSubmit={calculate}>
            <section className="panel product-hero">
              <div className="label-preview" aria-hidden="true">
                <span>{selectedProduct?.code ?? 'LABEL'}</span>
              </div>
              <div>
                <p className="eyebrow">当前产品</p>
                <h2>{selectedProduct?.name}</h2>
                <p>{selectedProduct?.description}</p>
              </div>
            </section>

            <section className="panel form-grid">
              <Field label="报价模板">
                <select
                  value={quoteInput.productTemplateId}
                  onChange={(event) => {
                    const templateId = Number(event.target.value);
                    const template = templates.find((item) => Number(item.id) === templateId) ?? selectedTemplate;
                    setQuoteInput(createDefaultQuote(selectedProduct, template));
                  }}
                >
                  {productTemplates.map((template) => (
                    <option key={template.id} value={Number(template.id)}>
                      {template.templateName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="宽度 mm">
                <input type="number" min={1} value={quoteInput.widthMm} onChange={(event) => updateInput('widthMm', Number(event.target.value))} />
              </Field>
              <Field label="高度 mm">
                <input type="number" min={1} value={quoteInput.heightMm} onChange={(event) => updateInput('heightMm', Number(event.target.value))} />
              </Field>
              <Field label="数量">
                <input type="number" min={1} value={quoteInput.quantity} onChange={(event) => updateInput('quantity', Number(event.target.value))} />
              </Field>
              <Field label="材料">
                <select value={quoteInput.materialId} onChange={(event) => updateInput('materialId', Number(event.target.value))}>
                  {options.materials.map((option) => (
                    <option key={option.optionValue} value={Number(option.optionValue)}>
                      {option.optionLabel}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="印刷">
                <select value={quoteInput.printMode} onChange={(event) => updateInput('printMode', event.target.value)}>
                  {options.printModes.map((option) => (
                    <option key={option.optionValue} value={option.optionValue}>
                      {option.optionLabel}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="形状">
                <select value={quoteInput.shapeType} onChange={(event) => updateInput('shapeType', event.target.value)}>
                  {options.shapes.map((option) => (
                    <option key={option.optionValue} value={option.optionValue}>
                      {option.optionLabel}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="客户类型">
                <select value={quoteInput.customerType} onChange={(event) => updateInput('customerType', event.target.value as QuoteInput['customerType'])}>
                  <option value="personal">个人客户</option>
                  <option value="company">企业客户</option>
                </select>
              </Field>
            </section>

            <section className="panel">
              <div className="section-title">
                <h2>工艺选择</h2>
                <span>{selectedTemplate?.templateName}</span>
              </div>
              <div className="chip-row">
                {options.processes.map((option) => (
                  <button
                    key={option.optionValue}
                    type="button"
                    className={quoteInput.processCodes.includes(option.optionValue) ? 'chip selected' : 'chip'}
                    onClick={() => toggleProcess(option.optionValue)}
                  >
                    {option.optionLabel}
                  </button>
                ))}
              </div>
              <div className="toggle-row">
                <label>
                  <input type="checkbox" checked={quoteInput.isProofing} onChange={(event) => updateInput('isProofing', event.target.checked)} />
                  打样
                </label>
                <label>
                  <input type="checkbox" checked={quoteInput.isUrgent} onChange={(event) => updateInput('isUrgent', event.target.checked)} />
                  加急
                </label>
              </div>
            </section>

            <div className="action-bar">
              <button className="primary" disabled={busy} type="submit">
                {busy ? '处理中' : '计算报价'}
              </button>
              <button type="button" disabled={busy || !quoteResult} onClick={saveQuote}>
                保存报价
              </button>
            </div>
          </form>
          <QuoteResultPanel result={quoteResult} />
        </section>
      ) : (
        <HistoryPanel history={history} loading={historyBusy} onRefresh={loadHistory} />
      )}
    </main>
  );
}

function ProductList({ products, selectedProductId, onSelect }: { products: Product[]; selectedProductId: number; onSelect: (product: Product) => void }) {
  return (
    <aside className="product-list">
      {products.map((product, index) => (
        <button key={product.id} className={Number(product.id) === selectedProductId ? 'product-card active' : 'product-card'} onClick={() => onSelect(product)}>
          <span className={`product-image tone-${index % 3}`} />
          <strong>{product.name}</strong>
          <small>{product.applicationScenario ?? product.code}</small>
        </button>
      ))}
    </aside>
  );
}

function QuoteResultPanel({ result }: { result: QuoteResult | null }) {
  if (!result) {
    return (
      <aside className="panel result-panel empty">
        <p className="eyebrow">报价结果</p>
        <h2>等待计算</h2>
      </aside>
    );
  }

  return (
    <aside className="panel result-panel">
      <p className="eyebrow">报价单 {result.quoteNo}</p>
      <h2>{money.format(result.summary.finalPrice)}</h2>
      <div className="unit-price">单价 {money.format(result.summary.unitPrice)} / 个</div>
      <dl>
        <div>
          <dt>基础成本</dt>
          <dd>{money.format(result.summary.baseCost)}</dd>
        </div>
        <div>
          <dt>材料成本</dt>
          <dd>{money.format(result.material.cost)}</dd>
        </div>
        <div>
          <dt>印刷成本</dt>
          <dd>{money.format(result.print.cost)}</dd>
        </div>
        {result.processes.map((process) => (
          <div key={process.code}>
            <dt>{process.name}</dt>
            <dd>{money.format(process.cost)}</dd>
          </div>
        ))}
        {result.extraFees.map((fee) => (
          <div key={fee.code}>
            <dt>{fee.name}</dt>
            <dd>{money.format(fee.amount)}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function HistoryPanel({ history, loading, onRefresh }: { history: MemberQuote[]; loading: boolean; onRefresh: () => void }) {
  return (
    <section className="history-view panel">
      <div className="section-title">
        <h2>历史报价</h2>
        <button onClick={onRefresh}>{loading ? '刷新中' : '刷新'}</button>
      </div>
      {history.length === 0 ? (
        <p className="empty-copy">暂无已保存报价</p>
      ) : (
        <div className="history-list">
          {history.map((quote) => (
            <article key={quote.quoteNo} className="history-item">
              <div>
                <strong>{quote.quoteNo}</strong>
                <span>产品 {quote.productId} / 模板 {quote.productTemplateId}</span>
              </div>
              <div>
                <strong>{quote.summary ? money.format(quote.summary.finalPrice) : '-'}</strong>
                <span>{quote.quantity} 个</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function createDefaultQuote(product: Product | undefined, template: ProductTemplate | undefined): QuoteInput {
  const options = getTemplateOptions(template);
  return {
    productId: Number(product?.id ?? template?.productId ?? 1),
    productTemplateId: Number(template?.id ?? 1),
    widthMm: clamp(100, Number(template?.widthMin ?? 20), Number(template?.widthMax ?? 500)),
    heightMm: clamp(80, Number(template?.heightMin ?? 20), Number(template?.heightMax ?? 500)),
    quantity: clamp(5000, Number(template?.quantityMin ?? 100), Number(template?.quantityMax ?? 100000)),
    materialId: Number(options.materials[0]?.optionValue ?? 2),
    printMode: options.printModes[0]?.optionValue ?? 'four_color',
    shapeType: options.shapes[0]?.optionValue ?? 'rectangle',
    processCodes: options.processes.slice(0, 2).map((item) => item.optionValue),
    isProofing: false,
    isUrgent: false,
    customerType: 'company',
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
    materialId: Number(input.materialId),
    processCodes: input.isProofing && !input.processCodes.includes('proofing') ? [...input.processCodes, 'proofing'] : input.processCodes,
  };
}

function getTemplateOptions(template: ProductTemplate | undefined) {
  const options = template?.options?.length ? template.options : sampleTemplates[0].options ?? [];
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const initialQuoteInput = createDefaultQuote(sampleProducts[0], sampleTemplates[0]);
