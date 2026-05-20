import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import { getLocale } from "next-intl/server";
import './globals.css';

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
  title: 'Artisan Dolls',
  description: 'Artisan Dolls',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${roboto.variable}`}>
        {children}
      </body>
    </html>
  );
}
