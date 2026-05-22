import type { Metadata } from 'next';
import { Inter, Playfair_Display, Roboto } from 'next/font/google';
import { getLocale } from "next-intl/server";
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Velvet Companions',
  description: 'Închiriere și achiziție discretă de companioni realiști premium.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${playfair.variable} ${roboto.variable} font-sans antialiased bg-silk text-velvet-900`}>
        {children}
      </body>
    </html>
  );
}
