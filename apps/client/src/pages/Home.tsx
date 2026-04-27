import { Link } from 'react-router-dom';
import { toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';
import type { CategoryEquipmentShowcase, CompanyProfile, HomepageBanner, Product, ProductCategory } from '../types';

const MATERIALS = ['铜版纸', 'PET / 透明膜', 'PVC / 合成纸', '热敏纸', '亮银 / 哑银', '可移胶'];
const PROCESSES = ['覆膜', '模切', '烫金', '局部 UV', '白墨打底', '可变数据'];
const SERVICE_STEPS = [
  ['01', '选择产品', '按应用场景或材料类型找到合适标签。'],
  ['02', '填写参数', '输入尺寸、数量、材料、工艺与贴标要求。'],
  ['03', '确认样稿', '上传设计文件，确认电子样或实物样。'],
  ['04', '生产交付', '按交期生产、分卷包装并发货。'],
];

export function HomePage() {
  const { home, categories, products, loading } = useCatalog();
  const hotProducts = home?.hotProducts ?? products.filter((item) => item.isHot).slice(0, 4);
  const latestProducts =
    home?.latestProducts && home.latestProducts.length > 0 ? home.latestProducts.slice(0, 6) : products.slice(0, 6);
  const banners = home?.banners ?? [];
  const companyProfile = home?.companyProfile ?? null;
  const equipmentShowcases = home?.categoryEquipmentShowcases ?? [];
  const primaryBanner = banners[0];
  const featuredCategories = categories.slice(0, 8);

  return (
    <div className="home-view home-redesign">
      <HeroSection banner={primaryBanner} categoryCount={categories.length} productCount={products.length} />
      <QuickCategorySection categories={featuredCategories} />
      <FeaturedProductsSection loading={loading} products={hotProducts.length > 0 ? hotProducts : latestProducts.slice(0, 4)} />
      <QuickQuoteSection categories={featuredCategories} />
      <MaterialProcessSection />
      <TrustSection profile={companyProfile} showcases={equipmentShowcases} />
      {banners.length > 1 ? <CampaignSection banners={banners.slice(1, 4)} /> : null}
      <LatestProductsSection products={latestProducts} loading={loading} />
    </div>
  );
}

function HeroSection({
  banner,
  categoryCount,
  productCount,
}: {
  banner?: HomepageBanner;
  categoryCount: number;
  productCount: number;
}) {
  const style = banner?.imageUrl
    ? {
        backgroundImage: `var(--hero-banner-overlay), url("${toAssetUrl(banner.imageUrl)}")`,
      }
    : undefined;

  return (
    <section className="home-hero panel" style={style}>
      <div className="home-hero-copy">
        <p className="eyebrow">Label Printing</p>
        <h1>{banner?.title ?? '不干胶标签印刷，从产品展示到在线报价一步到位'}</h1>
        <p className="home-hero-desc">
          {banner?.subtitle ??
            '支持铜版纸、PET、PVC、热敏纸等常用材料，覆盖覆膜、模切、烫金、白墨与可变数据等工艺，适合食品、日化、物流、电子与医药标签。'}
        </p>
        <div className="action-bar">
          <Link className="primary" to="/quote">
            立即报价
          </Link>
          <BannerAction banner={banner} />
        </div>
        <div className="home-hero-points">
          <span>低起订量</span>
          <span>支持打样</span>
          <span>卷装 / 张装</span>
          <span>多工艺组合</span>
        </div>
      </div>
      <aside className="home-quote-card" aria-label="快速报价入口">
        <span className="card-tag">Quick Quote</span>
        <strong>先算一个大概价格</strong>
        <p>选择产品、填写尺寸和数量后，系统会按后台规则返回报价明细。</p>
        <div className="quote-mini-grid">
          <div>
            <span>产品分类</span>
            <strong>{categoryCount || 0}</strong>
          </div>
          <div>
            <span>可选产品</span>
            <strong>{productCount || 0}</strong>
          </div>
        </div>
        <Link to="/quote" className="quote-card-action">
          开始填写参数
        </Link>
      </aside>
    </section>
  );
}

function QuickCategorySection({ categories }: { categories: ProductCategory[] }) {
  return (
    <section className="panel home-section compact-section">
      <div className="section-title">
        <div>
          <p className="section-kicker">Product Types</p>
          <h2>按标签类型快速进入</h2>
        </div>
        <Link to="/products">全部产品</Link>
      </div>
      <div className="category-strip">
        {categories.map((category, index) => (
          <Link key={category.id} to={`/products?category=${category.id}`} className="category-entry">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{category.name}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedProductsSection({ products, loading }: { products: Product[]; loading: boolean }) {
  return (
    <section className="panel home-section">
      <div className="section-title">
        <div>
          <p className="section-kicker">Popular Labels</p>
          <h2>常用产品与应用</h2>
        </div>
        <span>{loading ? '加载中...' : `${products.length} 款推荐`}</span>
      </div>
      <div className="feature-product-grid">
        {products.slice(0, 4).map((product, index) => (
          <article key={product.id} className="feature-product-card">
            <ProductThumb product={product} tone={index % 3} />
            <div>
              <strong>{product.name}</strong>
              <p>{product.applicationScenario ?? product.description ?? '适合多行业产品包装、识别与物流场景。'}</p>
            </div>
            <div className="feature-actions">
              <Link to={`/products/${product.id}`}>看详情</Link>
              <Link className="primary" to={`/quote?productId=${product.id}`}>
                按此报价
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function QuickQuoteSection({ categories }: { categories: ProductCategory[] }) {
  const firstCategory = categories[0];

  return (
    <section className="quick-quote-band panel">
      <div>
        <p className="section-kicker">Instant Quote</p>
        <h2>已有尺寸和数量？直接进入在线报价</h2>
        <p>常规报价先填写产品、尺寸、数量、材料、印刷和工艺；卷标或自动贴标需求可在备注中补充出标方向、卷芯和每卷数量。</p>
      </div>
      <div className="quote-shortcuts">
        {firstCategory ? <Link to={`/products?category=${firstCategory.id}`}>先看{firstCategory.name}</Link> : null}
        <Link className="primary" to="/quote">
          打开报价系统
        </Link>
      </div>
    </section>
  );
}

function MaterialProcessSection() {
  return (
    <section className="material-process-grid">
      <InfoPanel title="材料选择" kicker="Materials" items={MATERIALS} />
      <InfoPanel title="工艺能力" kicker="Finishing" items={PROCESSES} />
      <section className="panel home-section service-panel">
        <div className="section-title">
          <div>
            <p className="section-kicker">Workflow</p>
            <h2>服务流程</h2>
          </div>
        </div>
        <div className="service-steps">
          {SERVICE_STEPS.map(([index, title, desc]) => (
            <article key={index}>
              <span>{index}</span>
              <strong>{title}</strong>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function InfoPanel({ title, kicker, items }: { title: string; kicker: string; items: string[] }) {
  return (
    <section className="panel home-section info-panel">
      <div className="section-title">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="capability-list">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function TrustSection({
  profile,
  showcases,
}: {
  profile: CompanyProfile | null;
  showcases: CategoryEquipmentShowcase[];
}) {
  if (!profile && showcases.length === 0) {
    return null;
  }

  const firstShowcase = showcases[0];

  return (
    <section className="trust-layout">
      {profile ? <CompanyProfileSection profile={profile} /> : null}
      {firstShowcase ? <EquipmentSummary item={firstShowcase} count={showcases.length} /> : null}
    </section>
  );
}

function CompanyProfileSection({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="panel home-section company-summary">
      <div className="section-title">
        <div>
          <p className="section-kicker">Company</p>
          <h2>{profile.title}</h2>
        </div>
      </div>
      <div className="company-summary-body">
        {profile.coverImage ? <img src={toAssetUrl(profile.coverImage)} alt={profile.title} loading="lazy" /> : null}
        <div>
          <p>{profile.content || profile.subtitle || '支持后台维护企业介绍、生产能力、联系方式与图集。'}</p>
          <div className="company-contact compact-contact">
            {profile.contactPhone ? <span>电话：{profile.contactPhone}</span> : null}
            {profile.contactWechat ? <span>微信：{profile.contactWechat}</span> : null}
            {profile.address ? <span>地址：{profile.address}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function EquipmentSummary({ item, count }: { item: CategoryEquipmentShowcase; count: number }) {
  return (
    <section className="panel home-section equipment-summary">
      <div className="section-title">
        <div>
          <p className="section-kicker">Production</p>
          <h2>设备与产能</h2>
        </div>
        <span>{count} 项能力</span>
      </div>
      {item.imageUrl ? <img src={toAssetUrl(item.imageUrl)} alt={item.name} loading="lazy" /> : null}
      <strong>{item.title || item.name}</strong>
      <p>{item.description || '支持按分类展示设备、主图、参数与生产能力说明。'}</p>
      <SpecList showcase={item} />
    </section>
  );
}

function CampaignSection({ banners }: { banners: HomepageBanner[] }) {
  return (
    <section className="panel home-section compact-section">
      <div className="section-title">
        <div>
          <p className="section-kicker">Campaigns</p>
          <h2>更多推荐</h2>
        </div>
      </div>
      <div className="campaign-row">
        {banners.map((banner) => (
          <CampaignLink key={banner.id} banner={banner} />
        ))}
      </div>
    </section>
  );
}

function CampaignLink({ banner }: { banner: HomepageBanner }) {
  const href = resolveBannerLink(banner);
  const content = (
    <>
      <img src={toAssetUrl(banner.imageUrl)} alt={banner.title} loading="lazy" />
      <strong>{banner.title}</strong>
      <span>{banner.subtitle || '查看相关产品与服务'}</span>
    </>
  );

  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} className="campaign-card" target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className="campaign-card">
      {content}
    </Link>
  );
}

function LatestProductsSection({ products, loading }: { products: Product[]; loading: boolean }) {
  return (
    <section className="panel home-section compact-section">
      <div className="section-title">
        <div>
          <p className="section-kicker">New Arrivals</p>
          <h2>最新上架</h2>
        </div>
        <span>{loading ? '加载中...' : `${products.length} 款`}</span>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

function SpecList({ showcase }: { showcase: CategoryEquipmentShowcase }) {
  const entries = Object.entries(showcase.specsJson ?? {}).filter(([, value]) => value !== null && value !== '');

  if (entries.length === 0) {
    return null;
  }

  return (
    <dl className="spec-list">
      {entries.slice(0, 3).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="empty-copy">暂无产品</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <Link key={product.id} to={`/products/${product.id}`} className="product-card-link">
          <div className="product-card product-card-vertical">
            <ProductThumb product={product} tone={index % 3} />
            <strong>{product.name}</strong>
            <small>{product.applicationScenario ?? '支持按需定制'}</small>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProductThumb({ product, tone }: { product: Product; tone: number }) {
  if (product.coverImage) {
    return <img className="product-image product-cover" src={toAssetUrl(product.coverImage)} alt={product.name} loading="lazy" />;
  }

  return <span className={`product-image tone-${tone}`} />;
}

function resolveBannerLink(banner?: HomepageBanner) {
  if (!banner?.linkType || banner.linkType === 'none') {
    return '/products';
  }
  if (banner.linkType === 'product' && banner.linkValue) {
    return `/products/${banner.linkValue}`;
  }
  if (banner.linkType === 'category' && banner.linkValue) {
    return `/products?category=${banner.linkValue}`;
  }
  if (banner.linkType === 'custom' && banner.linkValue) {
    return banner.linkValue;
  }
  return '/products';
}

function BannerAction({ banner }: { banner?: HomepageBanner }) {
  const href = resolveBannerLink(banner);
  const label = banner?.buttonText ?? '查看产品';

  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return <Link to={href}>{label}</Link>;
}
