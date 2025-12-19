import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flaky Tests Demo - Kubiya',
  description: 'Example repository demonstrating Kubiya intelligent test detection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '15px 30px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>
            Kubiya Demo
          </a>
          <a href="/payments" style={{ color: 'white', textDecoration: 'none' }}>
            Payments
          </a>
          <a href="/users" style={{ color: 'white', textDecoration: 'none' }}>
            Users
          </a>
        </nav>
        {children}
      </body>
    </html>
  );
}
