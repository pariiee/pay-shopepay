import './globals.css';

export const metadata = {
  title: 'SisforHub Pay — Modern ShopeePay & QRIS Gateway',
  description: 'High-performance, stateless QRIS payment gateway and donation portal powered by ShopeePay Partner.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
