import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Интернет-магазин',
  description: 'Полноценный интернет-магазин с Next.js и NestJS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <QueryProvider>
          <Navbar />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

