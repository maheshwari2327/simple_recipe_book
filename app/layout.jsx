// LAYER: Frontend (Root Layout Component)
// Wraps all application routes with consistent navigation, styling, and metadata.

import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Desi Rasoi - Indian Recipe Book',
  description:
    'A simple full-stack Indian Recipe Book built with Next.js App Router, Route Handlers, and official MongoDB driver.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 antialiased min-h-screen flex flex-col">
        {/* Persistent Navigation Bar across all pages */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Informative Footer highlighting the architecture */}
        <footer className="bg-white border-t border-stone-200 py-6 mt-16 text-center text-xs text-stone-600">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>
              <strong className="text-stone-700">Desi Rasoi</strong> — Simple Recipe Book Demo
            </p>
            <p className="flex items-center gap-1.5 flex-wrap justify-center">
              <span>Stack:</span>
              <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">Next.js App Router</span>
              <span>+</span>
              <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">Route Handlers</span>
              <span>+</span>
              <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">MongoDB Driver</span>
              <span>+</span>
              <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">Tailwind CSS</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

