// LAYER: Frontend Component
// Top navigation bar featuring application brand, recipe creation shortcut, and "Surprise Me" action.

import Link from 'next/link';
import { UtensilsCrossed, PlusCircle, BookOpen } from 'lucide-react';
import SurpriseMeButton from './SurpriseMeButton';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg sm:text-xl text-stone-900 tracking-tight flex items-center gap-1.5">
              Desi Rasoi
              <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                Recipe Book
              </span>
            </span>
            <p className="text-[11px] text-stone-600 hidden sm:block">
              Server-rendered Next.js + MongoDB
            </p>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stretch Goal: Surprise Me Button */}
          <SurpriseMeButton />

          {/* Browse Recipes Link */}
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>All Recipes</span>
          </Link>

          {/* Add Recipe Action Button */}
          <Link
            href="/add"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-xs hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Recipe</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

