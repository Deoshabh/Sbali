import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import { buildPageMetadata } from '@/utils/seoFetcher';

const FALLBACK = {
  title: 'Terms of Service',
  description: 'Read the Sbali terms of service. Understand the terms and conditions governing the use of our website and purchase of products.',
  url: 'https://sbali.in/terms',
  keywords: ['terms of service', 'terms and conditions', 'user agreement'],
};

export async function generateMetadata() {
  const adminMeta = await buildPageMetadata('terms', '/terms');
  return adminMeta || generateSEOMetadata(FALLBACK);
}

export default function TermsLayout({ children }) {
  return children;
}
