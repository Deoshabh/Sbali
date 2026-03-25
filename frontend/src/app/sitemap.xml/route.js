import {
  buildSitemapIndexXml,
  getBaseUrl,
  getProductSitemapPageCount,
  xmlResponse,
} from '@/lib/sitemap';

export async function GET() {
  const baseUrl = getBaseUrl();

  const indexEntries = [
    {
      url: `${baseUrl}/sitemaps/static.xml`,
      lastModified: new Date().toISOString(),
    },
  ];

  const productPages = await getProductSitemapPageCount();
  for (let page = 1; page <= productPages; page += 1) {
    indexEntries.push({
      url: `${baseUrl}/sitemaps/products/${page}.xml`,
      lastModified: new Date().toISOString(),
    });
  }

  return xmlResponse(buildSitemapIndexXml(indexEntries));
}
