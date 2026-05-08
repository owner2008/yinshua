import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { calculateQuote, saveQuote } from '../api';
import { useCatalog } from '../catalogContext';
import { InfoChip, SectionHeading } from '../components/cards';
import { PageHero } from '../components/PageHero';
import { ProductVisual } from '../components/PrintingVisuals';
import { getExtraFeeNotes } from '../quoteFeeNotes';
import type { Product, ProductTemplate, QuoteInput, QuoteResult, TemplateOption } from '../types';

const money = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });
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
    setLocalNotice('正在计算报价');
    try {
      const result = await calculateQuote(normalizeQuoteInput(quoteInput));
      setQuoteResult(result);
      setLocalNotice('报价已生成');
      setNotice('报价已生成');
    } catch (error) {
      setLocalNotice(error instanceof Error ? error.message : '报价失败');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!quoteInput) {
      return;
    }
    setBusy(true);
    setLocalNotice('正在保存报价');
    try {
      await ensureSession();
      const result = await saveQuote(normalizeQuoteInput(quoteInput));
      setQuoteResult(result);
      setLocalNotice(`报价单 ${result.quoteNo} 已保存`);
      setNotice(`报价单 ${result.quoteNo} 已保存`);
    } catch (error) {
      setLocalNotice(error instanceof Error ? error.message : '保存失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lc-subpage">
      <PageHero
        kicker="Online Quote"
        title="在线报价"
        desc="选择产品、尺寸、材质、数量与工艺后生成参考报价；复杂工艺可补充说明，由客服复核。"
      >
        <div className="lc-page-stat">
          <strong>3</strong>
          <span>步提交需求</span>
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
              <strong>{product.name}</strong>
              <small>{product.applicationScenario ?? '支持按需定制'}</small>
            </button>
          ))}
        </aside>

        {quoteInput && selectedTemplate ? (
          <form className="lc-quote-main" onSubmit={calculate}>
            <section className="lc-card lc-selected-product">
              <ProductVisual product={selectedProduct} tone={1} />
              <div>
                <p className="lc-kicker">当前产品</p>
                <h2>{selectedProduct?.name}</h2>
                <p>{selectedProduct?.description ?? selectedProduct?.applicationScenario}</p>
                {selectedProduct ? <Link to={`/products/${selectedProduct.id}`}>查看产品详情</Link> : null}
              </div>
            </section>

            <FormPanel title="基础报价参数" desc="尺寸、数量、材质和印刷方式会直接影响基础成本。">
              <Field label="报价模板">
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
                      {template.templateName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="宽度（毫米）">
                <input type="number" min={1} value={quoteInput.widthMm} onChange={(event) => updateInput('widthMm', Number(event.target.value))} />
              </Field>
              <Field label="高度（毫米）">
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
              <Field label="印刷方式">
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
            </FormPanel>

            <section className="lc-card lc-form-panel">
              <SectionHeading kicker="Craft" title="工艺选择" desc={selectedTemplate.templateName} />
              {options.processes.length === 0 ? (
                <p className="lc-empty-copy">该模板暂无可选工艺</p>
              ) : (
                <div className="lc-chip-filter">
                  {options.processes.map((option) => (
                    <button
                      key={option.optionValue}
                      type="button"
                      className={quoteInput.processCodes.includes(option.optionValue) ? 'active' : ''}
                      onClick={() => toggleProcess(option.optionValue)}
                    >
                      {option.optionLabel}
                    </button>
                  ))}
                </div>
              )}
              <div className="lc-toggle-row">
                <label>
                  <input type="checkbox" checked={quoteInput.isProofing} onChange={(event) => updateInput('isProofing', event.target.checked)} />
                  打样确认
                </label>
                <label>
                  <input type="checkbox" checked={quoteInput.isUrgent} onChange={(event) => updateInput('isUrgent', event.target.checked)} />
                  加急生产
                </label>
              </div>
            </section>

            <FormPanel title="交付与贴标" desc="卷标方向、卷芯和每卷数量会影响后道整理和贴标适配。">
              <Field label="交付形式">
                <select value={quoteInput.deliveryForm ?? ''} onChange={(event) => updateInput('deliveryForm', event.target.value)}>
                  {deliveryForms.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="贴标方式">
                <select value={quoteInput.labelingMethod ?? ''} onChange={(event) => updateInput('labelingMethod', event.target.value)}>
                  {labelingMethods.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="出标 / 卷标方向">
                <select value={quoteInput.rollDirection ?? ''} onChange={(event) => updateInput('rollDirection', event.target.value)}>
                  {rollDirections.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="卷芯内径（毫米）">
                <input type="number" min={0} value={quoteInput.rollCoreMm ?? 76} onChange={(event) => updateInput('rollCoreMm', Number(event.target.value))} />
              </Field>
              <Field label="每卷数量">
                <input type="number" min={0} value={quoteInput.piecesPerRoll ?? 1000} onChange={(event) => updateInput('piecesPerRoll', Number(event.target.value))} />
              </Field>
            </FormPanel>

            <FormPanel title="材料环境与文件" desc="补充使用环境、表面处理和设计文件，便于客服复核报价。">
              <Field label="胶性 / 使用环境">
                <select value={quoteInput.adhesiveType ?? ''} onChange={(event) => updateInput('adhesiveType', event.target.value)}>
                  {adhesiveTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="表面处理">
                <select value={quoteInput.surfaceFinish ?? ''} onChange={(event) => updateInput('surfaceFinish', event.target.value)}>
                  {surfaceFinishes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="印刷颜色">
                <select value={quoteInput.colorMode ?? ''} onChange={(event) => updateInput('colorMode', event.target.value)}>
                  {colorModes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="使用环境说明">
                <input value={quoteInput.usageEnvironment ?? ''} placeholder="如冷冻、户外、防水、耐油等" onChange={(event) => updateInput('usageEnvironment', event.target.value)} />
              </Field>
              <Field label="设计文件地址">
                <input value={quoteInput.designFileUrl ?? ''} placeholder="可填写网盘、图片或文件链接" onChange={(event) => updateInput('designFileUrl', event.target.value)} />
              </Field>
              <Field label="包装与发货要求">
                <input value={quoteInput.packagingMethod ?? ''} placeholder="如按卷分装、纸箱、发货地区等" onChange={(event) => updateInput('packagingMethod', event.target.value)} />
              </Field>
              <Field label="期望交期">
                <input value={quoteInput.expectedDeliveryDate ?? ''} placeholder="如 3 天内、下周五前" onChange={(event) => updateInput('expectedDeliveryDate', event.target.value)} />
              </Field>
              <label className="field lc-field-wide">
                <span>补充说明</span>
                <textarea
                  value={quoteInput.quoteRemark ?? ''}
                  placeholder="可补充贴标设备、卷外径、特殊工艺、文件状态等信息"
                  onChange={(event) => updateInput('quoteRemark', event.target.value)}
                />
              </label>
              <div className="lc-toggle-row lc-field-wide">
                <label>
                  <input type="checkbox" checked={Boolean(quoteInput.hasDesignFile)} onChange={(event) => updateInput('hasDesignFile', event.target.checked)} />
                  已有设计文件
                </label>
                <label>
                  <input type="checkbox" checked={Boolean(quoteInput.needDesignService)} onChange={(event) => updateInput('needDesignService', event.target.checked)} />
                  需要设计协助
                </label>
                <label>
                  <input type="checkbox" checked={Boolean(quoteInput.needSampleApproval)} onChange={(event) => updateInput('needSampleApproval', event.target.checked)} />
                  需要样稿确认
                </label>
              </div>
            </FormPanel>

            <div className="lc-action-row">
              <button className="lc-button primary" disabled={busy} type="submit">
                {busy ? '处理中...' : '计算报价'}
              </button>
              <button className="lc-button ghost" type="button" disabled={busy || !quoteResult} onClick={save}>
                保存报价
              </button>
              {localNotice ? <p>{localNotice}</p> : null}
            </div>
          </form>
        ) : (
          <section className="lc-card lc-selected-product">
            <ProductVisual product={selectedProduct} tone={1} />
            <div>
              <p className="lc-kicker">当前产品</p>
              <h2>{selectedProduct?.name ?? '未选择'}</h2>
              <p className="lc-empty-copy">该产品暂未配置报价模板，暂时无法生成在线报价。</p>
              {selectedProduct ? <Link to={`/products/${selectedProduct.id}`}>查看产品详情</Link> : null}
            </div>
          </section>
        )}

        <QuoteResultPanel result={quoteResult} />
      </section>
    </div>
  );
}

function QuoteResultPanel({ result }: { result: QuoteResult | null }) {
  if (!result) {
    return (
      <aside className="lc-card lc-quote-result empty">
        <p className="lc-kicker">Quote Result</p>
        <h2>等待计算</h2>
        <p>填写参数并点击计算后，这里会显示参考价格和费用明细。</p>
      </aside>
    );
  }

  const feeNotes = getExtraFeeNotes(result.extraFees);

  return (
    <aside className="lc-card lc-quote-result">
      <p className="lc-kicker">报价单 {result.quoteNo}</p>
      <h2>{money.format(result.summary.finalPrice)}</h2>
      <div className="lc-unit-price">单价 {money.format(result.summary.unitPrice)} / 枚</div>
      <dl>
        <ResultLine label="基础成本" value={money.format(result.summary.baseCost)} />
        <ResultLine label="材料成本" value={money.format(result.material.cost)} />
        <ResultLine label="印刷成本" value={money.format(result.print.cost)} />
        {result.processes.map((process) => (
          <ResultLine key={process.code} label={process.name} value={money.format(process.cost)} />
        ))}
        {result.extraFees.map((fee) => (
          <ResultLine key={fee.code} label={fee.name} value={money.format(fee.amount)} />
        ))}
      </dl>
      {feeNotes.length ? (
        <div className="lc-fee-notes">
          <strong>费用说明</strong>
          {feeNotes.map((note) => (
            <InfoChip key={note.code}>{note.title}</InfoChip>
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
