'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productAPI } from '@/utils/api';

const normalizeCategoryImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Canonicalize legacy CDN paths used by older uploads.
  if (trimmed.includes('https://cdn.sbali.in/product-media/')) {
    return trimmed.replace('https://cdn.sbali.in/product-media/', 'https://cdn.sbali.in/sbali-products/');
  }

  return trimmed;
};

const getAlternateCategoryImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (url.includes('https://cdn.sbali.in/product-media/')) {
    return url.replace('https://cdn.sbali.in/product-media/', 'https://cdn.sbali.in/sbali-products/');
  }
  if (url.includes('https://cdn.sbali.in/sbali-products/')) {
    return url.replace('https://cdn.sbali.in/sbali-products/', 'https://cdn.sbali.in/product-media/');
  }
  return null;
};

const getCategoryName = (category) => {
  if (typeof category?.name === 'string' && category.name.trim()) {
    return category.name.trim();
  }
  return 'Category';
};

const getCategoryKey = (category, index) => category?._id || category?.slug || `category-${index}`;

export default function CategoriesClient({ categories: initialCategories = [] }) {
  const [categories] = useState(initialCategories);
  const [categoryStats, setCategoryStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (categories.length === 0) return;
    fetchStats();
  }, [categories]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const stats = {};
      await Promise.all(
        categories.map(async (category, index) => {
          try {
            const productsResponse = await productAPI.getAllProducts({ category: category.slug, limit: 0 });
            const statsKey = getCategoryKey(category, index);
            stats[statsKey] = productsResponse.data?.totalProducts
              ?? (Array.isArray(productsResponse.data) ? productsResponse.data : productsResponse.data?.products || []).length;
          } catch {
            const statsKey = getCategoryKey(category, index);
            stats[statsKey] = 0;
          }
        })
      );
      setCategoryStats(stats);
    } finally {
      setStatsLoading(false);
    }
  };

  const isFeatured = categories.length === 1;

  if (categories.length === 0) {
    return (
      <div className="text-center py-20">
        <p style={{
          fontFamily: "var(--font-playfair, 'Cormorant Garamond', serif)",
          fontSize: '1.3rem',
          color: '#8A7E74',
        }}>
          No categories available at the moment.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Categories Grid */}
      <div
        className="grid gap-6 lg:gap-8"
        style={{
          gridTemplateColumns: isFeatured
            ? '1fr'
            : categories.length <= 3
              ? 'repeat(auto-fit, minmax(320px, 1fr))'
              : 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {categories.map((category, index) => {
          const isFirstFeatured = index === 0 && categories.length <= 3;
          const categoryName = getCategoryName(category);
          const categoryImage = normalizeCategoryImageUrl(category?.image?.url);
          const statsKey = getCategoryKey(category, index);
          return (
            <Link
              key={getCategoryKey(category, index)}
              href={`/products?category=${encodeURIComponent(category.slug || '')}`}
              className="group block text-left overflow-hidden transition-shadow duration-300"
              style={{
                background: '#FFFFFF',
                ...(isFirstFeatured && !isFeatured ? { gridColumn: 'span 2' } : {}),
                ...(isFeatured ? { maxWidth: '800px' } : {}),
              }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  aspectRatio: isFirstFeatured ? '16/7' : '4/3',
                  background: '#F0EBE1',
                }}
              >
                {categoryImage ? (
                  <img
                    src={categoryImage}
                    alt={categoryName}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.dataset.fallbackApplied === '1') {
                        img.style.display = 'none';
                        return;
                      }
                      const fallback = getAlternateCategoryImageUrl(img.currentSrc || img.src);
                      if (fallback) {
                        img.dataset.fallbackApplied = '1';
                        img.src = fallback;
                      } else {
                        img.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      style={{
                        fontFamily: "var(--font-playfair, 'Cormorant Garamond', serif)",
                        fontSize: '3rem',
                        fontWeight: 300,
                        color: '#B8973A',
                        opacity: 0.5,
                      }}
                    >
                      {categoryName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div
                  className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(to top, rgba(26,23,20,0.25) 0%, transparent 60%)' }}
                />
              </div>

              <div className="p-6">
                <h3
                  style={{
                    fontFamily: "var(--font-playfair, 'Cormorant Garamond', serif)",
                    fontSize: isFirstFeatured ? '1.4rem' : '1.15rem',
                    fontWeight: 500,
                    color: '#1A1714',
                    marginBottom: '6px',
                  }}
                >
                  {category.name}
                </h3>
                {category.description && (
                  <p
                    className="line-clamp-2"
                    style={{
                      fontFamily: "var(--font-inter, 'DM Sans', sans-serif)",
                      fontSize: '13px',
                      color: '#6B6560',
                      lineHeight: 1.6,
                      marginBottom: '12px',
                    }}
                  >
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #E5E2DC' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#B8973A' }} />
                    <p
                      style={{
                        fontFamily: "var(--font-dm-mono, 'Space Mono', monospace)",
                        fontSize: '11px',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6B6560',
                      }}
                    >
                        {statsLoading ? '...' : (categoryStats[statsKey] || 0)} Products
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 flex items-center justify-center transition-colors duration-200"
                    style={{ background: '#F0EBE1' }}
                  >
                    <span
                      className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
                      style={{ color: '#1A1714', fontSize: '16px' }}
                    >
                      {'\u2192'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {categories.length > 0 && categories.length < 4 && (
        <div className="mt-16 text-center">
          <p style={{
            fontFamily: "var(--font-cormorant, 'Libre Baskerville', serif)",
            fontSize: '1rem',
            fontStyle: 'italic',
            color: '#A09890',
          }}>
            More categories coming soon
          </p>
        </div>
      )}
    </>
  );
}
