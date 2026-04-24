import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCatalogProduct, toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';
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
      <div className="panel">
        <p>正在加载产品详情…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="panel">
        <p className="empty-copy">{error ?? '产品不存在'}</p>
        <Link to="/products">返回产品列表</Link>
      </div>
    );
  }

  const gallery = product.galleryJson ?? [];

  return (
    <div className="product-detail-view">
      <section className="panel product-hero">
        {product.coverImage ? (
          <img className="label-preview product-detail-cover" src={toAssetUrl(product.coverImage)} alt={product.name} />
        ) : (
          <div className="label-preview" aria-hidden="true">
            <span>{product.name}</span>
          </div>
        )}
        <div>
          <p className="eyebrow">{product.category?.name ?? '产品'}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="action-bar">
            <Link className="primary" to={`/quote?productId=${product.id}`}>
              在线报价
            </Link>
            <Link to="/products">返回列表</Link>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="panel">
          <div className="section-title">
            <h2>案例图集</h2>
            <span>{gallery.length} 张</span>
          </div>
          <div className="gallery">
            {gallery.map((src) => (
              <img key={src} src={toAssetUrl(src)} alt={product.name} loading="lazy" />
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="section-title">
          <h2>应用场景</h2>
        </div>
        <p>{product.applicationScenario ?? '支持按需配置规格和工艺组合。'}</p>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>报价模板</h2>
          <span>{(product.templates ?? []).length} 个</span>
        </div>
        {(product.templates ?? []).length === 0 ? (
          <p className="empty-copy">暂未配置报价模板。</p>
        ) : (
          <ul className="template-list">
            {(product.templates ?? []).map((template) => (
              <li key={template.id}>
                <strong>{template.templateName}</strong>
                <span>
                  宽 {String(template.widthMin)}- {String(template.widthMax)} 毫米 · 高 {String(template.heightMin)}-
                  {String(template.heightMax)} 毫米 · 数量 {template.quantityMin}-{template.quantityMax}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
