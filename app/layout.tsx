import type { Metadata } from 'next';
import { Playfair_Display, Raleway } from 'next/font/google';
import './globals.css';
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-raleway',
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
      <body className={`${playfair.variable} ${raleway.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
