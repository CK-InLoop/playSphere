import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PlaySphere - Fun Games for Everyone",
  description: "A collection of fun and engaging games for all ages. Play Tic Tac Toe, 2048, Snake, and more!",
  keywords: ["games", "play", "tic tac toe", "2048", "snake", "memory game", "wordle", "hangman", "breakout", "math quiz"],
  authors: [{ name: 'PlaySphere Team' }],
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Toaster position="bottom-center" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
