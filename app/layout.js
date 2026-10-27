import './globals.css';

export const metadata = {
  title: 'Alpay — Modern ShopeePay & QRIS Gateway',
  description: 'High-performance, stateless QRIS payment gateway and donation portal powered by ShopeePay Partner.',
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
