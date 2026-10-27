import './globals.css';

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f172a' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL('https://pay.ghifari.biz.id'),
  title: 'Alpay — QRISKU JIER',
  description:
    'Scan bentar, bayar kelar. Saldo pamit, transaksi langsung aman bos 💸 Terima pembayaran QRIS otomatis dari semua bank dan e-wallet no cap!',
  alternates: {
    canonical: 'https://pay.ghifari.biz.id',
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/alpay.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Alpay — QRISKU JIER',
    description:
      'Scan bentar, bayar kelar. Saldo pamit, transaksi langsung aman bos 💸 Terima pembayaran QRIS otomatis dari semua bank dan e-wallet no cap!',
    url: 'https://pay.ghifari.biz.id',
    siteName: 'Alpay',
    images: [
      {
        url: '/og-alpay.png',
        width: 1200,
        height: 630,
        alt: 'Alpay — QRISKU JIER',
        type: 'image/png',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@alpay_id',
    creator: '@alpay_id',
    title: 'Alpay — QRISKU JIER',
    description:
      'Scan bentar, bayar kelar. Saldo pamit, transaksi langsung aman bos 💸 Terima pembayaran QRIS otomatis dari semua bank dan e-wallet no cap!',
    images: [
      {
        url: '/og-alpay.png',
        alt: 'Alpay — QRISKU JIER',
      },
    ],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Alpay',
  alternateName: 'Alpay — QRISKU JIER',
  url: 'https://pay.ghifari.biz.id',
  description:
    'Scan bentar, bayar kelar. Saldo pamit, transaksi langsung aman bos 💸 Terima pembayaran QRIS otomatis dari semua bank dan e-wallet no cap!',
  inLanguage: 'id-ID',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#e9edf2] text-slate-900 antialiased selection:bg-[#d8f53b] selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
