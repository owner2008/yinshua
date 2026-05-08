import { toAssetUrl } from '../api';
import { productImageByCode } from '../brandContent';
import type { Product } from '../types';

export function HeroPrintingVisual() {
  return (
    <div className="lc-hero-visual" aria-hidden="true">
      <div className="lc-roll lc-roll-large" />
      <div className="lc-bottle">
        <div className="lc-bottle-label">
          <strong>食品饮料标签</strong>
          <span>PET / PP / 铜版纸</span>
        </div>
      </div>
      <div className="lc-label-stack">
        {['c', 'm', 'y', 'o', 'g'].map((tone) => (
          <span key={tone} className={`lc-label-strip tone-${tone}`} />
        ))}
      </div>
      <QrVisual />
      <div className="lc-cmyk-dots">
        <span className="c" />
        <span className="m" />
        <span className="y" />
        <span className="k" />
      </div>
    </div>
  );
}

export function ProductVisual({ product, tone = 0 }: { product?: Product; tone?: number }) {
  const imageUrl = product?.coverImage ?? (product?.code ? productImageByCode[product.code] : undefined);

  if (imageUrl) {
    return <ProductPhoto src={imageUrl} alt={product?.name ?? '标签印刷产品'} />;
  }

  return (
    <div className={`lc-product-visual tone-${tone}`} aria-hidden="true">
      <div className="lc-product-label">
        <span />
        <span />
        <span />
      </div>
      <div className="lc-product-roll" />
    </div>
  );
}

export function ProductPhoto({ src, alt }: { src: string; alt: string }) {
  return <img className="lc-product-visual image" src={toAssetUrl(src)} alt={alt} loading="lazy" referrerPolicy="no-referrer" />;
}

export function MaterialSample({ label, tone = 0 }: { label: string; tone?: number }) {
  return (
    <div className={`lc-material-sample tone-${tone}`}>
      <span>{label}</span>
    </div>
  );
}

export function QrVisual() {
  return (
    <div className="lc-qr">
      {Array.from({ length: 29 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
