'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#e9edf2', color: '#0f172a', display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: '#ffffff', borderRadius: '28px', padding: '36px 28px', textAlign: 'center', maxWidth: '420px', width: '100%', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '9999px', background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.05em', marginBottom: '16px', border: '1px solid #fecaca' }}>
            CRITICAL ERROR 500
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>Sistem Mengalami Gangguan</h1>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px 0' }}>
            Terjadi kesalahan runtime aplikasi. Silakan tekan tombol di bawah untuk memuat ulang sistem.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ width: '100%', padding: '14px 24px', borderRadius: '9999px', background: '#0f172a', color: '#ffffff', fontWeight: 'bold', fontSize: '13px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      </body>
    </html>
  );
}
