const SITE_URL = 'https://sbali.in';
const API_BASE = 'https://sbali.in/api/v1';

async function fetchJson(url) {
  const res = await globalThis.fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

function pickArray(payload, keys) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (payload.data && typeof payload.data === 'object') {
    for (const key of keys) {
      if (Array.isArray(payload.data[key])) return payload.data[key];
    }
    if (Array.isArray(payload.data)) return payload.data;
  }

  return [];
}

export default async function sitemap() {
  const [productsPayload, categoriesPayload] = await Promise.all([
    fetchJson(`${API_BASE}/products`),
    fetchJson(`${API_BASE}/categories`)
  ]);

  const products = pickArray(productsPayload, ['products', 'items']);
  const categories = pickArray(categoriesPayload, ['categories', 'items']);

  const now = new Date();

  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    }
  ];

  const productRoutes = products
    .filter((product) => product?.slug)
    .map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.7
    }));

  const categoryRoutes = categories
    .filter((category) => category?.slug)
    .map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
