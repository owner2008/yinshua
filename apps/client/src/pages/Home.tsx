import { Link } from 'react-router-dom';
import { toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';
import type { CategoryEquipmentShowcase, CompanyProfile, HomepageBanner, Product } from '../types';

export function HomePage() {
  const { home, categories, products, loading } = useCatalog();
  const hotProducts = home?.hotProducts ?? products.filter((item) => item.isHot).slice(0, 4);
  const latestProducts =
    home?.latestProducts && home.latestProducts.length > 0 ? home.latestProducts.slice(0, 6) : products.slice(0, 6);
  const banners = home?.banners ?? [];
  const companyProfile = home?.companyProfile ?? null;
  const equipmentShowcases = home?.categoryEquipmentShowcases ?? [];
  const primaryBanner = banners[0];

  return (
    <div className="home-view">
      <HeroSection banner={primaryBanner} />

      {banners.length > 1 ? (
        <section className="panel">
          <div className="section-title">
            <h2>首页 Banner</h2>
            <span>{banners.length} 组展示内容</span>
          </div>
          <div className="banner-grid">
            {banners.slice(1).map((banner) => (
              <article key={banner.id} className="banner-card">
                <img src={toAssetUrl(banner.imageUrl)} alt={banner.title} loading="lazy" />
                <div className="banner-card-copy">
                  <strong>{banner.title}</strong>
                  <p>{banner.subtitle || '支持后台自定义文案与跳转配置。'}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="section-title">
          <h2>产品分类</h2>
          <Link to="/products">全部产品</Link>
        </div>
        <div className="chip-row">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.id}`} className="chip">
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {companyProfile ? <CompanyProfileSection profile={companyProfile} /> : null}

      {equipmentShowcases.length > 0 ? (
        <section className="panel">
          <div className="section-title">
            <h2>分类设备展示</h2>
            <span>{equipmentShowcases.length} 台设备能力</span>
          </div>
          <div className="showcase-grid">
            {equipmentShowcases.map((item) => (
              <article key={item.id} className="showcase-card">
                {item.imageUrl ? (
                  <img className="showcase-image" src={toAssetUrl(item.imageUrl)} alt={item.name} loading="lazy" />
                ) : (
                  <div className="showcase-image showcase-placeholder" aria-hidden="true" />
                )}
                <div className="showcase-copy">
                  <div className="showcase-meta">
                    <span>{item.category?.name ?? '设备展示'}</span>
                    <strong>{item.title || item.name}</strong>
                  </div>
                  <p>{item.description || '支持后台配置设备介绍、主图、图集与参数说明。'}</p>
                  <SpecList showcase={item} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="section-title">
          <h2>热门产品</h2>
          <span>{loading ? '加载中…' : `${hotProducts.length} 款`}</span>
        </div>
        <ProductGrid products={hotProducts} />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>最新上架</h2>
          <Link to="/products">查看全部</Link>
        </div>
        <ProductGrid products={latestProducts} />
      </section>
    </div>
  );
}

function HeroSection({ banner }: { banner?: HomepageBanner }) {
  const style = banner?.imageUrl
    ? {
        backgroundImage: `linear-gradient(130deg, rgba(8, 32, 46, 0.82), rgba(22, 94, 124, 0.52)), url("${toAssetUrl(
          banner.imageUrl,
        )}")`,
      }
    : undefined;

  return (
    <section className="hero panel hero-rich" style={style}>
      <div className="hero-copy">
        <p className="eyebrow">首页头部内容已支持后台配置</p>
        <h1>{banner?.title ?? '参数化在线报价与印刷内容展示'}</h1>
        <p>
          {banner?.subtitle ??
            '首页 Banner、企业介绍与分类设备展示都已经接入动态数据，前台可以直接展示后台配置的图片与文本。'}
        </p>
        <div className="action-bar">
          <BannerAction banner={banner} />
          <Link to="/quote">直接报价</Link>
        </div>
      </div>
      <div className="hero-side">
        <div className="hero-stat">
          <strong>Banner</strong>
          <span>图片、标题、副标题、跳转按钮均支持后台维护</span>
        </div>
        <div className="hero-stat">
          <strong>企业介绍</strong>
          <span>封面图、图集、正文、联系方式与地址同步展示</span>
        </div>
        <div className="hero-stat">
          <strong>设备展示</strong>
          <span>按分类展示设备主图、说明和参数卡片</span>
        </div>
      </div>
    </section>
  );
}

function CompanyProfileSection({ profile }: { profile: CompanyProfile }) {
  const gallery = profile.galleryJson ?? [];

  return (
    <section className="panel company-section">
      <div className="section-title">
        <h2>{profile.title}</h2>
        <span>{profile.subtitle || '企业介绍'}</span>
      </div>
      <div className="company-layout">
        <div className="company-visual">
          {profile.coverImage ? (
            <img src={toAssetUrl(profile.coverImage)} alt={profile.title} className="company-cover" loading="lazy" />
          ) : (
            <div className="company-cover company-cover-fallback" aria-hidden="true" />
          )}
          {gallery.length > 0 ? (
            <div className="company-gallery">
              {gallery.slice(0, 3).map((src) => (
                <img key={src} src={toAssetUrl(src)} alt={profile.title} loading="lazy" />
              ))}
            </div>
          ) : null}
        </div>
        <div className="company-copy">
          <p className="company-subtitle">{profile.subtitle || '支持后台图文编辑'}</p>
          <p>{profile.content || '企业介绍内容可通过后台配置后自动同步到首页。'}</p>
          <div className="company-contact">
            {profile.contactPhone ? <span>电话：{profile.contactPhone}</span> : null}
            {profile.contactWechat ? <span>微信：{profile.contactWechat}</span> : null}
            {profile.address ? <span>地址：{profile.address}</span> : null}
          </div>
        </div>
      </div>
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
      {entries.slice(0, 4).map(([key, value]) => (
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
          <div className="product-card">
            <ProductThumb product={product} tone={index % 3} />
            <strong>{product.name}</strong>
            <small>{product.applicationScenario ?? '可按需定制'}</small>
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
  const label = banner?.buttonText ?? '浏览产品';

  if (/^https?:\/\//i.test(href)) {
    return (
      <a className="primary" href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link className="primary" to={href}>
      {label}
    </Link>
  );
}
