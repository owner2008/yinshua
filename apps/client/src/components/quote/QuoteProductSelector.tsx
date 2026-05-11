import type { RefObject } from 'react';
import { useI18n } from '../../i18n';
import type { Product } from '../../types';
import { ProductVisual } from '../PrintingVisuals';

interface QuoteProductSelectorProps {
  products: Product[];
  selectedProductId: number;
  listRef: RefObject<HTMLElement | null>;
  onSelect: (product: Product) => void;
}

export function QuoteProductSelector({ products, selectedProductId, listRef, onSelect }: QuoteProductSelectorProps) {
  const { t, text } = useI18n();

  return (
    <aside className="lc-product-selector" ref={listRef}>
      {products.map((product, index) => (
        <button
          key={product.id}
          data-product-id={String(product.id)}
          className={Number(product.id) === selectedProductId ? 'active' : ''}
          onClick={() => onSelect(product)}
          type="button"
        >
          <ProductVisual product={product} tone={index % 4} />
          <strong>{text(product.name)}</strong>
          <small>{text(product.applicationScenario) || text(product.description) || t('products.card.descFallback')}</small>
        </button>
      ))}
    </aside>
  );
}
