import { JsonLd, generateWebsiteJsonLd, generateOrganizationJsonLd, generateLocalBusinessJsonLd, generateMetadata as generateSEOMetadata } from '@/utils/seo';
import { buildPageMetadata } from '@/utils/seoFetcher';
import SbaliHome from '@/components/storefront/SbaliHome';

const FALLBACK = {
  title: 'Sbali | Genuine Leather Shoes and Goods from Agra, India',
  description: 'Shop handcrafted genuine leather shoes, bags, wallets, belts, and sandals from Sbali. Agra craftsmanship for Indian and international buyers.',
  keywords: [
    'genuine leather shoes india',
    'handcrafted leather goods',
    'Agra leather brand',
    'leather bags wallets belts india',
    'premium leather footwear india',
  ],
  url: 'https://sbali.in',
};

export async function generateMetadata() {
  const adminMeta = await buildPageMetadata('home', '/');
  return adminMeta || generateSEOMetadata(FALLBACK);
}

export default function Home() {
  return (
    <>
      <JsonLd data={generateWebsiteJsonLd()} />
      <JsonLd data={generateOrganizationJsonLd()} />
      <JsonLd data={generateLocalBusinessJsonLd()} />

      <SbaliHome />
    </>
  );
}
