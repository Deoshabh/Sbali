import { SITE_URL } from '@/lib/constants';
import { getApiUrl } from '@/utils/getApiUrl';

export const PRODUCT_SITEMAP_PAGE_SIZE = 500;
export const MAX_SITEMAP_PRODUCT_PAGES = 200;

const nowIso = () => new Date().toISOString();

export function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getBaseUrl() {
  return SITE_URL.replace(/\/$/, '');
}

export function getApiBaseUrl() {
  return getApiUrl().replace(/\/$/, '');
}

export function buildSitemapXml(entries) {
  const body = entries
    .map((entry) => {
      const loc = `<loc>${xmlEscape(entry.url)}</loc>`;
      const lastMod = entry.lastModified ? `<lastmod>${xmlEscape(entry.lastModified)}</lastmod>` : '';
      const changeFreq = entry.changeFrequency ? `<changefreq>${xmlEscape(entry.changeFrequency)}</changefreq>` : '';
      const priority = typeof entry.priority === 'number' ? `<priority>${entry.priority.toFixed(1)}</priority>` : '';
      return `<url>${loc}${lastMod}${changeFreq}${priority}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function buildSitemapIndexXml(entries) {
  const body = entries
    .map((entry) => {
      const loc = `<loc>${xmlEscape(entry.url)}</loc>`;
      const lastMod = entry.lastModified ? `<lastmod>${xmlEscape(entry.lastModified)}</lastmod>` : '';
      return `<sitemap>${loc}${lastMod}</sitemap>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export async function fetchJson(url, revalidateSeconds = 3600) {
  const response = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!response.ok) return null;
  return response.json();
}

export async function getProductPage(page, limit = PRODUCT_SITEMAP_PAGE_SIZE) {
  const apiBase = getApiBaseUrl();
  const payload = await fetchJson(`${apiBase}/products?page=${page}&limit=${limit}`, 3600);
  if (!payload) return { products: [], pagination: null };

  const products = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.products)
      ? payload.products
      : Array.isArray(payload?.data?.products)
        ? payload.data.products
        : [];

  const pagination = payload.pagination || payload?.data?.pagination || null;
  return { products, pagination };
}

export async function getProductSitemapPageCount() {
  const firstPage = await getProductPage(1, PRODUCT_SITEMAP_PAGE_SIZE);
  if (!firstPage.products.length) return 0;

  const explicitTotalPages = Number(firstPage?.pagination?.pages || 0);
  if (explicitTotalPages > 0) {
    return Math.min(explicitTotalPages, MAX_SITEMAP_PRODUCT_PAGES);
  }

  return 1;
}

export function getStaticPages(baseUrl = getBaseUrl()) {
  return [
    { url: baseUrl, changeFrequency: 'daily', priority: 1.0, lastModified: nowIso() },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9, lastModified: nowIso() },
    { url: `${baseUrl}/categories`, changeFrequency: 'weekly', priority: 0.8, lastModified: nowIso() },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.6, lastModified: nowIso() },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.6, lastModified: nowIso() },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.5, lastModified: nowIso() },
    { url: `${baseUrl}/shipping`, changeFrequency: 'monthly', priority: 0.4, lastModified: nowIso() },
    { url: `${baseUrl}/returns`, changeFrequency: 'monthly', priority: 0.4, lastModified: nowIso() },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3, lastModified: nowIso() },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.3, lastModified: nowIso() },
  ];
}

export async function getCategoryUrls(baseUrl = getBaseUrl()) {
  const apiBase = getApiBaseUrl();
  const payload = await fetchJson(`${apiBase}/categories`, 86400);
  const categories = Array.isArray(payload)
    ? payload
    : payload?.categories || payload?.data?.categories || [];

  if (!Array.isArray(categories)) return [];

  const seen = new Set();
  const urls = [];

  for (const category of categories) {
    const slug = typeof category === 'string' ? category : category?.slug;
    if (!slug) continue;

    const url = `${baseUrl}/categories/${encodeURIComponent(slug)}`;
    if (seen.has(url)) continue;
    seen.add(url);

    urls.push({
      url,
      lastModified: category?.updatedAt || nowIso(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return urls;
}

export function xmlResponse(xml) {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
