import './globals.css';

export const metadata = {
  metadataBase: new URL('https://pay.ghifari.biz.id'),
  title: 'Alpay — QRISKU JIER',
  description: 'Scan bentar, bayar kelar. Saldo pamit, transaksi aman bos 💸',
  icons: {
    icon: '/alpay.svg',
    shortcut: '/alpay.svg',
    apple: '/alpay.svg',
  },
  openGraph: {
    title: 'Alpay — QRISKU JIER',
    description: 'Scan bentar, bayar kelar. Saldo pamit, transaksi aman bos 💸',
    url: 'https://pay.ghifari.biz.id',
    siteName: 'Alpay',
    images: [
      {
        url: '/og-alpay.png',
        width: 1200,
        height: 630,
        alt: 'Alpay — QRISKU JIER',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alpay — QRISKU JIER',
    description: 'Scan bentar, bayar kelar. Saldo pamit, transaksi aman bos 💸',
    images: ['/og-alpay.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#e9edf2] text-slate-900 antialiased selection:bg-[#d8f53b] selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
