// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
// + add modern font
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Desc-Gen',
  description: 'Generate SEO-friendly product descriptions using OpenRouter',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800`}
      >
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_60%)]" />
          <div className="relative container mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow">
              Desc-Gen
            </h1>
            <nav className="hidden sm:flex gap-4 text-sm font-medium text-white/90">
              <a
                href="https://openrouter.ai/"
                target="_blank"
                className="hover:text-white transition-colors"
              >
                OpenRouter
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mt-auto border-t border-slate-200 bg-white/60 backdrop-blur py-4">
          <div className="container mx-auto max-w-5xl px-6 text-xs text-slate-500 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <span>&copy; {new Date().getFullYear()} Product Description Generator</span>
            <span className="italic">Craft better listings faster.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
