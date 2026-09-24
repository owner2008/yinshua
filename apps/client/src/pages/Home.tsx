import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { brand } from '../brandContent';

const productTiles = [
  {
    title: '标签 / 卷标',
    desc: '各类材质标签定制印刷',
    icon: '◆',
    image: '/images/product-label-roll.jpg',
  },
  {
    title: '不干胶',
    desc: '不干胶贴纸多种工艺可选',
    icon: '▰',
    image: '/images/product-food-label-roll.jpg',
  },
  {
    title: '产品说明书',
    desc: '折页说明书精美印刷',
    icon: '▤',
    image: '/images/product-manual.jpg',
  },
  {
    title: '包装',
    desc: '礼盒、彩盒包装定制',
    icon: '◇',
    image: '/images/product-packaging-box.jpg',
  },
  {
    title: '宣传册',
    desc: '企业宣传册画册印刷',
    icon: '▥',
    image: '/images/product-brochure.jpg',
  },
  {
    title: '可变二维码',
    desc: '可变数据印刷二维码防伪',
    icon: '▦',
    image: '/images/company-qrcode.jpg',
  },
  {
    title: '一物一码标签',
    desc: '一物一码精准营销',
    icon: '▥',
    image: '/images/product-inner-liner.jpg',
  },
  {
    title: '可变二维码',
    desc: '可变数据印刷二维码防伪',
    icon: '◈',
    image: '/images/company-qrcode.jpg',
  },
] as const;

const featureItems = [
  ['先进设备', '精密印刷工艺', '▧'],
  ['品质稳定', '严格品控流程', '✦'],
  ['按需定制', '满足多样需求', '▢'],
] as const;

const applications = ['食品饮料', '日化美妆', '医药保健', '电子电器', '仓储物流', '商超零售'];

const advantages = [
  ['设备先进', '引进先进印刷设备，保障高品质输出'],
  ['工艺丰富', '覆膜、烫金、UV、模切等工艺灵活组合'],
  ['品质严格', '从材料到成品全流程品控'],
  ['交付准时', '科学排产，按约交付'],
] as const;

const caseImages = [
  '/images/case-food-packaging.jpg',
  '/images/case-cosmetic-packaging.jpg',
  '/images/case-equipment-catalog.jpg',
  '/images/case-tea-box.jpg',
] as const;

const factoryImages = [
  '/images/equipment-label-press.jpg',
  '/images/equipment-offset-press.jpg',
  '/images/factory-printing-line.jpg',
  '/images/equipment-finishing-line.jpg',
] as const;

export function HomePage() {
  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="corporate-home mobile-reference-home">
      <section className="reference-hero" aria-label="东方丽彩印刷首页宣传">
        <div className="reference-hero-copy">
          <h1>
            专业印刷
            <span>品质传递价值</span>
          </h1>
          <p>专注标签 · 包装 · 说明书 · 宣传册印刷</p>
          <div className="reference-hero-features">
            {featureItems.map(([title, desc, icon]) => (
              <article key={title}>
                <span aria-hidden="true">{icon}</span>
                <strong>{title}</strong>
                <small>{desc}</small>
              </article>
            ))}
          </div>
        </div>
        <div className="reference-hero-media">
          <img className="reference-hero-machine" src="/images/equipment-label-press.jpg" alt="标签印刷设备" />
          <div className="reference-hero-products" aria-label="标签包装产品展示">
            <img src="/images/product-label-roll.jpg" alt="标签卷标产品" />
            <img src="/images/product-manual.jpg" alt="产品说明书" />
            <img src="/images/product-packaging-box.jpg" alt="包装彩盒" />
          </div>
        </div>
        <div className="reference-hero-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <HomeSection id="products" className="reference-products" title="产品中心" subtitle="多种印刷产品与解决方案，满足不同行业需求">
        <div className="reference-product-grid">
          {productTiles.map((tile, index) => (
            <Link key={`${tile.title}-${index}`} to="/products" className="reference-product-card">
              <img src={tile.image} alt={tile.title} loading="lazy" />
              <span className="reference-product-icon" aria-hidden="true">
                {tile.icon}
              </span>
              <strong>{tile.title}</strong>
              <small>{tile.desc}</small>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection id="applications" title="行业应用" subtitle="覆盖食品、日化、医药、电子、物流等多场景">
        <div className="reference-chip-grid">
          {applications.map((name) => (
            <article key={name}>
              <span>{name.slice(0, 1)}</span>
              <strong>{name}</strong>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection id="advantages" title="企业优势" subtitle="以专业设备、稳定品质与响应速度服务客户">
        <div className="reference-advantage-grid">
          {advantages.map(([title, desc]) => (
            <article key={title}>
              <span>{title.slice(0, 1)}</span>
              <div>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection id="cases" title="产品案例" subtitle="多行业客户的品质之选">
        <div className="reference-case-grid">
          {caseImages.map((image, index) => (
            <article key={image}>
              <img src={image} alt={`产品案例 ${index + 1}`} loading="lazy" />
              <strong>{productTiles[index]?.title ?? '印刷案例'}</strong>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection id="factory" title="生产实力" subtitle="现代化设备与稳定产线，保障品质与交付">
        <div className="reference-case-grid">
          {factoryImages.map((image, index) => (
            <article key={image}>
              <img src={image} alt={`生产实力 ${index + 1}`} loading="lazy" />
              <strong>{['印刷设备', '数码设备', '制版车间', '检测设备'][index]}</strong>
            </article>
          ))}
        </div>
      </HomeSection>

      <section id="contact" className="reference-contact">
        <h2>联系我们</h2>
        <p>期待与您合作，共创美好未来</p>
        <div>
          <a href={`tel:${brand.mobile}`}>{brand.mobile}</a>
          <a href={`tel:${brand.phone.replace(/\D/g, '')}`}>{brand.phone}</a>
          {brand.emails.map((email) => <a key={email} href={`mailto:${email}`}>{email}</a>)}
          <span>{brand.address}</span>
        </div>
      </section>

      <nav className="reference-bottom-bar" aria-label="快捷操作">
        <button type="button" onClick={scrollToContact}>
          <span aria-hidden="true">☏</span>
          在线咨询
        </button>
        <Link to="/products">
          <span aria-hidden="true">▦</span>
          产品中心
        </Link>
        <a href={`tel:${brand.mobile}`}>
          <span aria-hidden="true">☎</span>
          拨打电话
        </a>
      </nav>
    </div>
  );
}

function HomeSection({
  id,
  title,
  subtitle,
  className,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`reference-section${className ? ` ${className}` : ''}`}>
      <div className="reference-section-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
