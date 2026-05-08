import { Link } from 'react-router-dom';
import {
  advantages,
  cases,
  cooperationSteps,
  crafts,
  heroCopy,
  industries,
  materials,
  productCategories,
  qualityItems,
  quoteSteps,
  testimonials,
} from '../brandContent';
import { FeatureCard, InfoChip, ProcessStep, SectionHeading, StatCard } from '../components/cards';
import { HeroPrintingVisual, MaterialSample, ProductVisual, QrVisual } from '../components/PrintingVisuals';
import { useCatalog } from '../catalogContext';

export function HomePage() {
  const { products } = useCatalog();
  const displayProducts = productCategories.slice(0, 10);
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="lc-home">
      <section className="lc-hero lc-container">
        <div className="lc-hero-copy">
          <p className="lc-kicker">{heroCopy.kicker}</p>
          <h1>{heroCopy.title}</h1>
          <p>{heroCopy.subtitle}</p>
          <div className="lc-hero-actions">
            <Link className="lc-button primary" to="/quote">
              立即获取报价
            </Link>
            <a className="lc-button ghost" href="#cases">
              查看产品案例
            </a>
          </div>
          <div className="lc-hero-stats">
            <StatCard label="核心产品" value="10+" />
            <StatCard label="常用工艺" value="9" />
            <StatCard label="服务行业" value="8+" />
          </div>
        </div>
        <HeroPrintingVisual />
      </section>

      <section className="lc-section">
        <div className="lc-container">
          <SectionHeading kicker="Core Advantages" title="专业印刷能力，让企业采购更省心" desc="从材质选择、工艺建议到批量交付，围绕企业客户的稳定供货和快速响应构建服务。" />
          <div className="lc-grid-3">
            {advantages.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="lc-section lc-section-soft">
        <div className="lc-container">
          <SectionHeading
            kicker="Products"
            title="覆盖主流标签与包装印刷品类"
            desc="围绕食品饮料、日化美妆、医药保健、工业电子、电商物流等场景提供定制印刷。"
            action={<Link to="/products">查看全部产品</Link>}
          />
          <div className="lc-grid-4">
            {displayProducts.map((item, index) => (
              <article className="lc-product-card lc-card" key={item.name}>
                <ProductVisual product={featuredProducts[index]} tone={index % 4} />
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <Link to="/products">查看详情</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lc-section" id="quote">
        <div className="lc-container lc-quote-layout">
          <div className="lc-quote-copy">
            <SectionHeading kicker="Online Quote" title="3 步获取专属标签印刷报价" desc="用采购人员熟悉的参数组织报价入口，减少来回沟通，提升询价效率。" />
            <div className="lc-quote-steps">
              {quoteSteps.map((step, index) => (
                <ProcessStep key={step} index={index + 1} title={step} />
              ))}
            </div>
          </div>
          <form className="lc-quote-form">
            <label>
              产品类型
              <select defaultValue="不干胶标签">
                {productCategories.slice(0, 8).map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              标签尺寸
              <input placeholder="如 60 x 40 mm" />
            </label>
            <label>
              材质选择
              <select defaultValue="铜版纸">
                {materials.slice(0, 6).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              印刷数量
              <input placeholder="如 10000 枚" />
            </label>
            <label className="lc-form-wide">
              特殊工艺
              <input placeholder="二维码 / 防伪 / 烫金 / 局部 UV" />
            </label>
            <label className="lc-form-wide">
              联系方式
              <input placeholder="手机号或微信" />
            </label>
            <Link className="lc-button primary lc-form-submit" to="/quote">
              提交报价需求
            </Link>
          </form>
        </div>
      </section>

      <section className="lc-section lc-section-soft">
        <div className="lc-container">
          <SectionHeading kicker="Industries" title="面向多行业的标签印刷解决方案" />
          <div className="lc-industry-grid">
            {industries.map((item, index) => (
              <article className="lc-industry-card" key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lc-section" id="craft">
        <div className="lc-container">
          <SectionHeading kicker="Materials & Craft" title="丰富材质与后道工艺，适配不同包装场景" />
          <div className="lc-craft-layout">
            <div className="lc-card lc-sample-panel">
              <h3>常用材质</h3>
              <div className="lc-sample-grid">
                {materials.map((item, index) => (
                  <MaterialSample key={item} label={item} tone={index % 4} />
                ))}
              </div>
            </div>
            <div className="lc-card lc-sample-panel">
              <h3>常用工艺</h3>
              <div className="lc-chip-cloud">
                {crafts.map((item) => (
                  <InfoChip key={item}>{item}</InfoChip>
                ))}
              </div>
              <QrVisual />
            </div>
          </div>
        </div>
      </section>

      <section className="lc-section lc-section-soft" id="cases">
        <div className="lc-container">
          <SectionHeading kicker="Cases" title="高端包装摄影感的真实应用表达" desc="案例卡片围绕行业、材质、工艺与亮点组织，便于客户快速判断是否匹配自己的产品。" />
          <div className="lc-grid-3">
            {cases.map((item, index) => (
              <article className="lc-case-card lc-card" key={item.title}>
                <ProductVisual product={featuredProducts[index]} tone={index % 4} />
                <span>{item.industry}</span>
                <h3>{item.title}</h3>
                <p>{item.material}</p>
                <strong>{item.highlight}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lc-section" id="quality">
        <div className="lc-container lc-quality-layout">
          <div>
            <SectionHeading kicker="Quality Control" title="工厂实力与品控流程，支撑稳定交付" desc="从设备、色彩、打样到出货检测，保证批量标签的一致性和可追溯。" />
            <div className="lc-chip-cloud">
              {qualityItems.map((item) => (
                <InfoChip key={item}>{item}</InfoChip>
              ))}
            </div>
          </div>
          <div className="lc-card lc-process-panel">
            {cooperationSteps.map((item, index) => (
              <ProcessStep key={item} index={index + 1} title={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="lc-section lc-section-soft">
        <div className="lc-container lc-trust-layout">
          <SectionHeading kicker="Clients" title="被企业客户信任的稳定印刷服务" desc="合作关注点集中在稳定供货、沟通效率、品质可靠和问题响应。" />
          <div className="lc-testimonials">
            {testimonials.map((item, index) => (
              <article className="lc-card" key={item}>
                <span>客户评价 {index + 1}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lc-final-cta lc-container">
        <h2>准备定制您的标签印刷方案？</h2>
        <p>提交尺寸、材质、数量与工艺需求，我们将为您提供专业报价建议。</p>
        <div>
          <Link className="lc-button primary" to="/quote">
            立即获取报价
          </Link>
          <a className="lc-button ghost" href="#contact">
            联系客服咨询
          </a>
        </div>
      </section>
    </div>
  );
}
