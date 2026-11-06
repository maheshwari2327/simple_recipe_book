// LAYER: Frontend Component
// Not Found state when an invalid or nonexistent recipe ID is requested.

import Link from 'next/link';
import { ChefHat, ArrowLeft } from 'lucide-react';

export default function RecipeNotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6">
        <ChefHat className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-stone-900 mb-2">Recipe Not Found</h1>
      <p className="text-sm text-stone-600 mb-6">
        The recipe you are looking for does not exist or may have been removed.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to All Recipes</span>
      </Link>
    </div>
  );
}

