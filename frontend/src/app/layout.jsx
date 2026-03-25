import { Plus_Jakarta_Sans, Lora, Libre_Baskerville, Space_Mono, Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import AnnouncementBar from '@/components/AnnouncementBar';
import MaintenanceModeGate from '@/components/MaintenanceModeGate';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#8B4513',
};

export const metadata = generateSEOMetadata({
  title: 'Sbali - Handcrafted Genuine Leather Shoes and Goods',
  description: 'Discover handcrafted genuine leather shoes, bags, wallets, belts, and sandals by Sbali from Agra, India.',
  keywords: ['genuine leather', 'handcrafted leather shoes', 'leather goods india', 'Agra leather', 'leather bags', 'leather wallets', 'leather belts'],
});

import QueryProvider from '@/providers/QueryProvider';

// ...

export default async function RootLayout({ children }) {
  // Read the nonce injected by middleware (used for nonce-based CSP).
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? '';
  const hasTurnstileSiteKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable} ${jakarta.variable} ${lora.variable} ${baskerville.variable} ${spaceMono.variable}`}>
      <head>
        {/* Critical preconnects: resolved early so TLS handshakes don't delay LCP images */}
        <link rel="preconnect" href="https://api.sbali.in" />
        <link rel="preconnect" href="https://cdn.sbali.in" />
        <link rel="preconnect" href="https://minio.sbali.in" />
        {/* Unsplash is used for demo hero images — preconnect reduces TTFB during dev/staging */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/*
          Trusted Types default passthrough policy.
          Required so that legacy third-party scripts (Razorpay, Cloudflare Turnstile,
          older Firebase modules) continue to work when the
          `require-trusted-types-for 'script'` CSP directive is active.
          The nonce allows this inline script to execute under the nonce-based CSP.
        */}
        <script
          nonce={nonce}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
if(window.trustedTypes&&window.trustedTypes.createPolicy){
  try{window.trustedTypes.createPolicy('default',{
    createHTML:function(s){return s},
    createScriptURL:function(s){return s},
    createScript:function(s){return s}
  });}catch(e){}
}`,
          }}
        />
        {hasTurnstileSiteKey && (
          <script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
            nonce={nonce}
          />
        )}
      </head>
      <body className="antialiased">
        {hasTurnstileSiteKey && <div id="turnstile-container" style={{ display: 'none' }} />}
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <SiteSettingsProvider>
                <CartProvider>
                  <WishlistProvider>
                    <Navbar />
                    <main className="page-transition min-h-screen pb-16 lg:pb-0" style={{ paddingTop: 'var(--navbar-offset, 80px)' }}>
                      <AnnouncementBar />
                      <MaintenanceModeGate>{children}</MaintenanceModeGate>
                    </main>
                    <Footer />
                    <BottomNav />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          duration: 4000,
                          iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                  </WishlistProvider>
                </CartProvider>
              </SiteSettingsProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
