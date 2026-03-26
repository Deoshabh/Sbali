import { cache } from 'react';
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import { generateProductMetadata } from '@/utils/seo';
import { getApiUrl } from '@/utils/getApiUrl';

const getProduct = cache(async function getProduct(slug) {
  try {
    const res = await fetch(`${getApiUrl()}/products/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every 1 hour
    });

    if (res.status === 404) {
      return { product: null, notFound: true };
    }

    if (!res.ok) {
      console.error(`[ProductSSR] Failed to fetch: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error(`[ProductSSR] Response: ${text}`);
      return { product: null, notFound: false };
    }

    const data = await res.json();
    return { product: data?.product || data?.data || data || null, notFound: false };
  } catch (error) {
    console.error('[ProductSSR] Fetch Error:', error);
    return { product: null, notFound: false };
  }
});

export async function generateMetadata({ params }) {
  const { product, notFound } = await getProduct(params.slug);

  if (notFound) {
    return {
      title: 'Product Not Found | Sbali',
      robots: { index: false },
    };
  }

  if (!product) {
    return {
      title: 'Product | Sbali',
      description: 'Premium handcrafted genuine leather products by Sbali.',
    };
  }

  return generateProductMetadata(product);
}

import { JsonLd, generateProductJsonLd, generateBreadcrumbJsonLd } from '@/utils/seo';

export default async function ProductPage({ params }) {
  const { product, notFound } = await getProduct(params.slug);

  if (notFound || !product) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
      <JsonLd data={generateProductJsonLd(product)} />
      <ProductClient product={product} />
    </>
  );
}
