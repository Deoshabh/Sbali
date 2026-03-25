import {
  buildSitemapXml,
  getBaseUrl,
  getCategoryUrls,
  getStaticPages,
  xmlResponse,
} from '@/lib/sitemap';

export async function GET() {
  const baseUrl = getBaseUrl();
  const staticPages = getStaticPages(baseUrl);
  const categoryUrls = await getCategoryUrls(baseUrl);

  return xmlResponse(buildSitemapXml([...staticPages, ...categoryUrls]));
}
