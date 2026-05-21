import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCatalogProduct, toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';
import type { Product } from '../types';

const productDetailFallbackImage = '/images/product-label-roll.jpg';

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
    return <StatusPage text="正在加载产品详情..." />;
  }

  if (error || !product) {
    return <StatusPage text={error ?? '产品不存在'} action={<Link to="/products">返回产品中心</Link>} />;
  }

  const gallery = product.galleryJson ?? [];

  return (
    <main className="subpage product-detail-page">
      <section className="product-detail-hero">
        <div className="product-detail-image">
          {product.coverImage ? (
            <img src={toAssetUrl(product.coverImage)} alt={product.name} />
          ) : (
            <img src={productDetailFallbackImage} alt={product.name} />
          )}
        </div>
        <div className="product-detail-copy">
          <p>{product.category?.name ?? '产品详情'}</p>
          <h1>{product.name}</h1>
          <span>{product.description ?? '适用于多行业包装、识别、追溯与品牌展示场景。'}</span>
          <div className="product-detail-actions">
            <Link className="subpage-primary-link" to="/contact">联系我们</Link>
            <Link to="/products">返回产品中心</Link>
          </div>
        </div>
      </section>

      <section className="subpage-section product-detail-info">
        <article>
          <h2>应用场景</h2>
          <p>{product.applicationScenario ?? '支持按需配置规格和工艺组合，适配产品包装、物流识别、防伪追溯等场景。'}</p>
        </article>
        <article>
          <h2>服务说明</h2>
          <p>支持按客户产品、材质、尺寸、工艺、贴标方式与包装要求进行定制生产，具体方案可联系工作人员确认。</p>
        </article>
        <article>
          <h2>工艺支持</h2>
          <p>可结合覆膜、烫金、局部 UV、模切、防伪、可变数据等工艺，满足不同品牌展示与使用环境要求。</p>
        </article>
      </section>

      {gallery.length > 0 ? (
        <section className="subpage-section">
          <div className="section-heading">
            <div>
              <h2>案例图库</h2>
              <p>{gallery.length} 张产品展示图片</p>
            </div>
          </div>
          <div className="subpage-card-grid three">
            {gallery.map((src) => (
              <img className="detail-gallery-image" key={src} src={toAssetUrl(src)} alt={product.name} loading="lazy" />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function StatusPage({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <main className="subpage">
      <section className="subpage-section">
        <div className="subpage-empty">
          {text}
          {action}
        </div>
      </section>
    </main>
  );
}
