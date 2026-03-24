import { permanentRedirect } from 'next/navigation';

// Legacy path support: /category/:slug -> /categories/:slug
export default function LegacyCategorySlugPage({ params }) {
  permanentRedirect(`/categories/${encodeURIComponent(params.slug)}`);
}
