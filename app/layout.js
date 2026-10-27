import './globals.css';

export const metadata = {
  metadataBase: new URL('https://pay.ghifari.biz.id'),
  title: 'Alpay — QRISNYA QWEH',
  description: 'Scan langsung sat-set anti ribet! Tinggal tap, nominal pas sampai rupiah, langsung lunas detik itu juga no cap 💅⚡',
  icons: {
    icon: '/alpay.svg',
    shortcut: '/alpay.svg',
    apple: '/alpay.svg',
  },
  openGraph: {
    title: 'Alpay — QRISNYA QWEH',
    description: 'Scan langsung sat-set anti ribet! Tinggal tap, nominal pas sampai rupiah, langsung lunas detik itu juga no cap 💅⚡',
    url: 'https://pay.ghifari.biz.id',
    siteName: 'Alpay',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Alpay — QRISNYA QWEH',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alpay — QRISNYA QWEH',
    description: 'Scan langsung sat-set anti ribet! Tinggal tap, langsung lunas detik itu juga no cap 💅⚡',
    images: ['/og.png'],
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
