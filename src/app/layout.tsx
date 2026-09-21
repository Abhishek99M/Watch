import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Watch | A study in time', description: 'An exploration of watchmaking, detail and considered design.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body></html>;
}
