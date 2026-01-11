import { ClerkProvider } from '@/components/providers/clerk-provider';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Providers } from '@/lib/providers';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Chattygraph',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang='en'
        className='h-full'
        suppressHydrationWarning
      >
        <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`} suppressHydrationWarning>
          <Providers>
            <ThemeProvider
              attribute='class'
              defaultTheme='ligth'
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
