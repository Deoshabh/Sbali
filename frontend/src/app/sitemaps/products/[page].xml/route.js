import {
  buildSitemapXml,
  getBaseUrl,
  getProductPage,
  PRODUCT_SITEMAP_PAGE_SIZE,
  xmlResponse,
} from '@/lib/sitemap';

export async function GET(_request, { params }) {
  const pageNumber = Number(params?.page || 1);
  if (!Number.isFinite(pageNumber) || pageNumber < 1) {
    return new Response('Invalid sitemap page', { status: 400 });
  }

  const baseUrl = getBaseUrl();
  const { products } = await getProductPage(pageNumber, PRODUCT_SITEMAP_PAGE_SIZE);

  const entries = (products || [])
    .filter((product) => product?.isActive && product?.slug)
    .map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return xmlResponse(buildSitemapXml(entries));
}
