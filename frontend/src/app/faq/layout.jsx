import { generateMetadata as generateSEOMetadata, JsonLd, generateBreadcrumbJsonLd } from '@/utils/seo';
import { buildPageMetadata } from '@/utils/seoFetcher';

const DEFAULT_FAQ_ENTITIES = [
  {
    '@type': 'Question',
    name: 'Do you deliver Sbali products across India?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes, Sbali delivers genuine leather shoes and goods across India with secure shipping options.',
    },
  },
  {
    '@type': 'Question',
    name: 'Do you offer international shipping?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes, Sbali ships to selected international locations. Shipping timelines and charges vary by country.',
    },
  },
  {
    '@type': 'Question',
    name: 'Are Sbali products made from genuine leather?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes, Sbali products are handcrafted using genuine leather in Agra, India.',
    },
  },
  {
    '@type': 'Question',
    name: 'What is your return policy?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Returns are accepted within the policy period if items are unused and in original condition. Visit the returns page for details.',
    },
  },
  {
    '@type': 'Question',
    name: 'How should I care for my leather shoes?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Wipe with a soft cloth, condition regularly, avoid direct moisture, and store in a cool dry place.',
    },
  },
];

const FALLBACK = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Sbali — orders, shipping, returns, sizing, product care and more.',
  url: 'https://sbali.in/faq',
  keywords: ['FAQ', 'frequently asked questions', 'shoe sizing help', 'shipping questions', 'returns policy'],
};

export async function generateMetadata() {
  const adminMeta = await buildPageMetadata('faq', '/faq');
  return adminMeta || generateSEOMetadata(FALLBACK);
}

export default function FaqLayout({ children }) {
  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: DEFAULT_FAQ_ENTITIES,
        }}
      />
      {children}
    </>
  );
}
