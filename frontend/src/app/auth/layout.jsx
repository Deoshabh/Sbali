import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Sign In',
  description: 'Sign in to your Sbali account to manage orders, track deliveries, and access exclusive features.',
  url: 'https://sbali.in/auth/firebase-login',
  noindex: true,
  nofollow: true,
});

export default function AuthLayout({ children }) {
  return children;
}
