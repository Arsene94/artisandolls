import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import SiteChrome from "@/components/SiteChrome";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Artisan Dolls — Păpuși Artistice de Colecție',
  description:
    'Păpuși artistice de colecție, realizate manual și personalizate.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${inter.variable} ${roboto.variable}`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
