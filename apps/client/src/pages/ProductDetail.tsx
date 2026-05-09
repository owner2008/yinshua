import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCatalogProduct, toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';
import { InfoChip, SectionHeading } from '../components/cards';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { PageHero } from '../components/PageHero';
import { ProductVisual } from '../components/PrintingVisuals';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { id } = useParams();
  const { products } = useCatalog();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    fetchCatalogProduct(id)
      .then((data) => setProduct(data))
      .catch(() => {
        const fallback = products.find((item) => String(item.id) === id) ?? null;
        if (fallback) {
          setProduct(fallback);
        } else {
          setError('产品不存在或已下架');
        }
      })
      .finally(() => setLoading(false));
  }, [id, products]);

  if (loading) {
    return (
      <div className="lc-subpage">
        <H5PageChrome title="产品详情" subtitle="正在同步产品配置和报价模板" />
        <div className="lc-container">
          <div className="lc-empty-state lc-card">
            <h3>正在加载产品详情</h3>
            <p>正在同步产品配置和报价模板。</p>
          </div>
        </div>
        <H5TabBar />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="lc-subpage">
        <H5PageChrome title="产品详情" subtitle="当前产品暂时无法展示" />
        <div className="lc-container">
          <div className="lc-empty-state lc-card">
            <h3>{error ?? '产品不存在'}</h3>
            <p>可以返回产品中心查看其他标签印刷产品。</p>
            <Link className="lc-button primary" to="/products">
              返回产品列表
            </Link>
          </div>
        </div>
        <H5TabBar />
      </div>
    );
  }

  const gallery = product.galleryJson ?? [];
  const templates = product.templates ?? [];

  return (
    <div className="lc-subpage">
      <H5PageChrome title={product.name} subtitle={product.category?.name ?? '定制印刷产品详情'} />
      <PageHero
        kicker={product.category?.name ?? 'Product Detail'}
        title={product.name}
        desc={product.description ?? product.applicationScenario ?? '支持按尺寸、材质、数量和工艺进行定制报价。'}
      >
        <Link className="lc-button primary" to={`/quote?productId=${product.id}`}>
          按此产品报价
        </Link>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container lc-detail-layout">
          <div className="lc-card lc-detail-media">
            {product.coverImage ? (
              <img src={toAssetUrl(product.coverImage)} alt={product.name} loading="lazy" />
            ) : (
              <ProductVisual product={product} tone={1} />
            )}
          </div>
          <div className="lc-detail-copy">
            <SectionHeading kicker="Application" title="应用场景与定制重点" />
            <p>{product.applicationScenario ?? '适合多行业产品包装、品牌识别、防伪追溯和物流管理。'}</p>
            <div className="lc-chip-cloud">
              <InfoChip>支持定制尺寸</InfoChip>
              <InfoChip>多材质选择</InfoChip>
              <InfoChip>可打样确认</InfoChip>
              <InfoChip>批量稳定生产</InfoChip>
            </div>
            <div className="lc-detail-actions">
              <Link className="lc-button primary" to={`/quote?productId=${product.id}`}>
                在线报价
              </Link>
              <Link className="lc-button ghost" to="/products">
                返回产品中心
              </Link>
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 ? (
        <section className="lc-section lc-section-soft">
          <div className="lc-container">
            <SectionHeading kicker="Gallery" title="案例图集" desc={`${gallery.length} 张产品案例图片`} />
            <div className="lc-gallery-grid">
              {gallery.map((src) => (
                <img key={src} src={toAssetUrl(src)} alt={product.name} loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="lc-section lc-section-soft">
        <div className="lc-container">
          <SectionHeading kicker="Quote Templates" title="可用报价模板" desc="模板限定了可报价的尺寸、数量和工艺范围，实际价格以在线报价结果为准。" />
          {templates.length === 0 ? (
            <div className="lc-empty-state lc-card">
              <h3>暂未配置报价模板</h3>
              <p>可以提交定制需求，由客服根据产品参数人工确认报价。</p>
            </div>
          ) : (
            <div className="lc-grid-3">
              {templates.map((template) => (
                <article className="lc-card lc-template-card" key={template.id}>
                  <h3>{template.templateName}</h3>
                  <p>
                    宽 {String(template.widthMin)} - {String(template.widthMax)} mm / 高 {String(template.heightMin)} -{' '}
                    {String(template.heightMax)} mm
                  </p>
                  <strong>
                    数量 {template.quantityMin} - {template.quantityMax}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <H5TabBar />
    </div>
  );
}
